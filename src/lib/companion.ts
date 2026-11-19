import { Checkin, CompanionState, UserProfile } from "../types";
import { calculatePeakBac } from "./bac";
import {
  BAC_DRUNK,
  BAC_HAPPY,
  BAC_HARD_LIMIT,
  BAC_LIMIT,
  PREVENTIVE_THRESHOLD,
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
  if (peakBac > BAC_HARD_LIMIT && bac > BAC_LIMIT * PREVENTIVE_THRESHOLD) {
    return "forecast";
  }
  return null;
}

export function getCompanionState(
  bac: number,
  justLeveledUp: boolean,
): CompanionState {
  if (justLeveledUp) return "levelUp";
  if (bac > BAC_HARD_LIMIT) return "sleep";
  if (bac > BAC_LIMIT) return "sleep";
  if (bac >= BAC_HAPPY) return "happy";
  if (bac > BAC_DRUNK) return "drunk";
  return "idle";
}

export function isWaterActive(
  lastWaterAt: number,
  now: number = Date.now(),
): boolean {
  return now - lastWaterAt < WATER_UNLOCK_MIN * 60_000;
}
