package com.danielgraham.foldcompanion.domain

/**
 * A tap-to-call entry on the home screen. Both fields are user-editable in
 * Settings; [number] is stored exactly as the owner typed it and is sanitized
 * to a `tel:` string only when dialing.
 */
data class Contact(
    val label: String,
    val number: String,
)

/**
 * Defaults for the four home-screen call slots. These ship as clearly labeled
 * placeholders (no numbers) so a new buyer configures their own lines in
 * Settings. The app dials only via ACTION_DIAL and holds no CALL_PHONE.
 */
object Contacts {
    const val COUNT = 4

    val DEFAULTS: List<Contact> = listOf(
        Contact("Contact 1", ""),
        Contact("Contact 2", ""),
        Contact("Contact 3", ""),
        Contact("Contact 4", ""),
    )
}
