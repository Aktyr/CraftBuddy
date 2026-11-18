import { Checkin, CompanionState, UserProfile } from "../types";
import { calculatePeakBac } from "./bac";
import {
  BAC_DRUNK,
  BAC_HAPPY,
  BAC_HARD_LIMIT,
  BAC_LIMIT,
  WATER_UNLOCK_MIN,
} from "./constants";

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

export function isCheckinBlocked(
  bac: number,
  lastWaterAt: number,
  now: number = Date.now(),
  checkins?: Checkin[],
  profile?: UserProfile,
): boolean {
  // 1. Если превышен жёсткий лимит — блокировка абсолютная
  if (bac > BAC_HARD_LIMIT) {
    return true;
  }

  // 2. Если превышен мягкий лимит, но вода НЕ активна — блокируем
  if (bac > BAC_LIMIT && !isWaterActive(lastWaterAt, now)) {
    return true;
  }

  // 3. Превентивная блокировка: если прогноз показывает превышение жёсткого лимита
  if (checkins && profile) {
    const peakBac = calculatePeakBac(checkins, profile, now);
    if (peakBac > BAC_HARD_LIMIT && bac > BAC_LIMIT * 0.7) {
      return true;
    }
  }

  return false;
}

export function isWaterActive(
  lastWaterAt: number,
  now: number = Date.now(),
): boolean {
  return now - lastWaterAt < WATER_UNLOCK_MIN * 60_000;
}
