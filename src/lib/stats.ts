import { Checkin } from "../types";

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
  const favoriteStyle =
    Object.entries(byType).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  const favoriteGlass =
    Object.entries(byGlass).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  return {
    totalCount: checkins.length,
    totalVolumeMl,
    avgRating,
    favoriteStyle,
    favoriteGlass,
  };
}
