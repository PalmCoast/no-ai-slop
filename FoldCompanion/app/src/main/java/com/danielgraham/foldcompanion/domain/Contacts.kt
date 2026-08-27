package com.danielgraham.foldcompanion.domain

/** A tap-to-call entry on the home screen. */
data class Contact(
    val label: String,
    /** Human-readable number shown under the label. */
    val display: String,
    /** Digits (with leading +) used to build the dialer intent. */
    val e164: String,
)

/**
 * The four fixed destinations Daniel routes work to.
 * These are dialled through the system dialer (ACTION_DIAL); the app never
 * places a call on its own and holds no CALL_PHONE permission.
 */
object Contacts {
    val ALL: List<Contact> = listOf(
        Contact("First Deploy", "+1 320-335-6186", "+13203356186"),
        Contact("AgentHive", "+1 509-357-2230", "+15093572230"),
        Contact("Front desk", "+1 866-985-7234", "+18669857234"),
        Contact("Promoter", "+1 915-294-4711", "+19152944711"),
    )
}
