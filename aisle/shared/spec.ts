export type Unit = "in" | "mm" | "cm" | "ft";
export type DimRole = "diameter" | "length" | "unspecified";

export type Dimension = {
  value: number;
  unit: Unit;
  inches: number;
  role: DimRole;
  label: string;
};

export type Spec = {
  raw: string;
  product: string | null;
  materials: string[];
  colors: string[];
  features: string[];
  dimensions: Dimension[];
};

const PRODUCT_RULES: { id: string; re: RegExp }[] = [
  { id: "cardigan", re: /\bcardigans?\b/ },
  { id: "sweater", re: /\b(?:sweaters?|jumpers?|pullovers?)\b/ },
  { id: "tube", re: /\b(?:tubes?|tubing)\b/ },
  { id: "pipe", re: /\b(?:pipes?|piping)\b/ },
  { id: "rod", re: /\b(?:rods?|bars?)\b/ },
  { id: "polo", re: /\bpolos?\b/ },
  { id: "flange", re: /\bflanges?\b/ },
];

const TUBE_FAMILY = new Set(["tube", "pipe", "rod", "flange"]);

export function normalizeListingText(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/½/g, " 1/2 ")
    .replace(/¼/g, " 1/4 ")
    .replace(/¾/g, " 3/4 ")
    .replace(/aluminium/g, "aluminum")
    .replace(/(\d)\s*"/g, "$1 inch")
    .replace(/(\d+(?:\.\d+)?)\s*-\s*(inch|in\b|ft\b|mm\b)/g, "$1 $2")
    .replace(/\b(in|ft|mm|cm)\./g, "$1 ")
    .replace(/[()[\]]/g, " ")
    .replace(/[,;]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseNumber(token: string): number {
  const mixed = token.trim().match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) return Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]);
  const frac = token.trim().match(/^(\d+)\/(\d+)$/);
  if (frac) return Number(frac[1]) / Number(frac[2]);
  return Number(token);
}

function toInches(value: number, unit: Unit): number {
  if (unit === "mm") return value / 25.4;
  if (unit === "cm") return value / 2.54;
  if (unit === "ft") return value * 12;
  return value;
}

function unitFrom(word: string): Unit {
  if (word.startsWith("mm") || word.startsWith("millimeter")) return "mm";
  if (word.startsWith("cm") || word.startsWith("centimeter")) return "cm";
  if (word === "ft" || word.startsWith("foot") || word.startsWith("feet")) return "ft";
  return "in";
}

function roleFor(unit: Unit, before: string, after: string): DimRole {
  const ctx = `${before} ${after}`;
  if (/\b(?:long|length|tall)\b/.test(after) || /\b(?:long|length)\b/.test(before)) return "length";
  if (/\b(?:o\.?d\.?|diameter|dia\.?|outside)\b/.test(ctx)) return "diameter";
  if (unit === "ft") return "length";
  return "unspecified";
}

function formatLabel(value: number, unit: Unit, role: DimRole): string {
  const shown = Number.isInteger(value) ? String(value) : String(Math.round(value * 1000) / 1000);
  const unitWord = unit === "in" ? "inch" : unit;
  const roleWord = role === "unspecified" ? "" : ` ${role}`;
  return `${shown} ${unitWord}${roleWord}`;
}

function pullDimensions(text: string): { dimensions: Dimension[]; rest: string } {
  const dimRe =
    /(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)\s*(inch(?:es)?|in\b|mm|millimeters?|cm|centimeters?|ft|foot|feet)\b/g;
  const dimensions: Dimension[] = [];
  const rest = text.replace(dimRe, (full, num: string, unitWord: string, offset: number) => {
    const unit = unitFrom(unitWord.replace(/\.$/, ""));
    const value = parseNumber(num);
    if (!Number.isFinite(value)) return full;
    const before = text.slice(Math.max(0, offset - 24), offset);
    const after = text.slice(offset + full.length, offset + full.length + 28);
    const role = roleFor(unit, before, after);
    dimensions.push({
      value,
      unit,
      inches: toInches(value, unit),
      role,
      label: formatLabel(value, unit, role),
    });
    return " ";
  });
  return { dimensions, rest: rest.replace(/\s+/g, " ").trim() };
}

function consume(text: string, re: RegExp): { text: string; hit: boolean } {
  if (!re.test(text)) return { text, hit: false };
  return { text: text.replace(re, " ").replace(/\s+/g, " ").trim(), hit: true };
}

function pullMaterials(text: string): { materials: string[]; features: string[]; rest: string } {
  const materials: string[] = [];
  const features: string[] = [];
  let rest = text;
  const take = (re: RegExp, id: string, bucket: string[]) => {
    const next = consume(rest, re);
    rest = next.text;
    if (next.hit && !bucket.includes(id)) bucket.push(id);
    return next.hit;
  };
  take(/\bwool[\s-]*blend\b/, "blend", materials);
  if (take(/\bmerino(?:\s+wool)?\b/, "merino", features)) {
    if (!materials.includes("blend") && !materials.includes("wool")) materials.push("wool");
  }
  take(/\blambs?wool\b|\blambs?\s+wool\b/, "wool", materials);
  take(/\bcashmere\b/, "cashmere", materials);
  take(/\bcotton\b/, "cotton", materials);
  take(/\bacrylic\b/, "acrylic", materials);
  take(/\bpolyester\b/, "polyester", materials);
  take(/\bnylon\b/, "nylon", materials);
  take(/\bstainless(?:\s+steel)?\b/, "stainless", materials);
  take(/\bcarbon\s+steel\b/, "steel", materials);
  take(/\baluminum\b/, "aluminum", materials);
  take(/\bsteel\b/, "steel", materials);
  take(/\bcopper\b/, "copper", materials);
  take(/\bbrass\b/, "brass", materials);
  take(/\bpvc\b/, "pvc", materials);
  if (!materials.includes("blend")) take(/\bwool\b/, "wool", materials);
  return { materials, features, rest };
}

function pullColors(text: string): { colors: string[]; rest: string } {
  const colors: string[] = [];
  let rest = text;
  const rules: { id: string; re: RegExp }[] = [
    { id: "brown", re: /\bchocolate\s+brown\b|\bchocolate\b/ },
    { id: "charcoal", re: /\bcharcoal\b/ },
    { id: "navy", re: /\bnavy\b/ },
    { id: "brown", re: /\bbrown\b/ },
    { id: "camel", re: /\bcamel\b/ },
    { id: "rust", re: /\brust\b/ },
    { id: "burgundy", re: /\bburgundy\b/ },
    { id: "gray", re: /\bgr[ae]y\b/ },
    { id: "cream", re: /\bcream\b|\bivory\b/ },
    { id: "black", re: /\bblack\b/ },
    { id: "white", re: /\bwhite\b/ },
    { id: "olive", re: /\bolive\b/ },
    { id: "red", re: /\bred\b/ },
    { id: "tan", re: /\btan\b/ },
  ];
  for (const rule of rules) {
    const next = consume(rest, rule.re);
    rest = next.text;
    if (next.hit && !colors.includes(rule.id)) colors.push(rule.id);
  }
  return { colors, rest };
}

function pullFeatures(text: string): { features: string[]; rest: string } {
  const features: string[] = [];
  let rest = text;
  const rules: { id: string; re: RegExp }[] = [
    { id: "flange", re: /\bwith\s+an?\s+flange\b|\bflanged\b|\bflanges?\b/ },
    { id: "crewneck", re: /\bcrew[\s-]*necks?\b/ },
    { id: "v-neck", re: /\bv[\s-]*necks?\b/ },
    { id: "turtleneck", re: /\bturtlenecks?\b/ },
    { id: "cable", re: /\bcable[\s-]*knits?\b/ },
    { id: "ribbed", re: /\bribbed\b/ },
  ];
  for (const rule of rules) {
    const next = consume(rest, rule.re);
    rest = next.text;
    if (next.hit && !features.includes(rule.id)) features.push(rule.id);
  }
  return { features, rest };
}

function stripFittingTarget(text: string, features: string[]): string {
  if (!features.includes("flange")) return text;
  if (/\b(?:round\s+tube|tubing|tube\s+with|tubes?\s*,)\b/.test(text)) return text;
  return text.replace(/\b(?:for|fits|fitting\s+for)\b[^.]{0,40}\btubes?\b/g, " ");
}

function detectProduct(text: string): string | null {
  const found: { id: string; index: number }[] = [];
  for (const rule of PRODUCT_RULES) {
    const match = rule.re.exec(text);
    if (match) found.push({ id: rule.id, index: match.index });
  }
  found.sort((a, b) => a.index - b.index);
  return found[0]?.id ?? null;
}

function upgradeRoles(product: string | null, dimensions: Dimension[]): Dimension[] {
  if (!product || !TUBE_FAMILY.has(product)) return dimensions;
  let upgraded = false;
  return dimensions.map((dim) => {
    if (upgraded || dim.role !== "unspecified" || dim.unit === "ft") return dim;
    upgraded = true;
    const next = { ...dim, role: "diameter" as const };
    next.label = formatLabel(next.value, next.unit, next.role);
    return next;
  });
}

export function parseSpec(raw: string, mode: "query" | "listing" = "query"): Spec {
  let clean = normalizeListingText(raw).slice(0, 500);
  if (mode === "listing") {
    clean = clean.replace(/\bno\s+flanges?\b/g, " ").replace(/\bwithout\s+(?:a\s+)?flanges?\b/g, " ");
  }
  const pulled = pullDimensions(clean);
  const materials = pullMaterials(pulled.rest);
  const colors = pullColors(materials.rest);
  const features = pullFeatures(colors.rest);
  const featureIds = [...materials.features, ...features.features];
  const productText = stripFittingTarget(features.rest, featureIds);
  const detected = detectProduct(productText);
  const product = detected ?? (featureIds.includes("flange") ? "flange" : null);
  return {
    raw: raw.trim(),
    product,
    materials: materials.materials,
    colors: colors.colors,
    features: featureIds,
    dimensions: upgradeRoles(product, pulled.dimensions),
  };
}

export function specChips(spec: Spec): string[] {
  const chips: string[] = [];
  for (const dim of spec.dimensions) chips.push(dim.label);
  chips.push(...spec.colors, ...spec.materials, ...spec.features);
  if (spec.product) chips.push(spec.product);
  return chips;
}

export function suggestShopName(spec: Spec): string {
  const dim = spec.dimensions[0] ? `${formatNumber(spec.dimensions[0].value)} ${spec.dimensions[0].unit === "in" ? "inch" : spec.dimensions[0].unit}` : "";
  const parts = [dim, ...spec.colors, ...spec.materials, ...spec.features, spec.product ?? ""].filter(Boolean);
  if (!parts.length) return "New aisle";
  return parts
    .join(" ")
    .replace(/\b[a-z]/g, (letter) => letter.toUpperCase())
    .slice(0, 48);
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : String(Math.round(value * 1000) / 1000);
}

export function dimsClose(a: Dimension, b: Dimension): boolean {
  const tol = Math.max(0.04, Math.min(a.inches, b.inches) * 0.02);
  return Math.abs(a.inches - b.inches) <= tol;
}

export function rolesCompatible(query: DimRole, item: DimRole): boolean {
  if (query === "unspecified" || item === "unspecified") return true;
  return query === item;
}
