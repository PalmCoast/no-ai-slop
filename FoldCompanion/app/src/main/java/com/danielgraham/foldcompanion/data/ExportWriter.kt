package com.danielgraham.foldcompanion.data

import android.content.ContentValues
import android.content.Context
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import androidx.annotation.RequiresApi
import java.io.File

/** Where an export landed, for showing the user afterwards. */
data class ExportResult(val displayPath: String)

/**
 * Writes an export file to the device's Downloads folder.
 *
 * API 29+  -> MediaStore Downloads (scoped storage, no permission needed).
 * API 26-28 -> the app's own external files dir; we do NOT request the legacy
 *              WRITE_EXTERNAL_STORAGE permission, so the file stays app-scoped.
 * The Fold 7 runs Android 14+, so the MediaStore path is what actually runs.
 */
object ExportWriter {

    private const val SUBDIR = "FoldCompanion"

    fun write(context: Context, fileName: String, mimeType: String, content: String): ExportResult {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            writeToMediaStore(context, fileName, mimeType, content)
        } else {
            writeToAppFiles(context, fileName, content)
        }
    }

    @RequiresApi(Build.VERSION_CODES.Q)
    private fun writeToMediaStore(
        context: Context,
        fileName: String,
        mimeType: String,
        content: String,
    ): ExportResult {
        val resolver = context.contentResolver
        val values = ContentValues().apply {
            put(MediaStore.Downloads.DISPLAY_NAME, fileName)
            put(MediaStore.Downloads.MIME_TYPE, mimeType)
            put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/" + SUBDIR)
            put(MediaStore.Downloads.IS_PENDING, 1)
        }
        val uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values)
            ?: error("Could not create the export file in Downloads.")
        resolver.openOutputStream(uri)?.use { it.write(content.toByteArray(Charsets.UTF_8)) }
            ?: error("Could not open the export file for writing.")
        values.clear()
        values.put(MediaStore.Downloads.IS_PENDING, 0)
        resolver.update(uri, values, null, null)
        return ExportResult("Downloads/$SUBDIR/$fileName")
    }

    private fun writeToAppFiles(context: Context, fileName: String, content: String): ExportResult {
        val dir = context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS) ?: context.filesDir
        val file = File(dir, fileName)
        file.writeText(content, Charsets.UTF_8)
        return ExportResult(file.absolutePath)
    }
}
