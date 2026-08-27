package com.danielgraham.foldcompanion

import com.danielgraham.foldcompanion.domain.Contact
import com.danielgraham.foldcompanion.domain.Contacts
import com.danielgraham.foldcompanion.domain.ContactsCodec
import org.junit.Assert.assertEquals
import org.junit.Test

/** The persistence encoding for the four editable contacts. */
class ContactsCodecTest {

    @Test
    fun roundTripsFourContacts() {
        val list = listOf(
            Contact("First Deploy", "+13203356186"),
            Contact("AgentHive", "+1 509-357-2230"),
            Contact("Front desk", ""),
            Contact("Promoter", "(915) 294-4711"),
        )
        assertEquals(list, ContactsCodec.decode(ContactsCodec.encode(list)))
    }

    @Test
    fun emptyOrNullDecodesToDefaults() {
        assertEquals(Contacts.DEFAULTS, ContactsCodec.decode(null))
        assertEquals(Contacts.DEFAULTS, ContactsCodec.decode(""))
    }

    @Test
    fun padsToFourWhenFewerStored() {
        val decoded = ContactsCodec.decode(ContactsCodec.encode(listOf(Contact("One", "1"))))
        assertEquals(4, decoded.size)
        assertEquals(Contact("One", "1"), decoded[0])
    }

    @Test
    fun preservesLabelsWithSpacesAndSymbols() {
        val list = List(4) { Contact("Line #${it + 1} (main)", "+1 800-000-000$it") }
        assertEquals(list, ContactsCodec.decode(ContactsCodec.encode(list)))
    }
}
