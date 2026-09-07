/**
 * Splits a streaming text response into sentences so text-to-speech can start
 * on the first sentence while the rest is still arriving.
 */

const BOUNDARY = /([.!?]+["')\]]?)(\s+|$)/;

export interface SentenceChunker {
  /** Feed a chunk of streamed text. Returns any complete sentences. */
  push(text: string): string[];
  /** Flush whatever is left (end of stream). */
  flush(): string[];
  /** Text accumulated so far, complete or not. */
  readonly buffered: string;
}

/**
 * Splits `text` into complete sentences plus a trailing remainder. Sentences
 * shorter than `minChars` are merged with the next one so the TTS queue is
 * not flooded with one-word requests ("Yes." "Right.").
 */
export function splitSentences(text: string, minChars = 12): { sentences: string[]; rest: string } {
  const sentences: string[] = [];
  let rest = text;
  let carry = "";
  for (;;) {
    const m = BOUNDARY.exec(rest);
    if (!m || m.index === undefined) break;
    const end = m.index + m[1]!.length;
    const sentence = (carry + rest.slice(0, end)).trim();
    rest = rest.slice(end + m[2]!.length);
    if (sentence.length < minChars && rest.length > 0) {
      carry = sentence + " ";
      continue;
    }
    carry = "";
    if (sentence) sentences.push(sentence);
  }
  return { sentences, rest: (carry + rest).trimStart() };
}

export function createSentenceChunker(minChars = 12): SentenceChunker {
  let buffer = "";
  return {
    get buffered() {
      return buffer;
    },
    push(text: string) {
      buffer += text;
      const { sentences, rest } = splitSentences(buffer, minChars);
      buffer = rest;
      return sentences;
    },
    flush() {
      const out = buffer.trim();
      buffer = "";
      return out ? [out] : [];
    },
  };
}
