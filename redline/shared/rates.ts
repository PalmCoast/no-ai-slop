export const FAIR_MULTIPLE = 1.5;
export const SEVERE_MULTIPLE = 6;

export type Benchmark = {
  code: string;
  label: string;
  /** Per-unit reference in cents. */
  cents: number;
  source: string;
};

/**
 * National references used to spot multiples. Several are cost or placeholder
 * figures, not the wage-adjusted Medicare payment for a ZIP code. The source
 * string is what the letter is allowed to say.
 */
export const BENCHMARKS: readonly Benchmark[] = [
  {
    code: "99281",
    label: "ED visit level 1",
    cents: 8700,
    source: "Placeholder near a level 1 Type A emergency visit. Confirm CMS OPPS Addendum B before you quote it.",
  },
  {
    code: "99282",
    label: "ED visit level 2",
    cents: 15000,
    source: "Placeholder near a level 2 Type A emergency visit. Confirm CMS OPPS Addendum B before you quote it.",
  },
  {
    code: "99283",
    label: "ED visit level 3",
    cents: 29800,
    source:
      "Near the $298.48 geometric mean cost CMS listed for APC 5023 in CY2025 preliminary OPPS ratesetting. That figure is a cost, not the wage-adjusted payment.",
  },
  {
    code: "99284",
    label: "ED visit level 4",
    cents: 42630,
    source:
      "2026 OPPS national unadjusted listing for APC 5024, level 4 Type A emergency visits, reprinted as $426.30. Confirm CMS Addendum B before you cite it.",
  },
  {
    code: "99285",
    label: "ED visit level 5",
    cents: 66500,
    source:
      "Near the $664.66 geometric mean cost CMS listed for APC 5025 in CY2025 preliminary OPPS ratesetting. That figure is a cost, not the wage-adjusted payment.",
  },
  {
    code: "85025",
    label: "CBC with differential",
    cents: 900,
    source: "Rounded clinical-lab style reference of $9. Confirm the current clinical lab fee schedule.",
  },
  {
    code: "80053",
    label: "Comprehensive metabolic panel",
    cents: 1400,
    source: "Rounded clinical-lab style reference of $14. Confirm the current clinical lab fee schedule.",
  },
  {
    code: "84450",
    label: "AST",
    cents: 700,
    source: "Rounded clinical-lab style reference of $7. AST is also a component of the comprehensive metabolic panel.",
  },
  {
    code: "84460",
    label: "ALT",
    cents: 700,
    source: "Rounded clinical-lab style reference of $7. ALT is also a component of the comprehensive metabolic panel.",
  },
  {
    code: "71046",
    label: "Chest X-ray, 2 views",
    cents: 8805,
    source:
      "CY2025 OPPS finalized national rate for APC 5521, level 1 imaging without contrast, was $88.05 in the ACR summary of the final rule. Confirm this code maps to that APC.",
  },
  {
    code: "70450",
    label: "CT head without contrast",
    cents: 24172,
    source:
      "CY2025 OPPS finalized national rate for APC 5523, level 3 imaging without contrast, was $241.72 in the ACR summary of the final rule. Confirm the APC for 70450.",
  },
  {
    code: "96365",
    label: "IV infusion, initial",
    cents: 40000,
    source: "High placeholder of $400 for an initial IV infusion. Confirm the drug-administration APC before you cite a dollar.",
  },
  {
    code: "96361",
    label: "IV infusion, additional",
    cents: 8000,
    source: "High placeholder of $80 per additional infusion hour. Confirm the drug-administration APC before you cite a dollar.",
  },
  {
    code: "J2405",
    label: "Ondansetron 4 mg",
    cents: 1500,
    source: "High placeholder of $15 for ondansetron 4 mg. Average sales price is often lower. Confirm the current ASP drug file.",
  },
];

const BY_CODE = new Map(BENCHMARKS.map((row) => [row.code, row]));

export function benchmark(code: string | null | undefined): Benchmark | null {
  if (!code) return null;
  return BY_CODE.get(code.toUpperCase()) ?? null;
}

/** Components already included when the parent panel is on the same bill. */
export const PANELS: readonly { parent: string; parts: readonly string[] }[] = [
  {
    parent: "80053",
    parts: ["82040", "82247", "82310", "82374", "82435", "82565", "82947", "84075", "84132", "84155", "84295", "84450", "84460", "84520"],
  },
  {
    parent: "85025",
    parts: ["85004", "85007", "85008", "85014", "85018", "85041", "85048"],
  },
];

export const EMERGENCY_VISITS = new Set(["99281", "99282", "99283", "99284", "99285"]);

export const ALIASES: readonly { code: string; pattern: RegExp }[] = [
  { code: "99285", pattern: /\b(ED|ER|EMERGENCY)\b.*\bLEVEL\s*5\b|\b99285\b/i },
  { code: "99284", pattern: /\b(ED|ER|EMERGENCY)\b.*\bLEVEL\s*4\b/i },
  { code: "99283", pattern: /\b(ED|ER|EMERGENCY)\b.*\bLEVEL\s*3\b/i },
  { code: "99282", pattern: /\b(ED|ER|EMERGENCY)\b.*\bLEVEL\s*2\b/i },
  { code: "99281", pattern: /\b(ED|ER|EMERGENCY)\b.*\bLEVEL\s*1\b/i },
  { code: "80053", pattern: /\bCMP\b|COMPREHENSIVE METABOLIC/i },
  { code: "85025", pattern: /\bCBC\b/i },
  { code: "84450", pattern: /\bAST\b/i },
  { code: "84460", pattern: /\bALT\b|\bSGPT\b/i },
  { code: "71046", pattern: /CHEST X-?RAY/i },
  { code: "70450", pattern: /CT HEAD/i },
  { code: "96365", pattern: /IV INFUSION INITIAL|INFUSION,?\s+INITIAL/i },
  { code: "96361", pattern: /IV INFUSION ADD/i },
  { code: "J2405", pattern: /ONDANSETRON/i },
];

export function aliasCode(description: string): string | null {
  for (const row of ALIASES) {
    if (row.pattern.test(description)) return row.code;
  }
  return null;
}
