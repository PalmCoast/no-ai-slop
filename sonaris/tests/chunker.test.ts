import { describe, expect, it } from "vitest";
import { createSentenceChunker, splitSentences } from "../src/chunker";

describe("splitSentences", () => {
  it("splits on . ? ! followed by whitespace and keeps the remainder", () => {
    const r = splitSentences("Hello there, friend. How are you today? I am fine! And this is unfin", 4);
    expect(r.sentences).toEqual(["Hello there, friend.", "How are you today?", "I am fine!"]);
    expect(r.rest).toBe("And this is unfin");
  });

  it("does not split on a period without trailing space (3.14, e.g.)", () => {
    const r = splitSentences("Pi is about 3.14 and that is enough for now. Next", 4);
    expect(r.sentences).toEqual(["Pi is about 3.14 and that is enough for now."]);
    expect(r.rest).toBe("Next");
  });

  it("merges very short sentences with the following one", () => {
    const r = splitSentences("Yes. That is right, we can do that tomorrow morning. Ok", 12);
    expect(r.sentences).toEqual(["Yes. That is right, we can do that tomorrow morning."]);
    expect(r.rest).toBe("Ok");
  });

  it("keeps closing quotes with the sentence", () => {
    const r = splitSentences('She said "go now." Then she left.', 4);
    expect(r.sentences).toEqual(['She said "go now."', "Then she left."]);
  });
});

describe("createSentenceChunker (streaming)", () => {
  it("emits sentences as soon as their boundary arrives across chunks", () => {
    const c = createSentenceChunker(4);
    expect(c.push("The harbour is ca")).toEqual([]);
    expect(c.push("lm tonight. The tide")).toEqual(["The harbour is calm tonight."]);
    expect(c.push(" turns at six")).toEqual([]);
    expect(c.buffered).toBe("The tide turns at six");
    expect(c.flush()).toEqual(["The tide turns at six"]);
    expect(c.buffered).toBe("");
  });

  it("flush on an empty buffer returns nothing", () => {
    const c = createSentenceChunker();
    expect(c.flush()).toEqual([]);
  });
});
