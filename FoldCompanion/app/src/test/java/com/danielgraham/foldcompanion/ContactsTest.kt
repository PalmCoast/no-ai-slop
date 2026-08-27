package com.danielgraham.foldcompanion

import com.danielgraham.foldcompanion.domain.Contacts
import com.danielgraham.foldcompanion.domain.PhoneNumbers
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class ContactsTest {

    @Test
    fun hasExactlyTheFourDestinations() {
        val labels = Contacts.ALL.map { it.label }
        assertEquals(listOf("First Deploy", "AgentHive", "Front desk", "Promoter"), labels)
    }

    @Test
    fun numbersMatchTheRequestedOnes() {
        val byLabel = Contacts.ALL.associate { it.label to it.e164 }
        assertEquals("+13203356186", byLabel["First Deploy"])
        assertEquals("+15093572230", byLabel["AgentHive"])
        assertEquals("+18669857234", byLabel["Front desk"])
        assertEquals("+19152944711", byLabel["Promoter"])
    }

    @Test
    fun everyDisplayNumberSanitizesToItsE164() {
        Contacts.ALL.forEach { c ->
            assertEquals(c.e164, PhoneNumbers.sanitize(c.display))
        }
    }

    @Test
    fun everyNumberIsElevenDigitUsFormat() {
        Contacts.ALL.forEach { c ->
            assertTrue(c.e164.startsWith("+1"))
            assertEquals(12, c.e164.length) // "+1" + 10 digits
        }
    }
}
