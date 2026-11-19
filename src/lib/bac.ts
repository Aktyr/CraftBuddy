import { Checkin, UserProfile } from "../types";

const ALCOHOL_DENSITY = 0.789;
/** Средняя скорость элиминации алкоголя (промилле в час) по формуле Видмарка */
const ELIMINATION_RATE = 0.15;
/** Время полного всасывания дозы, минут */
const ABSORPTION_MIN = 45;

/**
 * Рассчитывает текущую концентрацию алкоголя в крови (BAC).
 * Включает модель всасывания: пик достигается через ABSORPTION_MIN после чекина.
 * @param checkins История чекинов
 * @param profile Параметры пользователя (вес, пол)
 * @param now Текущее время в миллисекундах
 * @returns Текущий уровень BAC в промилле
 */
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

    // Квадратичная кривая всасывания: 0 в момент 0, 1 в момент ABSORPTION_MIN
    let absorptionFactor = 1;
    if (minutesPassed < ABSORPTION_MIN) {
      const t = minutesPassed / ABSORPTION_MIN;
      absorptionFactor = t * (2 - t);
    }

    const hoursPassed = minutesPassed / 60;
    const remaining = Math.max(
      0,
      rawBac * absorptionFactor - ELIMINATION_RATE * hoursPassed,
    );
    totalBac += remaining;
  }

  return Math.max(0, totalBac);
}
/**
 * Рассчитывает прогнозируемый пик BAC в ближайшие 2 часа.
 * Используется для мгновенного заполнения стакана при чекине.
 */
export function calculatePeakBac(
  checkins: Checkin[],
  profile: UserProfile,
  now: number = Date.now(),
): number {
  let peak = 0;
  for (let t = now; t <= now + 2 * 60 * 60 * 1000; t += 5 * 60 * 1000) {
    const bac = calculateBac(checkins, profile, t);
    if (bac > peak) peak = bac;
  }
  return peak;
}
