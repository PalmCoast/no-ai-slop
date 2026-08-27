package com.danielgraham.foldcompanion.domain

/** Pure helpers for turning a phone number into a `tel:` dial string. */
object PhoneNumbers {

    /** Keep a single leading '+' and digits only; drop spaces, dashes, parens. */
    fun sanitize(raw: String): String {
        val trimmed = raw.trim()
        val hasPlus = trimmed.startsWith("+")
        val digits = trimmed.filter { it.isDigit() }
        return if (hasPlus) "+$digits" else digits
    }

    /** The URI string handed to ACTION_DIAL, e.g. "tel:+13203356186". */
    fun telUri(raw: String): String = "tel:" + sanitize(raw)
}
