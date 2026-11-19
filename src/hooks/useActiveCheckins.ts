import { useMemo } from "react";
import { useAppStore } from "../store/useAppStore";

/**
 * Единый источник истины для расчёта BAC.
 * Возвращает чекины, влияющие на текущее опьянение:
 * все, если сброса не было, либо только те, что после метки сброса.
 */
export function useActiveCheckins() {
  const checkins = useAppStore((s) => s.checkins);
  const lastBacReset = useAppStore((s) => s.lastBacReset);
  return useMemo(
    () =>
      lastBacReset
        ? checkins.filter((c) => c.timestamp >= lastBacReset)
        : checkins,
    [checkins, lastBacReset],
  );
}
