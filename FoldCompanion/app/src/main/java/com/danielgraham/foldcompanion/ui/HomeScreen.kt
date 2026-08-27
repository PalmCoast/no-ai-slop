package com.danielgraham.foldcompanion.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Call
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.windowsizeclass.WindowWidthSizeClass
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.danielgraham.foldcompanion.domain.Contact
import com.danielgraham.foldcompanion.domain.Contacts
import com.danielgraham.foldcompanion.ui.theme.callButtonPalette

/**
 * Four tap-to-call buttons. Folded (compact width) shows one column; unfolded
 * (medium/expanded width, e.g. the Fold 7 inner screen) shows a two-column grid
 * with larger tap targets.
 */
@Composable
fun HomeScreen(
    widthSizeClass: WindowWidthSizeClass,
    onDial: (Contact) -> Unit,
    modifier: Modifier = Modifier,
) {
    val unfolded = widthSizeClass != WindowWidthSizeClass.Compact
    val columns = if (unfolded) 2 else 1
    val tileHeight = if (unfolded) 148.dp else 104.dp

    Column(modifier.fillMaxSize().padding(horizontal = 20.dp)) {
        Text(
            text = "Route it off the phone",
            style = MaterialTheme.typography.headlineMedium,
            color = MaterialTheme.colorScheme.onBackground,
            modifier = Modifier.padding(top = 20.dp, bottom = 4.dp),
        )
        Text(
            text = "Tap to open the dialer. Fold Companion never places or records calls.",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(bottom = 16.dp),
        )

        LazyVerticalGrid(
            columns = GridCells.Fixed(columns),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            horizontalArrangement = Arrangement.spacedBy(16.dp),
            contentPadding = PaddingValues(bottom = 24.dp),
            modifier = Modifier.fillMaxWidth(),
        ) {
            items(Contacts.ALL) { contact ->
                val index = Contacts.ALL.indexOf(contact)
                val palette = callButtonPalette[index % callButtonPalette.size]
                CallButton(
                    contact = contact,
                    container = palette.container,
                    content = palette.content,
                    height = tileHeight,
                    onClick = { onDial(contact) },
                )
            }
        }
    }
}

@Composable
private fun CallButton(
    contact: Contact,
    container: Color,
    content: Color,
    height: androidx.compose.ui.unit.Dp,
    onClick: () -> Unit,
) {
    Card(
        onClick = onClick,
        shape = RoundedCornerShape(22.dp),
        colors = CardDefaults.cardColors(containerColor = container, contentColor = content),
        modifier = Modifier
            .fillMaxWidth()
            .heightIn(min = height)
            .semantics { contentDescription = "Call ${contact.label} at ${contact.display}" },
    ) {
        Box(Modifier.fillMaxSize().padding(20.dp), contentAlignment = Alignment.CenterStart) {
            Column {
                Icon(Icons.Filled.Call, contentDescription = null)
                Text(
                    text = contact.label,
                    style = MaterialTheme.typography.titleLarge,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.padding(top = 8.dp),
                )
                Text(
                    text = contact.display,
                    style = MaterialTheme.typography.bodyLarge,
                )
            }
        }
    }
}
