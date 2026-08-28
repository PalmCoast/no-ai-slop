package com.danielgraham.foldcompanion.notify

import android.app.Notification
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import com.danielgraham.foldcompanion.data.AppDatabase
import com.danielgraham.foldcompanion.data.MailNoticeEntity
import com.danielgraham.foldcompanion.domain.MailAppFilter
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

/**
 * Reads ONLY Gmail/Yahoo mail notifications and keeps a local list.
 *
 * It does nothing until the user enables it in system Settings. It never
 * dismisses, replies to, or forwards notifications, never touches other apps,
 * and never sends anything off the device.
 */
class MailNotificationListenerService : NotificationListenerService() {

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        val notification = sbn ?: return
        val pkg = notification.packageName
        if (!MailAppFilter.isMailApp(pkg)) return

        val extras = notification.notification?.extras ?: return
        val title = extras.getCharSequence(Notification.EXTRA_TITLE)?.toString()?.trim().orEmpty()
        val text = (extras.getCharSequence(Notification.EXTRA_BIG_TEXT)
            ?: extras.getCharSequence(Notification.EXTRA_TEXT))
            ?.toString()?.trim().orEmpty()

        if (title.isEmpty() && text.isEmpty()) return

        val entity = MailNoticeEntity(
            packageName = pkg,
            source = MailAppFilter.sourceLabel(pkg),
            title = title.ifEmpty { "(no subject)" },
            text = text,
            postedAt = notification.postTime,
        )

        val dao = AppDatabase.get(applicationContext).mailNoticeDao()
        scope.launch {
            val dup = dao.countDuplicate(entity.packageName, entity.title, entity.text, entity.postedAt)
            if (dup == 0) dao.insert(entity)
        }
    }

    // We deliberately ignore removals; the local list is Daniel's to clear.
    override fun onNotificationRemoved(sbn: StatusBarNotification?) = Unit
}
