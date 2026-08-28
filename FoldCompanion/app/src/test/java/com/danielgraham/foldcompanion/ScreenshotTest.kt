package com.danielgraham.foldcompanion

import androidx.compose.material3.Surface
import androidx.compose.material3.windowsizeclass.WindowWidthSizeClass
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onRoot
import com.danielgraham.foldcompanion.data.MailNoticeEntity
import com.danielgraham.foldcompanion.data.SavedItemEntity
import com.danielgraham.foldcompanion.data.UserSettings
import com.danielgraham.foldcompanion.domain.Contact
import com.danielgraham.foldcompanion.ui.ForReedScreen
import com.danielgraham.foldcompanion.ui.HomeScreen
import com.danielgraham.foldcompanion.ui.MailScreen
import com.danielgraham.foldcompanion.ui.SettingsScreen
import com.danielgraham.foldcompanion.ui.theme.FoldCompanionTheme
import com.github.takahirom.roborazzi.captureRoboImage
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode

private const val OUT = "/opt/cursor/artifacts/screenshots"

@RunWith(RobolectricTestRunner::class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)
@Config(sdk = [34])
class ScreenshotTest {

    @get:Rule
    val compose = createComposeRule()

    private fun sampleItems() = listOf(
        SavedItemEntity(
            id = 1,
            subject = "Contract: Senior Android (foldables)",
            snippet = "Saw your profile — 6-month contract, remote. Apply here.",
            link = "https://jobs.example.com/android-fold",
            source = "Shared",
            createdAt = 1_756_300_000_000,
        ),
        SavedItemEntity(
            id = 2,
            subject = "Re: Deploy schedule",
            snippet = "Confirming Thursday 9am for the First Deploy run.",
            link = null,
            source = "Shared",
            createdAt = 1_756_200_000_000,
        ),
    )

    private fun sampleContacts() = listOf(
        Contact("First Deploy", "+1 320-335-6186"),
        Contact("AgentHive", "+1 509-357-2230"),
        Contact("Front desk", "+1 866-985-7234"),
        Contact("Promoter", "+1 915-294-4711"),
    )

    private fun sampleSettings() = UserSettings(
        name = "",
        emails = listOf("you@example.com"),
        agentName = "Reed",
        agentNote = "Your desktop agent lives on the desktop, not on this phone.",
        contacts = sampleContacts(),
    )

    private fun sampleMail() = listOf(
        MailNoticeEntity(1, "com.google.android.gm", "Gmail", "New: interview confirmation", "Tuesday 2pm works.", 1_756_300_500_000),
        MailNoticeEntity(2, "com.yahoo.mobile.client.android.mail", "Yahoo Mail", "Invoice #4471 paid", "Payment received.", 1_756_260_000_000),
    )

    @Test
    @Config(qualifiers = "w411dp-h914dp-xhdpi")
    fun home_folded() {
        compose.setContent {
            FoldCompanionTheme { Surface { HomeScreen(WindowWidthSizeClass.Compact, sampleContacts(), {}) } }
        }
        compose.onRoot().captureRoboImage("$OUT/home_folded.png")
    }

    @Test
    @Config(qualifiers = "w900dp-h820dp-xhdpi")
    fun home_unfolded() {
        compose.setContent {
            FoldCompanionTheme { Surface { HomeScreen(WindowWidthSizeClass.Expanded, sampleContacts(), {}) } }
        }
        compose.onRoot().captureRoboImage("$OUT/home_unfolded.png")
    }

    @Test
    @Config(qualifiers = "w411dp-h914dp-xhdpi")
    fun forReed_folded() {
        compose.setContent {
            FoldCompanionTheme {
                Surface { ForReedScreen(items = sampleItems(), agentName = "Reed", onExport = {}, onDelete = {}, onClear = {}) }
            }
        }
        compose.onRoot().captureRoboImage("$OUT/for_reed.png")
    }

    @Test
    @Config(qualifiers = "w411dp-h914dp-xhdpi")
    fun mail_folded() {
        compose.setContent {
            FoldCompanionTheme {
                Surface {
                    MailScreen(
                        notices = sampleMail(),
                        listenerEnabled = true,
                        onOpenListenerSettings = {},
                        onClear = {},
                    )
                }
            }
        }
        compose.onRoot().captureRoboImage("$OUT/mail_list.png")
    }

    @Test
    @Config(qualifiers = "w411dp-h914dp-xhdpi")
    fun mail_listenerOff() {
        compose.setContent {
            FoldCompanionTheme {
                Surface {
                    MailScreen(
                        notices = emptyList(),
                        listenerEnabled = false,
                        onOpenListenerSettings = {},
                        onClear = {},
                    )
                }
            }
        }
        compose.onRoot().captureRoboImage("$OUT/mail_listener_off.png")
    }

    @Test
    @Config(qualifiers = "w900dp-h820dp-xhdpi")
    fun settings_unfolded() {
        compose.setContent {
            FoldCompanionTheme {
                Surface {
                    SettingsScreen(
                        settings = sampleSettings(),
                        listenerEnabled = false,
                        onSave = {},
                        onOpenListenerSettings = {},
                    )
                }
            }
        }
        compose.onRoot().captureRoboImage("$OUT/settings.png")
    }
}
