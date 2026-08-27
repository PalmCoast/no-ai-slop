package com.danielgraham.foldcompanion.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.MarkEmailRead
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.Button
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.danielgraham.foldcompanion.data.MailNoticeEntity
import com.danielgraham.foldcompanion.data.TimeUtil

@Composable
fun MailScreen(
    notices: List<MailNoticeEntity>,
    listenerEnabled: Boolean,
    onOpenListenerSettings: () -> Unit,
    onClear: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(modifier.fillMaxSize().padding(horizontal = 20.dp)) {
        Text(
            text = "Mail notices",
            style = MaterialTheme.typography.headlineMedium,
            modifier = Modifier.padding(top = 20.dp, bottom = 4.dp),
        )
        Text(
            text = "A local list of new Gmail/Yahoo notifications. Read-only. The app never opens, replies to, or sends mail.",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(bottom = 16.dp),
        )

        if (!listenerEnabled) {
            InfoCard(icon = Icons.Filled.Shield, title = "Listener is off") {
                Text(
                    "This feature is optional. Turn it on yourself in system Settings and Fold Companion will start listing new Gmail/Yahoo notifications here. You can turn it off anytime.",
                    style = MaterialTheme.typography.bodyLarge,
                )
                Spacer(Modifier.padding(top = 12.dp))
                Button(onClick = onOpenListenerSettings) {
                    Text("Open notification-access settings")
                }
            }
        } else {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedButton(onClick = onOpenListenerSettings) { Text("Manage access") }
                OutlinedButton(onClick = onClear, enabled = notices.isNotEmpty()) { Text("Clear list") }
            }
            Spacer(Modifier.padding(top = 8.dp))
            if (notices.isEmpty()) {
                InfoCard(modifier = Modifier.padding(top = 12.dp)) {
                    Text("No mail notifications captured yet.", style = MaterialTheme.typography.bodyLarge)
                }
            } else {
                LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    items(notices, key = { it.id }) { notice -> MailRow(notice) }
                }
            }
        }
    }
}

@Composable
private fun MailRow(notice: MailNoticeEntity) {
    InfoCard {
        Row(Modifier.fillMaxWidth()) {
            Icon(Icons.Filled.MarkEmailRead, contentDescription = null)
            Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f)) {
                Text(
                    notice.title,
                    style = MaterialTheme.typography.titleMedium,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                )
                if (notice.text.isNotEmpty()) {
                    Text(
                        notice.text,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        maxLines = 3,
                        overflow = TextOverflow.Ellipsis,
                        modifier = Modifier.padding(top = 4.dp),
                    )
                }
                Text(
                    "${notice.source} · ${TimeUtil.readable(notice.postedAt)}",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(top = 6.dp),
                )
            }
        }
    }
}
