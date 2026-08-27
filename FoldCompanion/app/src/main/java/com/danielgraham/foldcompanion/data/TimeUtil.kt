package com.danielgraham.foldcompanion.data

import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter

/** Formatting helpers. java.time is available from API 26 (our minSdk). */
object TimeUtil {
    private val iso: DateTimeFormatter = DateTimeFormatter.ISO_INSTANT

    fun iso(epochMillis: Long): String = iso.format(Instant.ofEpochMilli(epochMillis))

    private val readable: DateTimeFormatter =
        DateTimeFormatter.ofPattern("MMM d, h:mm a").withZone(ZoneId.systemDefault())

    fun readable(epochMillis: Long): String = readable.format(Instant.ofEpochMilli(epochMillis))

    /** Filesystem-safe timestamp for export file names. */
    fun fileStamp(epochMillis: Long): String =
        DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss")
            .withZone(ZoneId.systemDefault())
            .format(Instant.ofEpochMilli(epochMillis))
}
