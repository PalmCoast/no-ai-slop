package com.danielgraham.foldcompanion.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

/**
 * The app is dark cream/steel by design, so we use one dark scheme regardless
 * of the system light/dark setting. No dynamic colour (it can pull in orange).
 */
private val FoldColorScheme = darkColorScheme(
    primary = SteelAccent,
    onPrimary = Steel900,
    primaryContainer = Steel600,
    onPrimaryContainer = Cream,
    secondary = Cream,
    onSecondary = Steel800,
    secondaryContainer = Steel700,
    onSecondaryContainer = Cream,
    tertiary = SteelLight,
    onTertiary = Steel900,
    background = Steel900,
    onBackground = Cream,
    surface = Steel800,
    onSurface = Cream,
    surfaceVariant = Steel700,
    onSurfaceVariant = CreamDim,
    outline = SteelOutline,
    outlineVariant = Steel600,
    error = MutedRed,
    onError = Steel900,
)

@Composable
fun FoldCompanionTheme(
    @Suppress("UNUSED_PARAMETER") darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    MaterialTheme(
        colorScheme = FoldColorScheme,
        typography = AppTypography,
        content = content,
    )
}
