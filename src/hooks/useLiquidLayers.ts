import { useMemo } from "react";
import { calculateBac } from "../lib/bac";
import { BAC_LIMIT } from "../lib/constants";
import { useAppStore } from "../store/useAppStore";
import { Checkin } from "../types";
import { LiquidLayer } from "../types/LiquidLayer";
import { useActiveCheckins } from "./useActiveCheckins";

/**
 * Порог вклада группы чекинов в BAC, ниже которого слой не отрисовывается.
 * Защищает от отображения «нулевых» слоёв из-за погрешности float.
 */
const CONTRIBUTION_EPSILON = 1e-6;

/**
 * Группирует активные чекины в слои для визуализации в бокале.
 * Подряд идущие чекины одного типа объединяются в один слой.
 * Высота слоя пропорциональна фактическому вкладу группы в текущий BAC.
 * Чекины с нулевым вкладом (полностью выветрившиеся) исключаются из отрисовки.
 * @param now Текущее время в миллисекундах. Передавайте из родительского компонента.
 */
export function useLiquidLayers(now: number = Date.now()): LiquidLayer[] {
  const activeCheckins = useActiveCheckins();
  const profile = useAppStore((s) => s.profile);

  return useMemo(() => {
    if (activeCheckins.length === 0 || !profile) return [];

    const sorted = [...activeCheckins].sort(
      (a, b) => a.timestamp - b.timestamp,
    );

    const bacAll = calculateBac(activeCheckins, profile, now);
    if (bacAll <= 0) return [];

    // Группируем подряд идущие чекины одного типа
    const groups: { beerType: Checkin["beerType"]; checkins: Checkin[] }[] = [];
    for (const checkin of sorted) {
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.beerType === checkin.beerType) {
        lastGroup.checkins.push(checkin);
      } else {
        groups.push({
          beerType: checkin.beerType,
          checkins: [checkin],
        });
      }
    }

    // Рассчитываем фактический вклад каждой группы в текущий BAC
    const groupsWithContribution = groups
      .map((group) => {
        const withoutGroup = activeCheckins.filter(
          (c) => !group.checkins.some((gc) => gc.id === c.id),
        );
        const bacWithout = calculateBac(withoutGroup, profile, now);
        const contribution = bacAll - bacWithout;
        return {
          beerType: group.beerType,
          contribution: Math.max(0, contribution),
        };
      })
      .filter((g) => g.contribution > CONTRIBUTION_EPSILON);

    if (groupsWithContribution.length === 0) return [];

    const totalContribution = groupsWithContribution.reduce(
      (sum, g) => sum + g.contribution,
      0,
    );

    const totalFillLevel = Math.min(1, bacAll / BAC_LIMIT);

    return groupsWithContribution.map((group) => ({
      beerType: group.beerType,
      heightRatio: (group.contribution / totalContribution) * totalFillLevel,
    }));
  }, [activeCheckins, profile, now]);
}
