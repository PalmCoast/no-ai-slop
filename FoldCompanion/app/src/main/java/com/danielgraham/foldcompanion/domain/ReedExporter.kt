package com.danielgraham.foldcompanion.domain

/** Owner block written at the top of every export. */
data class ExportOwner(
    val name: String,
    val emails: List<String>,
    val note: String,
)

data class ExportSavedItem(
    val subject: String,
    val snippet: String,
    val link: String?,
    val source: String,
    val savedAtIso: String,
)

data class ExportMailNotice(
    val source: String,
    val title: String,
    val text: String,
    val postedAtIso: String,
)

data class ReedExport(
    val exportedAtIso: String,
    val owner: ExportOwner,
    val savedItems: List<ExportSavedItem>,
    val mailNotices: List<ExportMailNotice>,
)

/**
 * Serialises a [ReedExport] to JSON or plain text. This is the only thing
 * "Export for Reed" writes, and it only ever goes to a local file the user
 * chose. No server, no upload.
 */
object ReedExporter {

    fun toJson(export: ReedExport): String = buildString {
        append("{\n")
        append("  \"exportedAt\": ").append(str(export.exportedAtIso)).append(",\n")
        append("  \"generatedBy\": ").append(str("Fold Companion")).append(",\n")
        append("  \"owner\": {\n")
        append("    \"name\": ").append(str(export.owner.name)).append(",\n")
        append("    \"emails\": ").append(arr(export.owner.emails)).append(",\n")
        append("    \"note\": ").append(str(export.owner.note)).append("\n")
        append("  },\n")
        append("  \"forReed\": {\n")
        append("    \"savedItems\": ")
        appendSavedItems(export.savedItems, indent = "    ")
        append(",\n")
        append("    \"mailNotices\": ")
        appendMailNotices(export.mailNotices, indent = "    ")
        append("\n  }\n")
        append("}\n")
    }

    fun toPlainText(export: ReedExport): String = buildString {
        append("Fold Companion — export for Reed\n")
        append("Exported: ").append(export.exportedAtIso).append("\n")
        append("Owner: ").append(export.owner.name).append("\n")
        append("Emails: ").append(export.owner.emails.joinToString(", ")).append("\n")
        append("Note: ").append(export.owner.note).append("\n")
        append("\n--- Saved items (").append(export.savedItems.size).append(") ---\n")
        export.savedItems.forEachIndexed { i, item ->
            append(i + 1).append(". ").append(item.subject).append("\n")
            append("   source: ").append(item.source)
                .append("  saved: ").append(item.savedAtIso).append("\n")
            if (!item.link.isNullOrEmpty()) append("   link: ").append(item.link).append("\n")
            if (item.snippet.isNotEmpty()) append("   ").append(item.snippet).append("\n")
        }
        append("\n--- Mail notices (").append(export.mailNotices.size).append(") ---\n")
        export.mailNotices.forEachIndexed { i, n ->
            append(i + 1).append(". [").append(n.source).append("] ").append(n.title).append("\n")
            if (n.text.isNotEmpty()) append("   ").append(n.text).append("\n")
            append("   ").append(n.postedAtIso).append("\n")
        }
    }

    private fun StringBuilder.appendSavedItems(items: List<ExportSavedItem>, indent: String) {
        if (items.isEmpty()) {
            append("[]")
            return
        }
        append("[\n")
        items.forEachIndexed { index, item ->
            append(indent).append("  {\n")
            append(indent).append("    \"subject\": ").append(str(item.subject)).append(",\n")
            append(indent).append("    \"snippet\": ").append(str(item.snippet)).append(",\n")
            append(indent).append("    \"link\": ").append(strOrNull(item.link)).append(",\n")
            append(indent).append("    \"source\": ").append(str(item.source)).append(",\n")
            append(indent).append("    \"savedAt\": ").append(str(item.savedAtIso)).append("\n")
            append(indent).append("  }")
            append(if (index == items.lastIndex) "\n" else ",\n")
        }
        append(indent).append("]")
    }

    private fun StringBuilder.appendMailNotices(items: List<ExportMailNotice>, indent: String) {
        if (items.isEmpty()) {
            append("[]")
            return
        }
        append("[\n")
        items.forEachIndexed { index, n ->
            append(indent).append("  {\n")
            append(indent).append("    \"source\": ").append(str(n.source)).append(",\n")
            append(indent).append("    \"title\": ").append(str(n.title)).append(",\n")
            append(indent).append("    \"text\": ").append(str(n.text)).append(",\n")
            append(indent).append("    \"postedAt\": ").append(str(n.postedAtIso)).append("\n")
            append(indent).append("  }")
            append(if (index == items.lastIndex) "\n" else ",\n")
        }
        append(indent).append("]")
    }

    private fun arr(values: List<String>): String =
        values.joinToString(prefix = "[", postfix = "]") { str(it) }

    private fun strOrNull(value: String?): String = if (value == null) "null" else str(value)

    /** JSON string literal with the mandatory escapes. */
    private fun str(value: String): String = buildString {
        append('"')
        for (c in value) {
            when (c) {
                '\\' -> append("\\\\")
                '"' -> append("\\\"")
                '\n' -> append("\\n")
                '\r' -> append("\\r")
                '\t' -> append("\\t")
                '\b' -> append("\\b")
                '\u000C' -> append("\\f")
                else -> if (c < ' ') append("\\u%04x".format(c.code)) else append(c)
            }
        }
        append('"')
    }
}
