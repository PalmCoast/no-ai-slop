package com.danielgraham.foldcompanion

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import com.danielgraham.foldcompanion.data.SettingsRepository
import com.danielgraham.foldcompanion.domain.Contact
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

/**
 * Proves the four editable contacts, labels, and the agent name persist through
 * DataStore (i.e. survive an app restart).
 */
@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class SettingsPersistenceTest {

    @Test
    fun editedContactsAndAgentNamePersist() = runBlocking {
        val context = ApplicationProvider.getApplicationContext<Context>()
        val repo = SettingsRepository(context)

        val edited = SettingsRepository.DEFAULT.copy(
            name = "Buyer",
            agentName = "Nova",
            contacts = listOf(
                Contact("Desk", "+1 866-985-7234"),
                Contact("Ops", "5093572230"),
                Contact("Sales", ""),
                Contact("Support", "+1 800 000 0000"),
            ),
        )
        repo.save(edited)

        // A fresh repository reading the same store simulates a restart.
        val reloaded = SettingsRepository(context).settings.first()

        assertEquals("Buyer", reloaded.name)
        assertEquals("Nova", reloaded.agentName)
        assertEquals(4, reloaded.contacts.size)
        assertEquals("Desk", reloaded.contacts[0].label)
        assertEquals("+1 866-985-7234", reloaded.contacts[0].number)
        assertEquals("Ops", reloaded.contacts[1].label)
        assertEquals("", reloaded.contacts[2].number)
    }
}
