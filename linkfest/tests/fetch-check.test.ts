import { describe, expect, it } from "vitest";
import { checkPublicPage, isBlockedIp } from "../shared/fetch-check";
import { allowCheck } from "../netlify/lib/check-api";

const PUBLIC = ["93.184.216.34"];

function htmlResponse(body: string, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(body, {
    status,
    headers: { "content-type": "text/html; charset=utf-8", ...headers },
  });
}

describe("address guards", () => {
  it("blocks loopback, link-local, and private ranges", () => {
    expect(isBlockedIp("127.0.0.1")).toBe(true);
    expect(isBlockedIp("10.1.2.3")).toBe(true);
    expect(isBlockedIp("192.168.1.9")).toBe(true);
    expect(isBlockedIp("169.254.169.254")).toBe(true);
    expect(isBlockedIp("172.16.0.4")).toBe(true);
    expect(isBlockedIp("::1")).toBe(true);
    expect(isBlockedIp("::ffff:127.0.0.1")).toBe(true);
    expect(isBlockedIp("93.184.216.34")).toBe(false);
  });
});

describe("checkPublicPage", () => {
  it("reports a named follow link", async () => {
    const result = await checkPublicPage("https://example.com/thanks", {
      lookup: async () => PUBLIC,
      fetch: async () => htmlResponse(`<a href="https://indexme.lol/">IndexMe.lol</a>`),
    });
    expect(result.status).toBe("linked");
    expect(result.links[0]?.text).toBe("IndexMe.lol");
    expect(result.note).toContain("IndexMe.lol");
  });

  it("does not fetch a private or credentialed URL", async () => {
    let called = false;
    const fetchImpl = async () => {
      called = true;
      return htmlResponse("nope");
    };
    const blocked = await checkPublicPage("http://169.254.169.254/latest", {
      lookup: async () => ["169.254.169.254"],
      fetch: fetchImpl,
    });
    const secret = await checkPublicPage("https://user:pass@example.com/", {
      lookup: async () => PUBLIC,
      fetch: fetchImpl,
    });
    const oddPort = await checkPublicPage("https://example.com:8080/", {
      lookup: async () => PUBLIC,
      fetch: fetchImpl,
    });
    expect(blocked.status).toBe("blocked");
    expect(secret.status).toBe("blocked");
    expect(oddPort.status).toBe("blocked");
    expect(called).toBe(false);
  });

  it("stops when a redirect points at loopback", async () => {
    const result = await checkPublicPage("https://example.com/go", {
      lookup: async () => PUBLIC,
      fetch: async () =>
        new Response(null, { status: 302, headers: { location: "http://127.0.0.1/secret" } }),
    });
    expect(result.status).toBe("blocked");
  });

  it("stops when DNS resolves to a private address", async () => {
    let called = false;
    const result = await checkPublicPage("https://example.com/", {
      lookup: async () => ["10.0.0.8"],
      fetch: async () => {
        called = true;
        return htmlResponse("nope");
      },
    });
    expect(result.status).toBe("blocked");
    expect(called).toBe(false);
  });

  it("reports a page that loaded with no credit link", async () => {
    const result = await checkPublicPage("example.com/post", {
      lookup: async () => PUBLIC,
      fetch: async () => htmlResponse("<p>A rewrite of the checklist, with the link left off.</p>"),
    });
    expect(result.status).toBe("missing");
    expect(result.url).toBe("https://example.com/post");
  });
});

describe("allowCheck", () => {
  it("allows a short burst and then asks the caller to wait", () => {
    const ip = `test-${Date.now()}`;
    for (let i = 0; i < 12; i += 1) expect(allowCheck(ip, 1_000 + i)).toBe(true);
    expect(allowCheck(ip, 1_050)).toBe(false);
    expect(allowCheck(ip, 62_000)).toBe(true);
  });
});
