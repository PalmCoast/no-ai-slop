package com.danielgraham.foldcompanion.ui.theme

import androidx.compose.ui.graphics.Color

// Steel (cool blue-grey) neutrals
val Steel900 = Color(0xFF14181C)
val Steel800 = Color(0xFF1E242A)
val Steel700 = Color(0xFF2A323A)
val Steel600 = Color(0xFF3A454F)
val SteelOutline = Color(0xFF55606A)
val SteelAccent = Color(0xFF8CA0B3)
val SteelLight = Color(0xFFB8C2C9)

// Cream warms (used for text and highlights). No orange in the palette.
val Cream = Color(0xFFE9E0CC)
val CreamDim = Color(0xFFC9C0AC)

// Muted, non-orange status colours
val MutedRed = Color(0xFFC58B8B)

/** Container/content pairs for the four call buttons, all on-palette. */
data class CallButtonColors(val container: Color, val content: Color)

val callButtonPalette: List<CallButtonColors> = listOf(
    CallButtonColors(Cream, Steel900),
    CallButtonColors(SteelAccent, Steel900),
    CallButtonColors(Steel700, Cream),
    CallButtonColors(SteelLight, Steel900),
)
