package com.danielgraham.foldcompanion

import com.danielgraham.foldcompanion.domain.PhoneNumbers
import org.junit.Assert.assertEquals
import org.junit.Test

class PhoneNumbersTest {

    @Test
    fun sanitize_keepsLeadingPlusAndDigits() {
        assertEquals("+13203356186", PhoneNumbers.sanitize("+1 320-335-6186"))
    }

    @Test
    fun sanitize_stripsParensAndSpaces() {
        assertEquals("+18669857234", PhoneNumbers.sanitize("+1 (866) 985 7234"))
    }

    @Test
    fun sanitize_withoutPlus() {
        assertEquals("3203356186", PhoneNumbers.sanitize("320.335.6186"))
    }

    @Test
    fun telUri_hasTelScheme() {
        assertEquals("tel:+15093572230", PhoneNumbers.telUri("+1 509-357-2230"))
    }
}
