import { CompanionState } from "../types";
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
  if (bac > BAC_HARD_LIMIT) return "sleep"; // Спит при критическом уровне
  if (bac > BAC_LIMIT) return "sleep"; // Спит при обычном превышении
  if (bac >= BAC_HAPPY) return "happy";
  if (bac > BAC_DRUNK) return "drunk";
  return "idle";
}

// Теперь функция принимает время и последний приём воды
export function isCheckinBlocked(
  bac: number,
  lastWaterAt: number,
  now: number = Date.now(),
): boolean {
  // 1. Если превышен жёсткий лимит — блокировка абсолютная, вода не поможет
  if (bac > BAC_HARD_LIMIT) {
    return true;
  }

  // 2. Если превышен мягкий лимит, но вода НЕ активна — блокируем
  if (bac > BAC_LIMIT && !isWaterActive(lastWaterAt, now)) {
    return true;
  }

  // 3. Во всех остальных случаях (включая мягкий лимит + активная вода) — разрешаем
  return false;
}

export function isWaterActive(
  lastWaterAt: number,
  now: number = Date.now(),
): boolean {
  return now - lastWaterAt < WATER_UNLOCK_MIN * 60_000;
}
