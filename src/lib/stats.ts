import { BeerType, Checkin } from "../types";
import { TYPE_LABELS } from "./constants";

export interface Stats {
  totalCount: number;
  totalVolumeMl: number;
  avgRating: number;
  favoriteStyle: string;
}

export function computeStats(checkins: Checkin[]): Stats {
  if (checkins.length === 0) {
    return {
      totalCount: 0,
      totalVolumeMl: 0,
      avgRating: 0,
      favoriteStyle: "—",
    };
  }

  const totalVolumeMl = checkins.reduce((s, c) => s + c.volumeMl, 0);
  const avgRating =
    checkins.reduce((s, c) => s + c.rating, 0) / checkins.length;
  const byType: Record<string, number> = {};

  for (const c of checkins) {
    byType[c.beerType] = (byType[c.beerType] || 0) + 1;
  }

  const topType = Object.entries(byType).sort((a, b) => b[1] - a[1])[0]?.[0];
  const favoriteStyle = topType
    ? (TYPE_LABELS[topType as BeerType] ?? "—")
    : "—";

  return {
    totalCount: checkins.length,
    totalVolumeMl,
    avgRating,
    favoriteStyle,
  };
}
