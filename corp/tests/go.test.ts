import { describe, expect, it } from "vitest";
import { config } from "../netlify/functions/go";
import { GO_LINKS, goTarget } from "../shared/go-links";

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

  it("sends the ad sprint buttons to the supplied checkout links", () => {
    const sprint = new URL(goTarget("ads-sprint", "ads")!);
    const monthly = new URL(goTarget("ads-engine", "ads")!);
    expect(sprint.origin + sprint.pathname).toBe("https://buy.stripe.com/5kQ00j0wke5layVbuq2ZO1L");
    expect(sprint.searchParams.get("client_reference_id")).toBe("ah_ads_ads-sprint");
    expect(sprint.searchParams.get("utm_campaign")).toBe("ads-sprint");
    expect(monthly.origin + monthly.pathname).toBe("https://buy.stripe.com/4gM9ATa6U2mD36tbuq2ZO1M");
    expect(monthly.searchParams.get("client_reference_id")).toBe("ah_ads_ads-engine");
    expect(monthly.searchParams.get("utm_source")).toBe("agenthiveinc.com");
    expect(GO_LINKS["ads-sprint"].kind).toBe("stripe");
    expect(GO_LINKS["ads-engine"].kind).toBe("stripe");
  });
});
