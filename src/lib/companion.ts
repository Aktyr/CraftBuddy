import { Checkin, CompanionState, UserProfile } from "../types";
import { calculatePeakBac } from "./bac";
import {
  BAC_DRUNK,
  BAC_HAPPY,
  BAC_HARD_LIMIT,
  BAC_LIMIT,
  WATER_UNLOCK_MIN,
} from "./constants";

export type BlockReason = "hard" | "soft" | "forecast" | null;

/**
 * Определяет причину блокировки добавления чекина.
 * @returns "hard" — критический уровень, "soft" — превышен лимит без воды,
 * "forecast" — прогноз превышения, null — блокировки нет.
 */
export function getCheckinBlockReason(
  bac: number,
  lastWaterAt: number,
  now: number,
  checkins: Checkin[],
  profile: UserProfile,
): BlockReason {
  if (bac > BAC_HARD_LIMIT) {
    return "hard";
  }
  if (bac > BAC_LIMIT && !isWaterActive(lastWaterAt, now)) {
    return "soft";
  }
  const peakBac = calculatePeakBac(checkins, profile, now);
  if (peakBac > BAC_HARD_LIMIT) {
    return "forecast";
  }
  return null;
}

/**
 * Состояние компаньона оценивается по прогнозируемому пику BAC,
 * а не по текущей точке. Это даёт упреждающие сообщения:
 * компаньон предупреждает до того, как лимит будет достигнут.
 */
export function getCompanionState(
  bac: number,
  justLeveledUp: boolean,
  peakBac?: number,
): CompanionState {
  if (justLeveledUp) return "levelUp";

  // Источник истины для состояний — прогноз, если он передан
  const effectiveBac = peakBac ?? bac;

  if (effectiveBac > BAC_HARD_LIMIT) return "critical";
  if (effectiveBac > BAC_LIMIT) {
    // Прогноз плохой, но текущий BAC ещё низкий — отдельное сообщение
    return bac < BAC_HAPPY ? "forecast" : "warning";
  }
  if (effectiveBac >= BAC_HAPPY) return "cheerful";
  if (effectiveBac > BAC_DRUNK) return "happy";
  return "idle";
}

export function isWaterActive(
  lastWaterAt: number,
  now: number = Date.now(),
): boolean {
  return now - lastWaterAt < WATER_UNLOCK_MIN * 60_000;
}
