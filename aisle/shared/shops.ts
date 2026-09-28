export type ShopTheme = "wool" | "metal";

export type Shop = {
  slug: string;
  name: string;
  query: string;
  kicker: string;
  line: string;
  theme: ShopTheme;
};

export const SHOPS: Shop[] = [
  {
    slug: "brown-wool",
    name: "Brown Wool",
    query: "brown wool sweater",
    kicker: "Sweaters",
    line: "Every brown wool sweater on the shelf. Cotton, navy, and blends stay in the near-miss row.",
    theme: "wool",
  },
  {
    slug: "flange-tube",
    name: "Flange Tube",
    query: "4 inch aluminum tube with a flange",
    kicker: "Tube",
    line: "4 inch aluminum tube with a flange. Steel, pipe, and plain ends stay in the near-miss row.",
    theme: "metal",
  },
];

export function shopBySlug(slug: string): Shop | undefined {
  return SHOPS.find((shop) => shop.slug === slug);
}
