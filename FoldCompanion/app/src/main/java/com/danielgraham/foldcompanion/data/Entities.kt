package com.danielgraham.foldcompanion.data

import androidx.room.Entity
import androidx.room.PrimaryKey

/** A message or job listing the user shared into the app, queued "for Reed". */
@Entity(tableName = "saved_items")
data class SavedItemEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val subject: String,
    val snippet: String,
    val link: String?,
    val source: String,
    val createdAt: Long,
    val forReed: Boolean = true,
)

/** A local record of a new Gmail/Yahoo mail notification (title + preview only). */
@Entity(tableName = "mail_notices")
data class MailNoticeEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val packageName: String,
    val source: String,
    val title: String,
    val text: String,
    val postedAt: Long,
)
