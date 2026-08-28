package com.danielgraham.foldcompanion

import com.danielgraham.foldcompanion.domain.ExportMailNotice
import com.danielgraham.foldcompanion.domain.ExportOwner
import com.danielgraham.foldcompanion.domain.ExportSavedItem
import com.danielgraham.foldcompanion.domain.ReedExport
import com.danielgraham.foldcompanion.domain.ReedExporter
import org.junit.Assert.assertTrue
import org.junit.Test

class ReedExporterTest {

    private fun sample() = ReedExport(
        exportedAtIso = "2026-08-27T10:00:00Z",
        agentName = "Reed",
        owner = ExportOwner(
            name = "Daniel Graham",
            emails = listOf("Daniel@agenthiveinc.com", "coltsinsider@gmail.com"),
            note = "Reed lives on desktop.",
        ),
        savedItems = listOf(
            ExportSavedItem(
                subject = "Job: \"Android\" role",
                snippet = "Line one\nLine two",
                link = "https://example.com/x",
                source = "Shared",
                savedAtIso = "2026-08-27T09:00:00Z",
            ),
        ),
        mailNotices = listOf(
            ExportMailNotice("Gmail", "New message", "Preview text", "2026-08-27T08:00:00Z"),
        ),
    )

    @Test
    fun jsonEscapesQuotesAndNewlines() {
        val json = ReedExporter.toJson(sample())
        assertTrue(json.contains("\\\"Android\\\""))
        assertTrue(json.contains("Line one\\nLine two"))
    }

    @Test
    fun jsonContainsOwnerAndSections() {
        val json = ReedExporter.toJson(sample())
        assertTrue(json.contains("\"name\": \"Daniel Graham\""))
        assertTrue(json.contains("\"agent\": \"Reed\""))
        assertTrue(json.contains("\"forAgent\""))
        assertTrue(json.contains("\"savedItems\""))
        assertTrue(json.contains("\"mailNotices\""))
        assertTrue(json.contains("\"link\": \"https://example.com/x\""))
    }

    @Test
    fun usesCustomAgentNameInText() {
        val text = ReedExporter.toPlainText(sample().copy(agentName = "Nova"))
        assertTrue(text.contains("export for Nova"))
    }

    @Test
    fun jsonIsWellFormedEnough_balancedBraces() {
        val json = ReedExporter.toJson(sample())
        val open = json.count { it == '{' }
        val close = json.count { it == '}' }
        assertTrue(open == close && open > 0)
    }

    @Test
    fun nullLinkSerialisesAsJsonNull() {
        val export = sample().copy(
            savedItems = listOf(
                ExportSavedItem("No link", "body", null, "Shared", "2026-08-27T09:00:00Z"),
            ),
        )
        val json = ReedExporter.toJson(export)
        assertTrue(json.contains("\"link\": null"))
    }

    @Test
    fun plainTextListsItems() {
        val text = ReedExporter.toPlainText(sample())
        assertTrue(text.contains("export for Reed"))
        assertTrue(text.contains("Saved items (1)"))
        assertTrue(text.contains("Mail notices (1)"))
        assertTrue(text.contains("Daniel Graham"))
    }
}
