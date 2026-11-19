import { BeerType, Checkin } from "../types";
import { GLASSES, TYPE_LABELS } from "./constants";

export interface Stats {
  totalCount: number;
  totalVolumeMl: number;
  avgRating: number;
  favoriteStyle: string;
  favoriteGlass: string;
}

export function computeStats(checkins: Checkin[]): Stats {
  if (checkins.length === 0) {
    return {
      totalCount: 0,
      totalVolumeMl: 0,
      avgRating: 0,
      favoriteStyle: "—",
      favoriteGlass: "—",
    };
  }

  const totalVolumeMl = checkins.reduce((s, c) => s + c.volumeMl, 0);
  const avgRating =
    checkins.reduce((s, c) => s + c.rating, 0) / checkins.length;

  const byType: Record<string, number> = {};
  const byGlass: Record<string, number> = {};

  for (const c of checkins) {
    byType[c.beerType] = (byType[c.beerType] || 0) + 1;
    byGlass[c.glassType] = (byGlass[c.glassType] || 0) + 1;
  }

  const topType = Object.entries(byType).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topGlass = Object.entries(byGlass).sort((a, b) => b[1] - a[1])[0]?.[0];

  const favoriteStyle = topType
    ? (TYPE_LABELS[topType as BeerType] ?? "—")
    : "—";
  const favoriteGlass = topGlass
    ? (GLASSES.find((g) => g.id === topGlass)?.label ?? "—")
    : "—";

  return {
    totalCount: checkins.length,
    totalVolumeMl,
    avgRating,
    favoriteStyle,
    favoriteGlass,
  };
}
