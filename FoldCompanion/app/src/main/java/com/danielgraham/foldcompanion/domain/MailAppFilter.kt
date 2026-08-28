package com.danielgraham.foldcompanion.domain

/**
 * Decides whether a notification came from a mail app we care about
 * (Gmail or Yahoo Mail). Everything else is ignored by the listener.
 */
object MailAppFilter {

    const val GMAIL = "com.google.android.gm"

    private val YAHOO = setOf(
        "com.yahoo.mobile.client.android.mail",
        "com.yahoo.mobile.client.android.mail.att",
    )

    fun isMailApp(packageName: String?): Boolean {
        if (packageName == null) return false
        return packageName == GMAIL || packageName in YAHOO
    }

    /** Friendly source label without querying other apps' metadata. */
    fun sourceLabel(packageName: String?): String = when {
        packageName == GMAIL -> "Gmail"
        packageName in YAHOO -> "Yahoo Mail"
        else -> "Mail"
    }
}
