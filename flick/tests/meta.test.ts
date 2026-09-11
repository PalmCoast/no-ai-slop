import { describe, expect, it } from "vitest";
import { HOME_META, PRICING_META, metaForPath } from "../shared/meta";

describe("share meta", () => {
  it("uses the Loom-replacement promise on home", () => {
    expect(metaForPath("/")).toEqual(HOME_META);
    expect(HOME_META.description).toMatch(/doesn't make your viewer sign up/i);
    expect(HOME_META.image).toMatch(/\/og\.png$/);
  });

  it("uses pricing copy and the pricing card image on /pricing", () => {
    expect(metaForPath("/pricing")).toEqual(PRICING_META);
    expect(metaForPath("/pricing/")).toEqual(PRICING_META);
    expect(PRICING_META.title).toMatch(/Street \$0/);
    expect(PRICING_META.image).toMatch(/og-pricing\.png$/);
  });
});
