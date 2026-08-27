package com.danielgraham.foldcompanion.data

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

/** The editable identity/settings shown on the Settings screen. */
data class UserSettings(
    val name: String,
    val emails: List<String>,
    val reedNote: String,
)

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "settings")

class SettingsRepository(private val context: Context) {

    private object Keys {
        val NAME = stringPreferencesKey("name")
        val EMAILS = stringPreferencesKey("emails")
        val NOTE = stringPreferencesKey("reed_note")
    }

    val settings: Flow<UserSettings> = context.dataStore.data.map { prefs ->
        UserSettings(
            name = prefs[Keys.NAME] ?: DEFAULT.name,
            emails = prefs[Keys.EMAILS]?.split("\n")?.filter { it.isNotBlank() } ?: DEFAULT.emails,
            reedNote = prefs[Keys.NOTE] ?: DEFAULT.reedNote,
        )
    }

    suspend fun save(settings: UserSettings) {
        context.dataStore.edit { prefs ->
            prefs[Keys.NAME] = settings.name.trim()
            prefs[Keys.EMAILS] = settings.emails.map { it.trim() }.filter { it.isNotEmpty() }
                .joinToString("\n")
            prefs[Keys.NOTE] = settings.reedNote.trim()
        }
    }

    companion object {
        val DEFAULT = UserSettings(
            name = "Daniel Graham",
            emails = listOf(
                "Daniel@agenthiveinc.com",
                "coltsinsider@gmail.com",
                "coltsinsider@yahoo.com",
            ),
            reedNote = "Reed / Grok Bot lives on desktop, not on this phone.",
        )
    }
}
