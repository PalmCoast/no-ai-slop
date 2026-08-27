package com.danielgraham.foldcompanion.domain

/** The bits we keep from a shared message or job listing. */
data class ParsedShare(
    val subject: String,
    val snippet: String,
    val link: String?,
)

/**
 * Turns the text a user shares from Gmail/Yahoo or a browser into a compact
 * record: a subject, a short snippet, and the first link if present.
 * No network calls, no parsing of anyone else's account.
 */
object ShareIntentParser {

    private val URL = Regex("""https?://\S+""")
    private const val MAX_SUBJECT = 140
    private const val MAX_SNIPPET = 500

    fun parse(subject: String?, text: String?): ParsedShare {
        val body = text?.trim().orEmpty()
        val link = URL.find(body)?.value?.trimEnd('.', ',', ')', ']')

        val cleanedSubject = subject?.trim().orEmpty()
        val effectiveSubject = when {
            cleanedSubject.isNotEmpty() -> cleanedSubject
            link != null -> link
            body.isNotEmpty() -> body.lineSequence().first().trim()
            else -> "Shared item"
        }

        return ParsedShare(
            subject = effectiveSubject.take(MAX_SUBJECT).ifEmpty { "Shared item" },
            snippet = body.take(MAX_SNIPPET),
            link = link,
        )
    }
}
