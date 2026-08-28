package com.danielgraham.foldcompanion.data

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface SavedItemDao {
    @Query("SELECT * FROM saved_items ORDER BY createdAt DESC")
    fun observeAll(): Flow<List<SavedItemEntity>>

    @Insert
    suspend fun insert(item: SavedItemEntity): Long

    @Query("DELETE FROM saved_items WHERE id = :id")
    suspend fun deleteById(id: Long)

    @Query("DELETE FROM saved_items")
    suspend fun clear()

    @Query("SELECT * FROM saved_items ORDER BY createdAt DESC")
    suspend fun getAllOnce(): List<SavedItemEntity>
}

@Dao
interface MailNoticeDao {
    @Query("SELECT * FROM mail_notices ORDER BY postedAt DESC")
    fun observeAll(): Flow<List<MailNoticeEntity>>

    @Insert
    suspend fun insert(notice: MailNoticeEntity): Long

    @Query("DELETE FROM mail_notices")
    suspend fun clear()

    @Query("SELECT * FROM mail_notices ORDER BY postedAt DESC")
    suspend fun getAllOnce(): List<MailNoticeEntity>

    @Query("SELECT COUNT(*) FROM mail_notices WHERE packageName = :pkg AND title = :title AND text = :text AND postedAt = :postedAt")
    suspend fun countDuplicate(pkg: String, title: String, text: String, postedAt: Long): Int
}
