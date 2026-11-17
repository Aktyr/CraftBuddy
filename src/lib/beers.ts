import beersData from "../data/beers.json";

export interface BeerRecord {
  id: string;
  barcode: string;
  name: string;
  abv: number;
  type: "light" | "dark" | "ipa";
  brewery: string;
}

export const BEERS: BeerRecord[] = beersData as BeerRecord[];

export function findBeerByBarcode(barcode: string): BeerRecord | null {
  return BEERS.find((b) => b.barcode === barcode) ?? null;
}
