export type AisleKind = "apparel" | "industrial" | "custom";

export type Listing = {
  id: string;
  merchant: string;
  title: string;
  detail: string;
  priceCents: number;
  href: string;
  aisle: AisleKind;
};

/** Compiled public-shop descriptions. Prices are the figures on this shelf. */
export const SHELF: Listing[] = [
  {
    id: "quince-crew",
    merchant: "Quince",
    title: "Chocolate brown merino wool crewneck sweater",
    detail: "Ribbed hem. Women's.",
    priceCents: 5000,
    href: "https://www.quince.com/search?q=brown+wool+sweater",
    aisle: "apparel",
  },
  {
    id: "everlane-crew",
    merchant: "Everlane",
    title: "Brown wool sweater",
    detail: "Crew neck. Ships from the US shop.",
    priceCents: 8900,
    href: "https://www.everlane.com/search?q=brown%20wool%20sweater",
    aisle: "apparel",
  },
  {
    id: "etsy-pullover",
    merchant: "Etsy",
    title: "Brown wool pullover",
    detail: "Hand knit. Size medium.",
    priceCents: 12800,
    href: "https://www.etsy.com/search?q=brown%20wool%20sweater",
    aisle: "apparel",
  },
  {
    id: "jcrew-brown",
    merchant: "J.Crew",
    title: "Brown wool sweater",
    detail: "Size medium. Lambswool.",
    priceCents: 14800,
    href: "https://www.jcrew.com/search?Ntrm=brown%20wool%20sweater",
    aisle: "apparel",
  },
  {
    id: "quince-turtle",
    merchant: "Quince",
    title: "Brown wool turtleneck sweater",
    detail: "Fine gauge.",
    priceCents: 7900,
    href: "https://www.quince.com/search?q=brown+wool+turtleneck",
    aisle: "apparel",
  },
  {
    id: "llbean-blend",
    merchant: "L.L.Bean",
    title: "Brown wool blend sweater",
    detail: "Ragg wool blend. Men's.",
    priceCents: 6900,
    href: "https://www.llbean.com/llb/search?freeText=brown+wool+sweater",
    aisle: "apparel",
  },
  {
    id: "uniqlo-cotton",
    merchant: "Uniqlo",
    title: "Brown cotton crewneck sweater",
    detail: "Cotton knit.",
    priceCents: 3990,
    href: "https://www.uniqlo.com/us/en/search?q=brown%20cotton%20sweater",
    aisle: "apparel",
  },
  {
    id: "jcrew-navy",
    merchant: "J.Crew",
    title: "Navy wool sweater",
    detail: "Crew neck.",
    priceCents: 12800,
    href: "https://www.jcrew.com/search?Ntrm=navy%20wool%20sweater",
    aisle: "apparel",
  },
  {
    id: "etsy-rust",
    merchant: "Etsy",
    title: "Rust wool pullover",
    detail: "Hand knit.",
    priceCents: 14200,
    href: "https://www.etsy.com/search?q=rust%20wool%20sweater",
    aisle: "apparel",
  },
  {
    id: "naadam-camel",
    merchant: "Naadam",
    title: "Camel cashmere sweater",
    detail: "Crew neck.",
    priceCents: 19500,
    href: "https://naadam.co/search?q=camel+cashmere+sweater",
    aisle: "apparel",
  },
  {
    id: "alexmill-cardigan",
    merchant: "Alex Mill",
    title: "Brown wool cardigan",
    detail: "Button front.",
    priceCents: 16800,
    href: "https://www.alexmill.com/search?q=brown+wool+cardigan",
    aisle: "apparel",
  },
  {
    id: "amazon-acrylic",
    merchant: "Amazon",
    title: "Brown acrylic sweater",
    detail: "Crew neck.",
    priceCents: 2800,
    href: "https://www.amazon.com/s?k=brown+acrylic+sweater",
    aisle: "apparel",
  },
  {
    id: "everlane-gray",
    merchant: "Everlane",
    title: "Gray wool sweater",
    detail: "Crew neck.",
    priceCents: 9800,
    href: "https://www.everlane.com/search?q=gray%20wool%20sweater",
    aisle: "apparel",
  },
  {
    id: "toddsnyder-polo",
    merchant: "Todd Snyder",
    title: "Brown merino wool polo",
    detail: "Short sleeve.",
    priceCents: 16800,
    href: "https://www.toddsnyder.com/search?q=brown+wool+polo",
    aisle: "apparel",
  },
  {
    id: "filson-shirt",
    merchant: "Filson",
    title: "Brown wool jac-shirt",
    detail: "Mackinaw wool.",
    priceCents: 19500,
    href: "https://www.filson.com/search?q=wool",
    aisle: "apparel",
  },
  {
    id: "uniqlo-navy-cotton",
    merchant: "Uniqlo",
    title: "Navy cotton sweater",
    detail: "Crew neck.",
    priceCents: 2990,
    href: "https://www.uniqlo.com/us/en/search?q=navy%20cotton%20sweater",
    aisle: "apparel",
  },
  {
    id: "mcmaster-flange",
    merchant: "McMaster-Carr",
    title: "4 inch OD aluminum round tube, flanged one end",
    detail: "48 inch long. 6061.",
    priceCents: 8640,
    href: "https://www.mcmaster.com/aluminum-tubes/",
    aisle: "industrial",
  },
  {
    id: "grainger-flange",
    merchant: "Grainger",
    title: "4 in. aluminum tube with a flange",
    detail: "6 ft long.",
    priceCents: 11215,
    href: "https://www.grainger.com/search?searchQuery=4%20inch%20aluminum%20tube%20flange",
    aisle: "industrial",
  },
  {
    id: "zoro-mm",
    merchant: "Zoro",
    title: "102 mm aluminium tube, flanged end",
    detail: "6061 round tube.",
    priceCents: 9400,
    href: "https://www.zoro.com/search?q=aluminum%20tube",
    aisle: "industrial",
  },
  {
    id: "metals-cut",
    merchant: "Metal Supermarkets",
    title: "4 inch aluminum tube with a flange",
    detail: "Cut to length. Round.",
    priceCents: 7600,
    href: "https://www.metalsupermarkets.com/",
    aisle: "industrial",
  },
  {
    id: "grainger-both",
    merchant: "Grainger",
    title: "4 inch OD aluminum tube, flanged both ends",
    detail: "24 inch long.",
    priceCents: 13100,
    href: "https://www.grainger.com/search?searchQuery=flanged%20aluminum%20tube",
    aisle: "industrial",
  },
  {
    id: "amazon-plain",
    merchant: "Amazon",
    title: "4 inch aluminum tube, plain ends",
    detail: "Round 6061. No flange.",
    priceCents: 3850,
    href: "https://www.amazon.com/s?k=4+inch+aluminum+tube",
    aisle: "industrial",
  },
  {
    id: "homedepot-steel",
    merchant: "Home Depot",
    title: "4 inch steel tube with a flange",
    detail: "Welded steel.",
    priceCents: 5420,
    href: "https://www.homedepot.com/s/4%20inch%20steel%20tube",
    aisle: "industrial",
  },
  {
    id: "mcmaster-3in",
    merchant: "McMaster-Carr",
    title: "3 inch aluminum tube with a flange",
    detail: "Round tube.",
    priceCents: 7100,
    href: "https://www.mcmaster.com/aluminum-tubes/",
    aisle: "industrial",
  },
  {
    id: "grainger-pipe",
    merchant: "Grainger",
    title: "4 inch aluminum pipe with a flange",
    detail: "Schedule 40 pipe.",
    priceCents: 9900,
    href: "https://www.grainger.com/search?searchQuery=4%20inch%20aluminum%20pipe%20flange",
    aisle: "industrial",
  },
  {
    id: "fastenal-long",
    merchant: "Fastenal",
    title: "1.5 inch OD aluminum tube, 4 ft long, flanged",
    detail: "Round tube.",
    priceCents: 6400,
    href: "https://www.fastenal.com/product/search?query=aluminum%20tube",
    aisle: "industrial",
  },
  {
    id: "msc-rod",
    merchant: "MSC",
    title: "4 inch aluminum rod with a flange",
    detail: "Solid rod.",
    priceCents: 4400,
    href: "https://www.mscdirect.com/browse/tn?searchterm=aluminum%20rod",
    aisle: "industrial",
  },
  {
    id: "zoro-stainless",
    merchant: "Zoro",
    title: "4 inch OD stainless tube, flanged",
    detail: "304 stainless.",
    priceCents: 14000,
    href: "https://www.zoro.com/search?q=stainless%20tube%20flange",
    aisle: "industrial",
  },
  {
    id: "mcmaster-fitting",
    merchant: "McMaster-Carr",
    title: "Slip-on flange, fits 4 inch aluminum tube",
    detail: "Flange only.",
    priceCents: 2860,
    href: "https://www.mcmaster.com/flanges/",
    aisle: "industrial",
  },
  {
    id: "onlinemetals-square",
    merchant: "OnlineMetals",
    title: "4 inch aluminum square tube",
    detail: "Plain ends.",
    priceCents: 5200,
    href: "https://www.onlinemetals.com/",
    aisle: "industrial",
  },
  {
    id: "metals-45",
    merchant: "Metal Supermarkets",
    title: "4.5 inch aluminum tube with a flange",
    detail: "Round tube.",
    priceCents: 11800,
    href: "https://www.metalsupermarkets.com/",
    aisle: "industrial",
  },
];

export function listingsFor(product: string | null, extra: Listing[] = []): Listing[] {
  const apparel = product === "sweater" || product === "cardigan" || product === "polo";
  const industrial = product === "tube" || product === "pipe" || product === "rod" || product === "flange";
  const base = apparel
    ? SHELF.filter((item) => item.aisle === "apparel")
    : industrial
      ? SHELF.filter((item) => item.aisle === "industrial")
      : SHELF;
  return [...base, ...extra];
}

function escapeRe(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function parsePasted(block: string): Listing[] {
  const lines = block
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"));
  const listings: Listing[] = [];
  let n = 1;
  for (const line of lines) {
    const parts = line.split("|").map((part) => part.trim()).filter(Boolean);
    const url = line.match(/https?:\/\/\S+/)?.[0]?.replace(/[.,)]$/, "") ?? "https://aisle.firstdeploy.ai/";
    const priceMatch = line.match(/\$\s*(\d[\d,]*(?:\.\d{1,2})?)/);
    const priceCents = priceMatch ? Math.round(Number(priceMatch[1].replace(/,/g, "")) * 100) : 0;
    let merchant = "Pasted";
    let title = line;
    if (parts.length >= 2 && !parts[0].startsWith("http") && !parts[0].startsWith("$")) {
      merchant = parts[0].slice(0, 40);
      title = parts.slice(1).join(" ");
    }
    title = title
      .replace(/https?:\/\/\S+/g, " ")
      .replace(/\$\s*\d[\d,]*(?:\.\d{1,2})?/g, " ")
      .replace(/\|/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (merchant !== "Pasted") {
      title = title.replace(new RegExp(`^${escapeRe(merchant)}\\b`, "i"), "").trim();
    }
    if (title.length < 3) continue;
    listings.push({
      id: `pasted-${n}`,
      merchant,
      title,
      detail: "Pasted from another shop.",
      priceCents,
      href: url,
      aisle: "custom",
    });
    n += 1;
  }
  return listings;
}
