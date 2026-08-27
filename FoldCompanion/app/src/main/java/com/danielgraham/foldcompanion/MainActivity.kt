package com.danielgraham.foldcompanion

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.material3.windowsizeclass.ExperimentalMaterial3WindowSizeClassApi
import androidx.compose.material3.windowsizeclass.calculateWindowSizeClass
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import com.danielgraham.foldcompanion.domain.Contact
import com.danielgraham.foldcompanion.domain.PhoneNumbers
import com.danielgraham.foldcompanion.notify.NotificationAccess
import com.danielgraham.foldcompanion.ui.AppRoot
import com.danielgraham.foldcompanion.ui.CompanionViewModel
import com.danielgraham.foldcompanion.ui.theme.FoldCompanionTheme

class MainActivity : ComponentActivity() {

    private val viewModel: CompanionViewModel by viewModels()
    private var listenerEnabled by mutableStateOf(false)

    @OptIn(ExperimentalMaterial3WindowSizeClassApi::class)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        handleShare(intent)

        setContent {
            FoldCompanionTheme {
                val windowSizeClass = calculateWindowSizeClass(this)
                AppRoot(
                    windowSizeClass = windowSizeClass,
                    viewModel = viewModel,
                    listenerEnabled = listenerEnabled,
                    onDial = ::dial,
                    onOpenListenerSettings = ::openListenerSettings,
                )
            }
        }
    }

    override fun onResume() {
        super.onResume()
        listenerEnabled = NotificationAccess.isEnabled(this)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        handleShare(intent)
    }

    /** Save a shared Gmail/Yahoo message or job listing "for Reed". */
    private fun handleShare(intent: Intent?) {
        if (intent?.action != Intent.ACTION_SEND) return
        if (intent.type?.startsWith("text/") != true) return
        val subject = intent.getStringExtra(Intent.EXTRA_SUBJECT)
        val text = intent.getStringExtra(Intent.EXTRA_TEXT)
        if (subject.isNullOrBlank() && text.isNullOrBlank()) return
        viewModel.saveShared(subject, text)
    }

    /** Open the dialer with the number pre-filled. The user taps call. */
    private fun dial(contact: Contact) {
        if (contact.number.isBlank()) {
            Toast.makeText(this, "Add a number for this button in Settings.", Toast.LENGTH_SHORT).show()
            return
        }
        val intent = Intent(Intent.ACTION_DIAL, Uri.parse(PhoneNumbers.telUri(contact.number)))
        try {
            startActivity(intent)
        } catch (e: Exception) {
            Toast.makeText(this, "No dialer available on this device.", Toast.LENGTH_SHORT).show()
        }
    }

    private fun openListenerSettings() {
        try {
            startActivity(NotificationAccess.settingsIntent())
        } catch (e: Exception) {
            Toast.makeText(this, "Could not open settings.", Toast.LENGTH_SHORT).show()
        }
    }
}
