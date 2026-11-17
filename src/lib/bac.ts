import { Checkin, UserProfile } from "../types";

const ALCOHOL_DENSITY = 0.789; // г/мл
const ELIMINATION_RATE = 0.015; // промилле/час
const ABSORPTION_MIN = 45; // минут на полное усвоение

export function calculateBac(
  checkins: Checkin[],
  profile: UserProfile,
  now: number = Date.now(),
): number {
  const r = profile.gender === "male" ? 0.68 : 0.55;
  let totalBac = 0;

  for (const c of checkins) {
    const alcoholGrams = c.volumeMl * (c.abv / 100) * ALCOHOL_DENSITY;
    const rawBac = alcoholGrams / (profile.weightKg * r);
    const minutesPassed = (now - c.timestamp) / 60_000;

    // Модель усвоения: плавный подъём за 45 минут (квадратичная кривая)
    let absorptionFactor = 1;
    if (minutesPassed < ABSORPTION_MIN) {
      const t = minutesPassed / ABSORPTION_MIN;
      absorptionFactor = t * (2 - t); // плавный подъём с замедлением
    }

    const hoursPassed = minutesPassed / 60;
    const eliminated = ELIMINATION_RATE * hoursPassed;
    const remaining = Math.max(0, rawBac * absorptionFactor - eliminated);
    totalBac += remaining;
  }

  return Math.max(0, totalBac);
}
