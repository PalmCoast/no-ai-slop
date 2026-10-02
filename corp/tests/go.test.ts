import { describe, expect, it } from "vitest";
import { config } from "../netlify/functions/go";
import { GO_LINKS, goTarget, isAuditSrc } from "../shared/go-links";

describe("/go tracker", () => {
  it("is a first-class function path", () => {
    expect(config).toMatchObject({ path: "/go/:name" });
  });

  it("hands First Deploy to the firstdeploy.ai tracker with from=x", () => {
    expect(goTarget("first-deploy", "x")).toBe("https://firstdeploy.ai/go/start?from=x");
  });

  it("tags Stripe links with client_reference_id and utm_source=x", () => {
    const u = new URL(goTarget("concierge", "x")!);
    expect(u.origin + u.pathname).toBe(GO_LINKS.concierge.url);
    expect(u.searchParams.get("client_reference_id")).toBe("ah_x_concierge");
    expect(u.searchParams.get("utm_source")).toBe("x");
  });

  it("404s unknown names", () => {
    expect(goTarget("nope", "x")).toBeNull();
  });

  it("treats ?src=audit as an audit run (no Stripe redirect)", () => {
    expect(isAuditSrc("audit")).toBe(true);
    expect(isAuditSrc("audit-0930")).toBe(true);
    expect(isAuditSrc("gads")).toBe(false);
    expect(isAuditSrc(null)).toBe(false);
  });
});
