package com.danielgraham.foldcompanion

import com.danielgraham.foldcompanion.domain.Contact
import com.danielgraham.foldcompanion.domain.Contacts
import com.danielgraham.foldcompanion.domain.PhoneNumbers
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class ContactsTest {

    @Test
    fun defaultsAreFourClearlyLabeledPlaceholders() {
        assertEquals(4, Contacts.COUNT)
        assertEquals(4, Contacts.DEFAULTS.size)
        Contacts.DEFAULTS.forEachIndexed { i, c ->
            assertEquals("Contact ${i + 1}", c.label)
            assertTrue("default numbers must be empty placeholders", c.number.isEmpty())
        }
    }

    @Test
    fun editedNumbersSanitizeToDialString() {
        assertEquals("tel:+18669857234", PhoneNumbers.telUri(Contact("Front desk", "+1 866-985-7234").number))
        assertEquals("tel:+15093572230", PhoneNumbers.telUri(Contact("Ops", "+1 (509) 357-2230").number))
    }
}
