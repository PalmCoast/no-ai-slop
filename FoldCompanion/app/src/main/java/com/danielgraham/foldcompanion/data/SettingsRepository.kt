package com.danielgraham.foldcompanion.data

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.danielgraham.foldcompanion.domain.Contact
import com.danielgraham.foldcompanion.domain.Contacts
import com.danielgraham.foldcompanion.domain.ContactsCodec
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

/** The editable identity/settings shown on the Settings screen. */
data class UserSettings(
    val name: String,
    val emails: List<String>,
    /** Name of the buyer's desktop agent (default "Reed"). */
    val agentName: String,
    /** Free-text note about where the desktop agent lives. */
    val agentNote: String,
    /** The four editable home-screen call slots. */
    val contacts: List<Contact>,
)

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "settings")

class SettingsRepository(private val context: Context) {

    private object Keys {
        val NAME = stringPreferencesKey("name")
        val EMAILS = stringPreferencesKey("emails")
        val AGENT_NAME = stringPreferencesKey("agent_name")
        val AGENT_NOTE = stringPreferencesKey("agent_note")
        val CONTACTS = stringPreferencesKey("contacts")
    }

    val settings: Flow<UserSettings> = context.dataStore.data.map { prefs -> read(prefs) }

    private fun read(prefs: Preferences): UserSettings = UserSettings(
        name = prefs[Keys.NAME] ?: DEFAULT.name,
        emails = prefs[Keys.EMAILS]?.split("\n")?.filter { it.isNotBlank() } ?: DEFAULT.emails,
        agentName = prefs[Keys.AGENT_NAME]?.takeIf { it.isNotBlank() } ?: DEFAULT.agentName,
        agentNote = prefs[Keys.AGENT_NOTE] ?: DEFAULT.agentNote,
        contacts = ContactsCodec.decode(prefs[Keys.CONTACTS]),
    )

    suspend fun save(settings: UserSettings) {
        context.dataStore.edit { prefs ->
            prefs[Keys.NAME] = settings.name.trim()
            prefs[Keys.EMAILS] = settings.emails.map { it.trim() }.filter { it.isNotEmpty() }
                .joinToString("\n")
            prefs[Keys.AGENT_NAME] = settings.agentName.trim().ifEmpty { DEFAULT.agentName }
            prefs[Keys.AGENT_NOTE] = settings.agentNote.trim()
            prefs[Keys.CONTACTS] = ContactsCodec.encode(
                settings.contacts.map { Contact(it.label.trim(), it.number.trim()) },
            )
        }
    }

    companion object {
        val DEFAULT = UserSettings(
            name = "",
            emails = emptyList(),
            agentName = "Reed",
            agentNote = "Your desktop agent lives on the desktop, not on this phone.",
            contacts = Contacts.DEFAULTS,
        )
    }
}
