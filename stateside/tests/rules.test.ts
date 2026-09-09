import { describe, expect, it } from "vitest";
import {
  canViewJob,
  containsProhibitedTargeting,
  domainsMatch,
  emailDomain,
  employerVerification,
  inVeteranWindow,
  normalizeSkills,
  slugify,
  sortApplicants,
  validateJob,
  websiteDomain,
} from "../shared/rules";

describe("employer domain verification", () => {
  it("extracts domains from emails and websites", () => {
    expect(emailDomain("Dana@AcmeCloud.com")).toBe("acmecloud.com");
    expect(websiteDomain("https://www.acmecloud.com/careers")).toBe("acmecloud.com");
    expect(websiteDomain("acmecloud.com")).toBe("acmecloud.com");
    expect(websiteDomain("not a url")).toBe("");
  });

  it("matches exact domains and subdomains only", () => {
    expect(domainsMatch("acmecloud.com", "acmecloud.com")).toBe(true);
    expect(domainsMatch("mail.acmecloud.com", "acmecloud.com")).toBe(true);
    expect(domainsMatch("notacmecloud.com", "acmecloud.com")).toBe(false);
  });

  it("verifies work emails and rejects consumer mailboxes", () => {
    expect(employerVerification("hr@acmecloud.com", "acmecloud.com")).toBe("domain_verified");
    expect(employerVerification("hr@gmail.com", "gmail.com")).toBe("unverified");
    expect(employerVerification("hr@gmail.com", "acmecloud.com")).toBe("unverified");
  });
});

describe("veterans-first window", () => {
  const now = new Date("2026-09-09T12:00:00Z");
  const fresh = new Date("2026-09-09T00:00:00Z"); // 12h ago
  const old = new Date("2026-09-01T00:00:00Z");

  it("detects whether a posting is inside the window", () => {
    expect(inVeteranWindow(fresh, now, 48)).toBe(true);
    expect(inVeteranWindow(old, now, 48)).toBe(false);
    expect(inVeteranWindow(null, now, 48)).toBe(false);
  });

  it("only veterans, admins, and the poster see fresh postings", () => {
    const job = { status: "published", publishedAt: fresh };
    expect(canViewJob(null, job, now, 48)).toBe(false);
    expect(canViewJob({ veteranStatus: "none" }, job, now, 48)).toBe(false);
    expect(canViewJob({ veteranStatus: "self_reported" }, job, now, 48)).toBe(true);
    expect(canViewJob({ veteranStatus: "verified" }, job, now, 48)).toBe(true);
    expect(canViewJob({ veteranStatus: "none", isAdmin: true }, job, now, 48)).toBe(true);
    expect(canViewJob({ veteranStatus: "none", isPoster: true }, job, now, 48)).toBe(true);
  });

  it("everyone sees postings once the window closes, nobody sees unpublished ones", () => {
    expect(canViewJob(null, { status: "published", publishedAt: old }, now, 48)).toBe(true);
    expect(canViewJob({ veteranStatus: "verified" }, { status: "pending_payment", publishedAt: null }, now, 48)).toBe(false);
  });

  it("sorts applicants with verified veterans first, then self-reported, then by time", () => {
    const sorted = sortApplicants([
      { name: "c", veteran_status: "none", created_at: "2026-09-01T00:00:00Z" },
      { name: "b", veteran_status: "self_reported", created_at: "2026-09-03T00:00:00Z" },
      { name: "a", veteran_status: "verified", created_at: "2026-09-05T00:00:00Z" },
      { name: "d", veteran_status: "none", created_at: "2026-08-01T00:00:00Z" },
    ]);
    expect(sorted.map((s) => s.name)).toEqual(["a", "b", "d", "c"]);
  });
});

describe("job validation", () => {
  const good = {
    title: "Senior Network Engineer",
    description: "Own the routing and switching for 14 branch offices, lead the firewall refresh, and mentor two junior engineers. Reports to the Director of Infrastructure.",
    employment_type: "full_time",
    workplace: "hybrid",
    city: "Columbus",
    state: "oh",
    salary_min: 120000,
    salary_max: 150000,
    seniority: "senior",
    skills: ["Cisco", "cisco", " BGP "],
    veteran_preferred: true,
    apply_url: "",
  };

  it("accepts a complete posting and normalizes fields", () => {
    const r = validateJob(good);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.state).toBe("OH");
      expect(r.value.skills).toEqual(["Cisco", "BGP"]);
    }
  });

  it("requires a city for non-remote roles and a valid state", () => {
    expect(validateJob({ ...good, city: "" })).toMatchObject({ ok: false });
    expect(validateJob({ ...good, workplace: "remote", city: "", state: "US" })).toMatchObject({ ok: true });
    expect(validateJob({ ...good, state: "ZZ" })).toMatchObject({ ok: false });
  });

  it("rejects salary ranges that are upside down and short descriptions", () => {
    expect(validateJob({ ...good, salary_min: 150000, salary_max: 100000 })).toMatchObject({ ok: false });
    expect(validateJob({ ...good, description: "Short." })).toMatchObject({ ok: false });
  });

  it("rejects wording that targets protected classes", () => {
    const bad = [
      "US citizens only, no H1B.",
      "Looking for young, digital natives.",
      "No Indians please.",
      "Whites only.",
      "Must be a US citizen.",
      "Recent grads only.",
      "Native English speakers only.",
    ];
    for (const phrase of bad) {
      expect(containsProhibitedTargeting(phrase), phrase).toBe(true);
      expect(validateJob({ ...good, description: `${good.description} ${phrase}` }).ok, phrase).toBe(false);
    }
  });

  it("allows lawful requirements", () => {
    const fine = [
      "Must be authorized to work in the United States.",
      "Active Secret clearance required.",
      "Veterans encouraged to apply.",
      "10+ years of experience with enterprise networks.",
      "This role is on-site in Columbus, Ohio.",
    ];
    for (const phrase of fine) expect(containsProhibitedTargeting(phrase), phrase).toBe(false);
  });
});

describe("helpers", () => {
  it("normalizes skills from strings and arrays", () => {
    expect(normalizeSkills("a, b,,a ,  c")).toEqual(["a", "b", "c"]);
  });
  it("slugifies group names", () => {
    expect(slugify("Midwest SREs & Friends!")).toBe("midwest-sres-friends");
  });
});
