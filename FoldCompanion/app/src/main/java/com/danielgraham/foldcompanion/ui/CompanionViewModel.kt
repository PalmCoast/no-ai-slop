package com.danielgraham.foldcompanion.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.danielgraham.foldcompanion.data.AppDatabase
import com.danielgraham.foldcompanion.data.ExportWriter
import com.danielgraham.foldcompanion.data.MailNoticeEntity
import com.danielgraham.foldcompanion.data.SavedItemEntity
import com.danielgraham.foldcompanion.data.SettingsRepository
import com.danielgraham.foldcompanion.data.TimeUtil
import com.danielgraham.foldcompanion.data.UserSettings
import com.danielgraham.foldcompanion.domain.ExportMailNotice
import com.danielgraham.foldcompanion.domain.ExportOwner
import com.danielgraham.foldcompanion.domain.ExportSavedItem
import com.danielgraham.foldcompanion.domain.ReedExport
import com.danielgraham.foldcompanion.domain.ReedExporter
import com.danielgraham.foldcompanion.domain.ShareIntentParser
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class CompanionViewModel(app: Application) : AndroidViewModel(app) {

    private val db = AppDatabase.get(app)
    private val savedItemDao = db.savedItemDao()
    private val mailNoticeDao = db.mailNoticeDao()
    private val settingsRepo = SettingsRepository(app)

    val savedItems: StateFlow<List<SavedItemEntity>> =
        savedItemDao.observeAll().stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val mailNotices: StateFlow<List<MailNoticeEntity>> =
        mailNoticeDao.observeAll().stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val settings: StateFlow<UserSettings> =
        settingsRepo.settings.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), SettingsRepository.DEFAULT)

    private val _exportStatus = kotlinx.coroutines.flow.MutableStateFlow<String?>(null)
    val exportStatus: StateFlow<String?> = _exportStatus
    fun consumeExportStatus() { _exportStatus.value = null }

    private val _lastSavedSubject = kotlinx.coroutines.flow.MutableStateFlow<String?>(null)
    val lastSavedSubject: StateFlow<String?> = _lastSavedSubject
    fun consumeLastSaved() { _lastSavedSubject.value = null }

    /** Persist a shared message/listing "for Reed". */
    fun saveShared(subject: String?, text: String?) {
        val parsed = ShareIntentParser.parse(subject, text)
        viewModelScope.launch {
            savedItemDao.insert(
                SavedItemEntity(
                    subject = parsed.subject,
                    snippet = parsed.snippet,
                    link = parsed.link,
                    source = "Shared",
                    createdAt = System.currentTimeMillis(),
                    forReed = true,
                ),
            )
            _lastSavedSubject.value = parsed.subject
        }
    }

    fun deleteItem(id: Long) = viewModelScope.launch { savedItemDao.deleteById(id) }
    fun clearItems() = viewModelScope.launch { savedItemDao.clear() }
    fun clearMail() = viewModelScope.launch { mailNoticeDao.clear() }

    fun saveSettings(settings: UserSettings) = viewModelScope.launch { settingsRepo.save(settings) }

    /** Build the export and write JSON + text to Downloads. Nothing leaves the device. */
    fun exportForReed() = viewModelScope.launch {
        val now = System.currentTimeMillis()
        val current = settings.value
        val items = savedItemDao.getAllOnce().map { it.toExport() }
        val notices = mailNoticeDao.getAllOnce().map { it.toExport() }
        val export = ReedExport(
            exportedAtIso = TimeUtil.iso(now),
            owner = ExportOwner(current.name, current.emails, current.reedNote),
            savedItems = items,
            mailNotices = notices,
        )
        val stamp = TimeUtil.fileStamp(now)
        val app = getApplication<Application>()
        val json = ExportWriter.write(app, "reed-export-$stamp.json", "application/json", ReedExporter.toJson(export))
        ExportWriter.write(app, "reed-export-$stamp.txt", "text/plain", ReedExporter.toPlainText(export))
        _exportStatus.value = "Exported ${items.size} item(s) to ${json.displayPath}"
    }

    private fun SavedItemEntity.toExport() = ExportSavedItem(
        subject = subject,
        snippet = snippet,
        link = link,
        source = source,
        savedAtIso = TimeUtil.iso(createdAt),
    )

    private fun MailNoticeEntity.toExport() = ExportMailNotice(
        source = source,
        title = title,
        text = text,
        postedAtIso = TimeUtil.iso(postedAt),
    )
}
