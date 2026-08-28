package com.danielgraham.foldcompanion.notify

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.provider.Settings

/** Helpers for the user-controlled notification-listener grant. */
object NotificationAccess {

    /** True only if the user has ticked this app in system Settings. */
    fun isEnabled(context: Context): Boolean {
        val component = ComponentName(context, MailNotificationListenerService::class.java)
        val flat = Settings.Secure.getString(
            context.contentResolver,
            "enabled_notification_listeners",
        ) ?: return false
        return flat.split(":").any {
            val cn = ComponentName.unflattenFromString(it)
            cn != null && cn == component
        }
    }

    /** Opens the system screen where the user grants/revokes the access. */
    fun settingsIntent(): Intent =
        Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
}
