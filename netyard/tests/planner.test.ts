import { describe, expect, it } from "vitest";
import { describeCidr, inRange, offsetAddress } from "../shared/cidr.ts";
import { buildNaming, sanitizeDomain, suggestDomain } from "../shared/naming.ts";
import { generatePlan } from "../shared/planner.ts";
import { DEMO_ANSWERS, defaultAnswers, validateAnswers } from "../shared/questions.ts";
import { directoryMode } from "../shared/directory.ts";
import { WINDOWS_SERVER_STANDARD_USD, WINDOWS_USER_CAL_USD } from "../shared/microsoft.ts";
import { applyRouteHtml, canonicalFor, PAGE_SEO } from "../shared/seo.ts";
import { NEEDS, type Answers } from "../shared/types.ts";
import { needsVlans } from "../shared/addressing.ts";
import { apCount, bomTotal, switchPorts } from "../shared/bom.ts";

const shop: Answers = { ...DEMO_ANSWERS };

describe("naming", () => {
  it("builds a .lan domain and 15-char NetBIOS from a shop name", () => {
    expect(suggestDomain("Coastal Plumbing")).toBe("coastalplumbing.lan");
    const naming = buildNaming("Coastal Plumbing", "coastalplumbing.lan");
    expect(naming.realm).toBe("COASTALPLUMBING.LAN");
    expect(naming.netbios).toBe("COASTALPLUMBING");
    expect(naming.netbios.length).toBeLessThanOrEqual(15);
    expect(naming.dcFqdn).toBe("dc01.coastalplumbing.lan");
  });

  it("rewrites .local to .lan and prefixes a leading digit", () => {
    expect(sanitizeDomain("4paws.local")).toBe("s4paws.lan");
    expect(sanitizeDomain("")).toBe("shop.lan");
  });
});

describe("cidr", () => {
  it("computes usable range and DHCP after the reserved block", () => {
    const info = describeCidr("10.10.10.40/24");
    expect(info.network).toBe("10.10.10.0");
    expect(info.gateway).toBe("10.10.10.1");
    expect(info.broadcast).toBe("10.10.10.255");
    expect(info.usable).toBe(254);
    expect(info.dhcpStart).toBe("10.10.10.50");
    expect(info.mask).toBe("255.255.255.0");
    expect(inRange("10.10.10.50", info.dhcpStart, info.dhcpEnd)).toBe(true);
    expect(offsetAddress("10.10.20.0", 10)).toBe("10.10.20.10");
  });
});

describe("planner", () => {
  it("rejects a blank shop", () => {
    expect(validateAnswers(defaultAnswers()).length).toBeGreaterThan(0);
  });

  it("builds a VLAN Samba AD plan for a 12-person Windows shop", () => {
    const plan = generatePlan(shop);
    expect(plan.directory.mode).toBe("samba-ad");
    expect(plan.naming.netbios).toBe("COASTALPLUMBING");
    expect(plan.networks.map((n) => n.name)).toEqual(expect.arrayContaining(["Staff", "Servers", "Guest", "Mgmt"]));
    expect(plan.networks.find((n) => n.name === "Staff")?.vlan).toBe(10);
    expect(plan.networks.find((n) => n.name === "Guest")?.cidr).toBe("10.10.30.0/24");
    const dc = plan.hosts.find((h) => h.name === "dc01");
    expect(dc?.address).toBe("10.10.20.10");
    const staff = plan.networks.find((n) => n.name === "Staff")!;
    expect(inRange(dc!.address, staff.dhcpStart!, staff.dhcpEnd!)).toBe(false);
    expect(plan.vpn?.kind).toBe("wireguard");
    expect(plan.wifi.ssids.some((s) => s.name.includes("Guest"))).toBe(true);
    expect(plan.microsoft.windowsTotalUsd).toBe(WINDOWS_SERVER_STANDARD_USD + 12 * WINDOWS_USER_CAL_USD);
    expect(plan.microsoft.sambaLicenseUsd).toBe(0);
    expect(plan.microsoft.savingsUsd).toBe(plan.microsoft.windowsTotalUsd);
    expect(plan.files.some((f) => f.filename === "install-office-server.sh")).toBe(true);
    const script = plan.files.find((f) => f.filename === "install-office-server.sh")!.contents;
    expect(script).toContain("samba-tool domain provision");
    expect(script).toContain("COASTALPLUMBING.LAN");
    expect(script).toContain("ADMIN_PASS");
    expect(script).not.toMatch(/TODO|lorem|password123/i);
    expect(plan.firewall.some((r) => r.from === "Guest" && r.to === "Staff" && r.action === "deny")).toBe(true);
    expect(plan.summary).toMatch(/12-person/);
  });

  it("keeps a thrifty solo shop on a flat LAN when guest is off", () => {
    const plan = generatePlan({
      businessName: "Solo Desk",
      domain: "solodesk.lan",
      headcount: "solo",
      peopleCount: 2,
      needs: ["files"],
      desktops: "windows",
      sites: "one",
      gear: "thrifty",
    });
    expect(needsVlans(plan.answers)).toBe(false);
    expect(plan.networks).toHaveLength(1);
    expect(plan.networks[0]?.cidr).toBe("192.168.10.0/24");
    expect(plan.vpn).toBeNull();
  });

  it("skips Samba AD for Chromebooks without files", () => {
    expect(
      directoryMode({
        ...shop,
        desktops: "chrome",
        needs: ["guestWifi"],
        peopleCount: 6,
        headcount: "solo",
      }),
    ).toBe("none");
  });

  it("uses a workgroup for Mac file sharing", () => {
    const plan = generatePlan({
      ...shop,
      desktops: "mac",
      needs: ["files", "guestWifi"],
      sites: "one",
    });
    expect(plan.directory.mode).toBe("workgroup");
    expect(plan.files.some((f) => f.filename === "install-office-server.sh")).toBe(true);
    expect(plan.files.find((f) => f.filename === "install-office-server.sh")?.contents).toContain("workgroup");
    expect(plan.files.find((f) => f.filename === "install-office-server.sh")?.contents).not.toContain(
      "samba-tool domain provision",
    );
    expect(plan.files.some((f) => f.filename === "create-users.sh")).toBe(false);
  });

  it("isolates POS and cameras when asked", () => {
    const plan = generatePlan({
      ...shop,
      needs: [...NEEDS],
    });
    expect(plan.networks.map((n) => n.name)).toEqual(
      expect.arrayContaining(["Staff", "Servers", "Guest", "IoT", "POS", "Mgmt"]),
    );
    expect(plan.firewall.some((r) => r.from === "POS" && r.to === "Servers" && r.action === "deny")).toBe(true);
    expect(plan.firewall.some((r) => r.from === "IoT" && r.to === "Staff" && r.action === "deny")).toBe(true);
  });

  it("sizes APs and switch ports from headcount", () => {
    expect(apCount(12)).toBe(1);
    expect(apCount(16)).toBe(2);
    expect(switchPorts(shop)).toBeGreaterThanOrEqual(16);
    expect(bomTotal(generatePlan(shop).bom)).toBeGreaterThan(400);
  });

  it("writes a user CSV and a runbook that mentions Debian", () => {
    const plan = generatePlan(shop);
    const csv = plan.files.find((f) => f.filename === "users.csv")!.contents;
    expect(csv.split("\n")[0]).toBe("username,first,last,group,ou");
    expect(plan.runbook.some((s) => /Debian 12/.test(s.detail))).toBe(true);
    expect(plan.warnings.some((w) => w.includes(".lan"))).toBe(true);
  });
});

describe("seo", () => {
  it("gives every route a unique title, h1, and canonical", () => {
    const titles = PAGE_SEO.map((page) => page.title);
    const h1s = PAGE_SEO.map((page) => page.h1);
    expect(new Set(titles).size).toBe(PAGE_SEO.length);
    expect(new Set(h1s).size).toBe(PAGE_SEO.length);
    expect(PAGE_SEO.map((p) => p.path)).toEqual(["/", "/plan", "/tools", "/compare"]);
    expect(canonicalFor("/")).toBe("https://netyard.firstdeploy.ai/");
  });

  it("injects distinct HTML per route", () => {
    const shell = `<!doctype html><html><head>
      <title>x</title>
      <meta name="description" content="shared" />
      <link rel="canonical" href="https://netyard.firstdeploy.ai/" />
      <meta property="og:title" content="shared" />
      <meta property="og:description" content="shared" />
      <meta property="og:url" content="https://netyard.firstdeploy.ai/" />
      <meta name="twitter:title" content="shared" />
      <meta name="twitter:description" content="shared" />
    </head><body><div id="root"></div></body></html>`;
    const pages = PAGE_SEO.map((page) => applyRouteHtml(shell, page));
    expect(new Set(pages).size).toBe(PAGE_SEO.length);
    expect(pages[0]).toContain("id=\"route-home\"");
    expect(pages[0]).toContain("Microsoft Server");
    expect(pages[0]).toContain("$1,500");
    expect(pages.join("")).not.toMatch(/firstdeploy\\.dev|\\$2,?500/);
  });
});
