package com.danielgraham.foldcompanion.ui

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationRail
import androidx.compose.material3.NavigationRailItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.windowsizeclass.WindowSizeClass
import androidx.compose.material3.windowsizeclass.WindowWidthSizeClass
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import com.danielgraham.foldcompanion.domain.Contact
import kotlinx.coroutines.launch

private enum class Destination(val label: String, val icon: ImageVector) {
    HOME("Home", Icons.Filled.Home),
    REED("For Reed", Icons.AutoMirrored.Filled.Send),
    MAIL("Mail", Icons.Filled.Email),
    SETTINGS("Settings", Icons.Filled.Settings),
}

@Composable
fun AppRoot(
    windowSizeClass: WindowSizeClass,
    viewModel: CompanionViewModel,
    listenerEnabled: Boolean,
    onDial: (Contact) -> Unit,
    onOpenListenerSettings: () -> Unit,
) {
    var current by rememberSaveable { mutableStateOf(Destination.HOME) }
    val compact = windowSizeClass.widthSizeClass == WindowWidthSizeClass.Compact

    val savedItems by viewModel.savedItems.collectAsState()
    val mailNotices by viewModel.mailNotices.collectAsState()
    val settings by viewModel.settings.collectAsState()
    val exportStatus by viewModel.exportStatus.collectAsState()
    val lastSaved by viewModel.lastSavedSubject.collectAsState()

    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()

    LaunchedEffect(exportStatus) {
        exportStatus?.let {
            scope.launch { snackbarHostState.showSnackbar(it) }
            viewModel.consumeExportStatus()
        }
    }
    LaunchedEffect(lastSaved) {
        lastSaved?.let {
            current = Destination.REED
            scope.launch { snackbarHostState.showSnackbar("Saved for Reed: $it") }
            viewModel.consumeLastSaved()
        }
    }

    val content: @Composable (Modifier) -> Unit = { modifier ->
        when (current) {
            Destination.HOME -> HomeScreen(windowSizeClass.widthSizeClass, onDial, modifier)
            Destination.REED -> ForReedScreen(
                items = savedItems,
                onExport = viewModel::exportForReed,
                onDelete = { viewModel.deleteItem(it) },
                onClear = viewModel::clearItems,
                modifier = modifier,
            )
            Destination.MAIL -> MailScreen(
                notices = mailNotices,
                listenerEnabled = listenerEnabled,
                onOpenListenerSettings = onOpenListenerSettings,
                onClear = viewModel::clearMail,
                modifier = modifier,
            )
            Destination.SETTINGS -> SettingsScreen(
                settings = settings,
                listenerEnabled = listenerEnabled,
                onSave = { viewModel.saveSettings(it) },
                onOpenListenerSettings = onOpenListenerSettings,
                modifier = modifier,
            )
        }
    }

    Surface(color = MaterialTheme.colorScheme.background) {
        if (compact) {
            Scaffold(
                snackbarHost = { SnackbarHost(snackbarHostState) },
                bottomBar = {
                    NavigationBar {
                        Destination.entries.forEach { dest ->
                            NavigationBarItem(
                                selected = current == dest,
                                onClick = { current = dest },
                                icon = { Icon(dest.icon, contentDescription = dest.label) },
                                label = { Text(dest.label) },
                            )
                        }
                    }
                },
            ) { padding -> content(Modifier.padding(padding)) }
        } else {
            Row(Modifier.fillMaxSize()) {
                NavigationRail {
                    Destination.entries.forEach { dest ->
                        NavigationRailItem(
                            selected = current == dest,
                            onClick = { current = dest },
                            icon = { Icon(dest.icon, contentDescription = dest.label) },
                            label = { Text(dest.label) },
                        )
                    }
                }
                Scaffold(
                    snackbarHost = { SnackbarHost(snackbarHostState) },
                    modifier = Modifier.fillMaxSize(),
                ) { padding -> content(Modifier.padding(padding)) }
            }
        }
    }
}
