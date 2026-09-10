import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { router } from "../netlify/functions/api";
import { MemoryStore, useStore } from "../netlify/lib/store";

function req(path: string, init: RequestInit = {}): Request {
  return new Request(`http://flick.test${path}`, init);
}

describe("clips API", () => {
  beforeEach(() => useStore(new MemoryStore()));
  afterEach(() => useStore(null));

  it("reports health", async () => {
    const res = await router.handle(req("/api/health"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { service: string };
    expect(body.service).toBe("flick");
  });

  it("rejects a tiny recording", async () => {
    const res = await router.handle(
      req("/api/clips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Nope",
          mimeType: "video/webm",
          durationMs: 10,
          width: 640,
          height: 360,
          size: 64,
          chunkCount: 1,
          mode: "demo",
        }),
      }),
    );
    expect(res.status).toBe(400);
  });

  it("uploads chunks and serves the video", async () => {
    const payload = new Uint8Array(128).map((_, i) => i);
    const created = await router.handle(
      req("/api/clips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Demo",
          mimeType: "video/webm",
          durationMs: 1200,
          width: 640,
          height: 360,
          size: payload.byteLength,
          chunkCount: 1,
          mode: "demo",
        }),
      }),
    );
    expect(created.status).toBe(201);
    const meta = (await created.json()) as { id: string };
    expect(meta.id).toMatch(/^[a-z0-9]{10}$/);

    const hidden = await router.handle(req(`/api/clips/${meta.id}`));
    expect(hidden.status).toBe(404);

    const put = await router.handle(
      req(`/api/clips/${meta.id}/chunks/0`, { method: "PUT", body: payload }),
    );
    expect(put.status).toBe(200);

    const done = await router.handle(req(`/api/clips/${meta.id}/complete`, { method: "POST" }));
    expect(done.status).toBe(200);
    const ready = (await done.json()) as { status: string; title: string };
    expect(ready.status).toBe("ready");
    expect(ready.title).toBe("Demo");

    const shown = await router.handle(req(`/api/clips/${meta.id}`));
    expect(shown.status).toBe(200);

    const video = await router.handle(req(`/api/clips/${meta.id}/video`));
    expect(video.status).toBe(200);
    expect(video.headers.get("Content-Type")).toBe("video/webm");
    const bytes = new Uint8Array(await video.arrayBuffer());
    expect(Array.from(bytes)).toEqual(Array.from(payload));
  });
});
