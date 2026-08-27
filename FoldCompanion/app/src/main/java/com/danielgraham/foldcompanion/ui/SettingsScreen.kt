package com.danielgraham.foldcompanion.ui

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.danielgraham.foldcompanion.data.UserSettings

@Composable
fun SettingsScreen(
    settings: UserSettings,
    listenerEnabled: Boolean,
    onSave: (UserSettings) -> Unit,
    onOpenListenerSettings: () -> Unit,
    modifier: Modifier = Modifier,
) {
    var name by remember(settings) { mutableStateOf(settings.name) }
    var emails by remember(settings) { mutableStateOf(settings.emails.joinToString("\n")) }
    var note by remember(settings) { mutableStateOf(settings.reedNote) }

    Column(
        modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 20.dp),
    ) {
        Text(
            text = "Settings",
            style = MaterialTheme.typography.headlineMedium,
            modifier = Modifier.padding(top = 20.dp, bottom = 16.dp),
        )

        OutlinedTextField(
            value = name,
            onValueChange = { name = it },
            label = { Text("Your name") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
        )
        Spacer(Modifier.padding(top = 12.dp))
        OutlinedTextField(
            value = emails,
            onValueChange = { emails = it },
            label = { Text("Your emails (one per line)") },
            modifier = Modifier.fillMaxWidth(),
        )
        Spacer(Modifier.padding(top = 12.dp))
        OutlinedTextField(
            value = note,
            onValueChange = { note = it },
            label = { Text("Note about Reed") },
            modifier = Modifier.fillMaxWidth(),
        )
        Spacer(Modifier.padding(top = 16.dp))
        Button(
            onClick = {
                onSave(
                    UserSettings(
                        name = name,
                        emails = emails.split("\n").map { it.trim() }.filter { it.isNotEmpty() },
                        reedNote = note,
                    ),
                )
            },
        ) { Text("Save") }

        Spacer(Modifier.padding(top = 20.dp))
        InfoCard(title = "Mail listener") {
            Text(
                if (listenerEnabled) {
                    "On. Fold Companion lists new Gmail/Yahoo notifications locally."
                } else {
                    "Off. You can enable it yourself; it stays read-only and local."
                },
                style = MaterialTheme.typography.bodyLarge,
            )
            Spacer(Modifier.padding(top = 12.dp))
            OutlinedButton(onClick = onOpenListenerSettings) {
                Text("Notification-access settings")
            }
        }

        Spacer(Modifier.padding(top = 16.dp))
        InfoCard(icon = Icons.Filled.Lock, title = "What this app will not do") {
            Text(
                "• This will not record calls.\n" +
                    "• No background microphone, no call audio, ever.\n" +
                    "• No reading SMS, passwords, or other apps' screens.\n" +
                    "• No accessibility clicking, no overlays, no device admin.\n" +
                    "• No internet permission: nothing leaves the phone unless you tap Export.\n" +
                    "• Reed / Grok Bot lives on the desktop, not on this phone.",
                style = MaterialTheme.typography.bodyLarge,
            )
        }
        Spacer(Modifier.padding(top = 24.dp))
    }
}
