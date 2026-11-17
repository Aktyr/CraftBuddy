import { CompanionState } from "../types";
import { BAC_DRUNK, BAC_HAPPY, BAC_LIMIT, WATER_UNLOCK_MIN } from "./constants";

export function getCompanionState(
  bac: number,
  justLeveledUp: boolean,
): CompanionState {
  if (justLeveledUp) return "levelUp";
  if (bac > BAC_LIMIT) return "sleep";
  if (bac >= BAC_HAPPY) return "happy";
  if (bac > BAC_DRUNK) return "drunk";
  return "idle";
}

export function isCheckinBlocked(bac: number): boolean {
  return bac > BAC_LIMIT;
}

export function isWaterActive(
  lastWaterAt: number,
  now: number = Date.now(),
): boolean {
  return now - lastWaterAt < WATER_UNLOCK_MIN * 60_000;
}
