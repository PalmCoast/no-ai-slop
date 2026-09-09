/**
 * Pure business rules shared by the browser and the Netlify Functions.
 * No I/O here so everything is unit-testable.
 */

export const US_STATES: ReadonlyArray<readonly [string, string]> = [
  ["AL", "Alabama"], ["AK", "Alaska"], ["AZ", "Arizona"], ["AR", "Arkansas"], ["CA", "California"],
  ["CO", "Colorado"], ["CT", "Connecticut"], ["DE", "Delaware"], ["DC", "District of Columbia"], ["FL", "Florida"],
  ["GA", "Georgia"], ["HI", "Hawaii"], ["ID", "Idaho"], ["IL", "Illinois"], ["IN", "Indiana"],
  ["IA", "Iowa"], ["KS", "Kansas"], ["KY", "Kentucky"], ["LA", "Louisiana"], ["ME", "Maine"],
  ["MD", "Maryland"], ["MA", "Massachusetts"], ["MI", "Michigan"], ["MN", "Minnesota"], ["MS", "Mississippi"],
  ["MO", "Missouri"], ["MT", "Montana"], ["NE", "Nebraska"], ["NV", "Nevada"], ["NH", "New Hampshire"],
  ["NJ", "New Jersey"], ["NM", "New Mexico"], ["NY", "New York"], ["NC", "North Carolina"], ["ND", "North Dakota"],
  ["OH", "Ohio"], ["OK", "Oklahoma"], ["OR", "Oregon"], ["PA", "Pennsylvania"], ["RI", "Rhode Island"],
  ["SC", "South Carolina"], ["SD", "South Dakota"], ["TN", "Tennessee"], ["TX", "Texas"], ["UT", "Utah"],
  ["VT", "Vermont"], ["VA", "Virginia"], ["WA", "Washington"], ["WV", "West Virginia"], ["WI", "Wisconsin"],
  ["WY", "Wyoming"], ["PR", "Puerto Rico"], ["US", "Anywhere in the US (remote)"],
];

export const STATE_CODES = new Set(US_STATES.map(([code]) => code));

export const EMPLOYMENT_TYPES = ["full_time", "contract", "contract_to_hire", "part_time"] as const;
export const WORKPLACES = ["onsite", "hybrid", "remote"] as const;
export const SENIORITIES = ["mid", "senior", "lead", "principal", "manager", "director"] as const;
export const SERVICE_BRANCHES = ["Army", "Navy", "Air Force", "Marine Corps", "Coast Guard", "Space Force", "National Guard", "Reserves"] as const;

export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];
export type Workplace = (typeof WORKPLACES)[number];
export type Seniority = (typeof SENIORITIES)[number];

export const LABELS: Record<string, string> = {
  full_time: "Full-time",
  contract: "Contract",
  contract_to_hire: "Contract-to-hire",
  part_time: "Part-time",
  onsite: "On-site",
  hybrid: "Hybrid",
  remote: "Remote (US)",
  mid: "Mid-level",
  senior: "Senior",
  lead: "Lead",
  principal: "Principal",
  manager: "Manager",
  director: "Director",
};

export const JOB_POST_PRICE_CENTS_DEFAULT = 1000;
export const JOB_DURATION_DAYS = 30;
export const VETERAN_EARLY_ACCESS_HOURS_DEFAULT = 48;
export const CONNECTION_REQUESTS_PER_DAY = 20;
export const POSTS_PER_DAY_UNVERIFIED = 3;
export const POSTS_PER_DAY_VERIFIED = 25;

/** Consumer mailbox providers. An employer using one of these cannot self-verify. */
export const FREE_MAIL_DOMAINS = new Set([
  "gmail.com", "googlemail.com", "yahoo.com", "ymail.com", "outlook.com", "hotmail.com", "live.com", "msn.com",
  "aol.com", "icloud.com", "me.com", "mac.com", "protonmail.com", "proton.me", "pm.me", "zoho.com", "gmx.com", "gmx.us",
  "mail.com", "yandex.com", "fastmail.com", "hey.com", "tutanota.com", "rediffmail.com", "qq.com", "163.com",
]);

export function emailDomain(email: string): string {
  const at = email.lastIndexOf("@");
  return at === -1 ? "" : email.slice(at + 1).trim().toLowerCase();
}

/** "https://www.Acme.com/careers" -> "acme.com". Returns "" when unparsable. */
export function websiteDomain(website: string): string {
  let input = website.trim().toLowerCase();
  if (!input) return "";
  if (!/^[a-z]+:\/\//.test(input)) input = `https://${input}`;
  try {
    const host = new URL(input).hostname.replace(/^www\./, "");
    if (!host.includes(".")) return "";
    return host;
  } catch {
    return "";
  }
}

/** True when an email domain is the website domain or a subdomain of it. */
export function domainsMatch(emailDom: string, siteDom: string): boolean {
  if (!emailDom || !siteDom) return false;
  return emailDom === siteDom || emailDom.endsWith(`.${siteDom}`);
}

export function isFreeMail(email: string): boolean {
  return FREE_MAIL_DOMAINS.has(emailDomain(email));
}

/**
 * Employer self-verification: the account email must belong to the company's
 * website domain, and that domain must not be a consumer mailbox provider.
 * Anyone else can still post (and pay), but shows as "unverified" until an
 * admin reviews them and gets a lower daily posting cap.
 */
export function employerVerification(email: string, website: string): "domain_verified" | "unverified" {
  const site = websiteDomain(website);
  if (!site || FREE_MAIL_DOMAINS.has(site)) return "unverified";
  return domainsMatch(emailDomain(email), site) ? "domain_verified" : "unverified";
}

export type VeteranStatus = "none" | "self_reported" | "verified";

export function isVeteran(status: string | null | undefined): boolean {
  return status === "self_reported" || status === "verified";
}

/**
 * Veterans get first look: a job published less than `hours` ago is visible
 * only to veteran members. Everyone sees it once the window closes.
 */
export function inVeteranWindow(publishedAt: Date | string | null, now: Date, hours: number): boolean {
  if (!publishedAt) return false;
  const published = typeof publishedAt === "string" ? new Date(publishedAt) : publishedAt;
  return now.getTime() - published.getTime() < hours * 3600_000;
}

export function canViewJob(
  viewer: { veteranStatus: string; isAdmin?: boolean; isPoster?: boolean } | null,
  job: { status: string; publishedAt: Date | string | null },
  now: Date,
  hours: number,
): boolean {
  if (viewer?.isAdmin || viewer?.isPoster) return true;
  if (job.status !== "published") return false;
  if (!inVeteranWindow(job.publishedAt, now, hours)) return true;
  return !!viewer && isVeteran(viewer.veteranStatus);
}

/** Employers see veteran applicants first, then by application time. */
export function sortApplicants<T extends { veteran_status: string; created_at: string | Date }>(rows: T[]): T[] {
  const rank = (s: string) => (s === "verified" ? 0 : s === "self_reported" ? 1 : 2);
  return [...rows].sort((a, b) => {
    const r = rank(a.veteran_status) - rank(b.veteran_status);
    if (r !== 0) return r;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });
}

export interface JobInput {
  title: string;
  description: string;
  employment_type: string;
  workplace: string;
  city: string;
  state: string;
  salary_min: number | null;
  salary_max: number | null;
  seniority: string;
  skills: string[];
  veteran_preferred: boolean;
  apply_url: string;
}

export function validateJob(raw: Partial<JobInput>): { ok: true; value: JobInput } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  const title = (raw.title ?? "").trim();
  const description = (raw.description ?? "").trim();
  const employment_type = raw.employment_type ?? "";
  const workplace = raw.workplace ?? "";
  const city = (raw.city ?? "").trim();
  const state = (raw.state ?? "").trim().toUpperCase();
  const seniority = raw.seniority ?? "";
  const apply_url = (raw.apply_url ?? "").trim();
  const skills = normalizeSkills(raw.skills ?? []);
  const salary_min = raw.salary_min == null || Number.isNaN(Number(raw.salary_min)) ? null : Math.round(Number(raw.salary_min));
  const salary_max = raw.salary_max == null || Number.isNaN(Number(raw.salary_max)) ? null : Math.round(Number(raw.salary_max));

  if (title.length < 4 || title.length > 120) errors.push("Title must be 4 to 120 characters.");
  if (description.length < 80) errors.push("Description must be at least 80 characters. Tell people what the job actually is.");
  if (description.length > 12_000) errors.push("Description is too long (12,000 character limit).");
  if (!(EMPLOYMENT_TYPES as readonly string[]).includes(employment_type)) errors.push("Choose an employment type.");
  if (!(WORKPLACES as readonly string[]).includes(workplace)) errors.push("Choose on-site, hybrid, or remote.");
  if (!STATE_CODES.has(state)) errors.push("Choose a US state (or 'Anywhere in the US' for remote roles).");
  if (workplace !== "remote" && !city) errors.push("City is required for on-site and hybrid roles.");
  if (!(SENIORITIES as readonly string[]).includes(seniority)) errors.push("Choose a seniority level.");
  if (salary_min != null && salary_min < 0) errors.push("Minimum salary cannot be negative.");
  if (salary_min != null && salary_max != null && salary_max < salary_min) errors.push("Maximum salary must be at least the minimum.");
  if (apply_url && !/^https?:\/\/\S+$/i.test(apply_url)) errors.push("Apply link must start with http:// or https://.");
  if (skills.length > 20) errors.push("List at most 20 skills.");
  if (containsProhibitedTargeting(`${title}\n${description}`)) {
    errors.push("Postings may not state a preference or exclusion based on race, color, national origin, religion, sex, age, or disability. Edit the wording and try again.");
  }

  if (errors.length) return { ok: false, errors };
  return {
    ok: true,
    value: { title, description, employment_type, workplace, city, state, salary_min, salary_max, seniority, skills, veteran_preferred: !!raw.veteran_preferred, apply_url },
  };
}

export function normalizeSkills(input: string[] | string): string[] {
  const list = Array.isArray(input) ? input : input.split(",");
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of list) {
    const v = s.trim().replace(/\s+/g, " ").slice(0, 40);
    if (!v) continue;
    const key = v.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(v);
  }
  return out;
}

/**
 * Plain-language screen for wording that states a protected-class preference.
 * It is a guard rail, not a legal review; admins can still remove anything
 * that slips through via reports.
 */
const PROHIBITED_PATTERNS: RegExp[] = [
  /\b(whites?|blacks?|asians?|hispanics?|latin[oa]s?|caucasians?|african[- ]americans?)\s+(only|preferred|wanted|need(ed)?)\b/i,
  /\b(only|no|not)\s+(whites?|blacks?|asians?|hispanics?|latin[oa]s?|indians?|chinese|mexicans?|africans?|europeans?|americans?)\b/i,
  /\b(male|female|men|women|christian|muslim|jewish|hindu|young|under\s+\d{2})\s+(only|preferred|candidates?\s+only)\b/i,
  /\b(no|not)\s+(indians?|foreigners?|immigrants?|h-?1b|h1-?b)\b/i,
  /\b(born|native)\s+(in\s+the\s+)?(us|u\.s\.|usa|america|united states)\s+(only|required)\b/i,
  /\bus\s+citizens?\s+only\b/i,
  /\bmust\s+be\s+(a\s+)?(us|u\.s\.)\s+citizen\b/i,
  /\bnative\s+english\s+speakers?\s+only\b/i,
  /\brecent\s+(college\s+)?grad(uate)?s?\s+only\b/i,
  /\bdigital\s+natives?\b/i,
];

export function containsProhibitedTargeting(text: string): boolean {
  return PROHIBITED_PATTERNS.some((re) => re.test(text));
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export function validatePassword(password: string): string | null {
  if (password.length < 10) return "Password must be at least 10 characters.";
  if (password.length > 200) return "Password is too long.";
  return null;
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function formatSalary(min: number | null, max: number | null): string {
  const fmt = (n: number) => `$${Math.round(n / 1000)}k`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  if (max) return `Up to ${fmt(max)}`;
  return "Salary not listed";
}
