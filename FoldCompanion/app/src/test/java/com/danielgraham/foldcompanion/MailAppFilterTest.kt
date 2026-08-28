package com.danielgraham.foldcompanion

import com.danielgraham.foldcompanion.domain.MailAppFilter
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class MailAppFilterTest {

    @Test
    fun recognisesGmail() {
        assertTrue(MailAppFilter.isMailApp("com.google.android.gm"))
        assertEquals("Gmail", MailAppFilter.sourceLabel("com.google.android.gm"))
    }

    @Test
    fun recognisesYahoo() {
        assertTrue(MailAppFilter.isMailApp("com.yahoo.mobile.client.android.mail"))
        assertEquals("Yahoo Mail", MailAppFilter.sourceLabel("com.yahoo.mobile.client.android.mail"))
    }

    @Test
    fun ignoresOtherApps() {
        assertFalse(MailAppFilter.isMailApp("com.whatsapp"))
        assertFalse(MailAppFilter.isMailApp("com.android.messaging"))
        assertFalse(MailAppFilter.isMailApp(null))
    }
}
