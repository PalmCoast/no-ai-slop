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
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Upload
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.danielgraham.foldcompanion.data.SavedItemEntity
import com.danielgraham.foldcompanion.data.TimeUtil

@Composable
fun ForReedScreen(
    items: List<SavedItemEntity>,
    onExport: () -> Unit,
    onDelete: (Long) -> Unit,
    onClear: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(modifier.fillMaxSize().padding(horizontal = 20.dp)) {
        Text(
            text = "For Reed",
            style = MaterialTheme.typography.headlineMedium,
            modifier = Modifier.padding(top = 20.dp, bottom = 4.dp),
        )
        Text(
            text = "Items you shared in, queued for the desktop bot. Export writes a JSON + text file to Downloads. Nothing uploads on its own.",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(bottom = 16.dp),
        )

        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Button(
                onClick = onExport,
                enabled = items.isNotEmpty(),
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    contentColor = MaterialTheme.colorScheme.onPrimary,
                ),
            ) {
                Icon(Icons.Filled.Upload, contentDescription = null)
                Spacer(Modifier.width(8.dp))
                Text("Export for Reed")
            }
            OutlinedButton(onClick = onClear, enabled = items.isNotEmpty()) {
                Text("Clear all")
            }
        }

        Spacer(Modifier.padding(top = 8.dp))

        if (items.isEmpty()) {
            InfoCard(modifier = Modifier.padding(top = 12.dp)) {
                Text(
                    "Nothing saved yet. Share a Gmail/Yahoo message or a job listing into Fold Companion and it lands here.",
                    style = MaterialTheme.typography.bodyLarge,
                )
            }
        } else {
            LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                items(items, key = { it.id }) { item ->
                    SavedItemRow(item = item, onDelete = { onDelete(item.id) })
                }
            }
        }
    }
}

@Composable
private fun SavedItemRow(item: SavedItemEntity, onDelete: () -> Unit) {
    InfoCard {
        Row(Modifier.fillMaxWidth()) {
            Column(Modifier.weight(1f)) {
                Text(
                    item.subject,
                    style = MaterialTheme.typography.titleMedium,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                )
                if (item.snippet.isNotEmpty()) {
                    Text(
                        item.snippet,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        maxLines = 3,
                        overflow = TextOverflow.Ellipsis,
                        modifier = Modifier.padding(top = 4.dp),
                    )
                }
                if (!item.link.isNullOrEmpty()) {
                    Text(
                        item.link,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.primary,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        modifier = Modifier.padding(top = 4.dp),
                    )
                }
                Text(
                    "${item.source} · ${TimeUtil.readable(item.createdAt)} · for Reed",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(top = 6.dp),
                )
            }
            IconButton(onClick = onDelete) {
                Icon(Icons.Filled.Delete, contentDescription = "Delete ${item.subject}")
            }
        }
    }
}
