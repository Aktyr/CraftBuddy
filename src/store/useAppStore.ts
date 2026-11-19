import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { calculateBac } from "../lib/bac";
import { XP_DUPLICATE, XP_NEW_BEER, XP_SCAN_BONUS } from "../lib/constants";
import { AchievementId, Checkin, UserProfile } from "../types";

export interface AppState {
  profile: UserProfile | null;
  checkins: Checkin[];
  xp: number;
  lastWaterAt: number;
  waterCount: number;
  achievements: AchievementId[];
  lastBacReset: number | null;
  /** Пиковый BAC за текущую сессию. Используется для масштабирования стакана. */
  peakBac: number;

  setProfile: (profile: UserProfile) => void;
  addCheckin: (checkin: Checkin) => void;
  drinkWater: () => void;
  resetAll: () => void;
  resetBac: () => void;
  addAchievement: (id: AchievementId) => void;
}

const initialState: Omit<
  AppState,
  | "setProfile"
  | "addCheckin"
  | "drinkWater"
  | "resetAll"
  | "resetBac"
  | "addAchievement"
> = {
  profile: null,
  checkins: [],
  xp: 0,
  lastWaterAt: 0,
  waterCount: 0,
  achievements: [],
  lastBacReset: null,
  peakBac: 0,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setProfile: (profile) => set({ profile }),

      addCheckin: (checkin) => {
        const state = get();
        const newCheckins = [...state.checkins, { ...checkin, isNew: true }];
        const existing = state.checkins.some(
          (c) => c.beerName.toLowerCase() === checkin.beerName.toLowerCase(),
        );
        const baseXp = existing ? XP_DUPLICATE : XP_NEW_BEER;
        const scanBonus = checkin.scannedBarcode ? XP_SCAN_BONUS : 0;

        // Рассчитываем новый пиковый BAC
        const profile = state.profile;
        let newPeakBac = state.peakBac;
        if (profile) {
          const currentBac = calculateBac(newCheckins, profile, Date.now());
          newPeakBac = Math.max(state.peakBac, currentBac);
        }

        set({
          checkins: newCheckins,
          xp: state.xp + baseXp + scanBonus,
          peakBac: newPeakBac,
        });
      },

      drinkWater: () =>
        set({
          lastWaterAt: Date.now(),
          waterCount: get().waterCount + 1,
        }),

      addAchievement: (id) => {
        const state = get();
        if (!state.achievements.includes(id)) {
          set({ achievements: [...state.achievements, id] });
        }
      },

      resetBac: () => set({ lastBacReset: Date.now(), peakBac: 0 }),

      resetAll: () => set(initialState),
    }),
    {
      name: "craftbuddy-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        profile: state.profile,
        checkins: state.checkins,
        xp: state.xp,
        lastWaterAt: state.lastWaterAt,
        waterCount: state.waterCount,
        achievements: state.achievements,
        lastBacReset: state.lastBacReset,
        peakBac: state.peakBac,
      }),
    },
  ),
);
