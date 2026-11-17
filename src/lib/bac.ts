import { Checkin, UserProfile } from "../types";

const ALCOHOL_DENSITY = 0.789; // г/мл
const ELIMINATION_RATE = 0.015; // в час (упрощённо)

export function calculateBac(
  checkins: Checkin[],
  profile: UserProfile,
  now: number = Date.now(),
): number {
  const r = profile.gender === "male" ? 0.68 : 0.55;
  let totalBac = 0;

  for (const c of checkins) {
    const alcoholGrams = c.volumeMl * (c.abv / 100) * ALCOHOL_DENSITY;
    const rawBac = alcoholGrams / (profile.weightKg * r * 1000);
    const hoursPassed = (now - c.timestamp) / 3_600_000;
    const remaining = Math.max(0, rawBac - ELIMINATION_RATE * hoursPassed);
    totalBac += remaining;
  }
  return Math.max(0, totalBac);
}
