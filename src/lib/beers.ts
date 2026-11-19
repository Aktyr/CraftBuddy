import beersData from "../data/beers.json";
import { BeerType } from "../types";

export interface BeerRecord {
  id: string;
  barcode: string;
  name: string;
  abv: number;
  type: BeerType;
  brewery: string;
}

function isValidBeerRecord(item: unknown): item is BeerRecord {
  const b = item as Record<string, unknown>;
  return (
    typeof b.id === "string" &&
    typeof b.barcode === "string" &&
    typeof b.name === "string" &&
    typeof b.abv === "number" &&
    typeof b.type === "string" &&
    typeof b.brewery === "string"
  );
}

export const BEERS: BeerRecord[] = (beersData as unknown[]).filter(
  isValidBeerRecord,
);

export function findBeerByBarcode(barcode: string): BeerRecord | null {
  return BEERS.find((b) => b.barcode === barcode) ?? null;
}
