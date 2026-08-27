package com.danielgraham.foldcompanion.domain

/**
 * Serializes the four editable contacts to/from a single string for DataStore.
 * Uses ASCII control separators (unit/record) that never appear in a typed
 * label or phone number, so it round-trips user text safely.
 */
object ContactsCodec {
    private const val FIELD = "\u001F" // unit separator between label and number
    private const val RECORD = "\u001E" // record separator between contacts

    fun encode(contacts: List<Contact>): String =
        contacts.joinToString(RECORD) { it.label + FIELD + it.number }

    fun decode(raw: String?): List<Contact> {
        if (raw.isNullOrEmpty()) return Contacts.DEFAULTS
        val parsed = raw.split(RECORD).map { record ->
            val parts = record.split(FIELD)
            Contact(
                label = parts.getOrElse(0) { "" },
                number = parts.getOrElse(1) { "" },
            )
        }
        // Always present exactly COUNT slots, padding/truncating defensively.
        return when {
            parsed.size == Contacts.COUNT -> parsed
            parsed.size > Contacts.COUNT -> parsed.take(Contacts.COUNT)
            else -> parsed + Contacts.DEFAULTS.drop(parsed.size)
        }
    }
}
