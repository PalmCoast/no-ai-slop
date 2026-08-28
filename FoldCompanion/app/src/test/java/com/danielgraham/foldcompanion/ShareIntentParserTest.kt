package com.danielgraham.foldcompanion

import com.danielgraham.foldcompanion.domain.ShareIntentParser
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class ShareIntentParserTest {

    @Test
    fun extractsSubjectSnippetAndLink() {
        val result = ShareIntentParser.parse(
            subject = "Contract role: Android dev",
            text = "Great fit for you. Apply here https://jobs.example.com/123 today.",
        )
        assertEquals("Contract role: Android dev", result.subject)
        assertEquals("https://jobs.example.com/123", result.link)
        assertTrue(result.snippet.startsWith("Great fit"))
    }

    @Test
    fun usesLinkAsSubjectWhenSubjectMissing() {
        val result = ShareIntentParser.parse(
            subject = null,
            text = "https://linkedin.com/jobs/view/999",
        )
        assertEquals("https://linkedin.com/jobs/view/999", result.subject)
        assertEquals("https://linkedin.com/jobs/view/999", result.link)
    }

    @Test
    fun fallsBackToFirstLineWhenNoSubjectOrLink() {
        val result = ShareIntentParser.parse(
            subject = "   ",
            text = "Interview Tuesday 2pm\nBring the deck",
        )
        assertEquals("Interview Tuesday 2pm", result.subject)
        assertNull(result.link)
    }

    @Test
    fun trimsTrailingPunctuationFromLink() {
        val result = ShareIntentParser.parse(null, "See https://example.com/post.")
        assertEquals("https://example.com/post", result.link)
    }

    @Test
    fun handlesEmptyInput() {
        val result = ShareIntentParser.parse(null, null)
        assertEquals("Shared item", result.subject)
        assertEquals("", result.snippet)
        assertNull(result.link)
    }
}
