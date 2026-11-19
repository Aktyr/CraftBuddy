import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { calculateBac } from "../lib/bac";
import { findBeerByBarcode } from "../lib/beers";
import { getCheckinBlockReason } from "../lib/companion";
import { XP_DUPLICATE, XP_NEW_BEER, XP_SCAN_BONUS } from "../lib/constants";
import { Checkin, UserProfile } from "../types";

export interface AppState {
  profile: UserProfile | null;
  checkins: Checkin[];
  xp: number;
  lastWaterAt: number;
  waterCount: number;
  lastBacReset: number | null;
  hasHydrated: boolean;

  setProfile: (profile: UserProfile) => void;
  addCheckin: (checkin: Checkin) => boolean;
  drinkWater: () => void;
  resetAll: () => void;
  resetBac: () => void;
  setHasHydrated: (v: boolean) => void;
}

const initialState: Omit<
  AppState,
  | "setProfile"
  | "addCheckin"
  | "drinkWater"
  | "resetAll"
  | "resetBac"
  | "setHasHydrated"
> = {
  profile: null,
  checkins: [],
  xp: 0,
  lastWaterAt: 0,
  waterCount: 0,
  lastBacReset: null,
  hasHydrated: false,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setProfile: (profile) => set({ profile }),
      setHasHydrated: (v) => set({ hasHydrated: v }),

      addCheckin: (checkin) => {
        const state = get();
        if (!state.profile) return false;

        const activeCheckins =
          state.lastBacReset !== null
            ? state.checkins.filter((c) => c.timestamp >= state.lastBacReset!)
            : state.checkins;

        const blockReason = getCheckinBlockReason(
          calculateBac(activeCheckins, state.profile, checkin.timestamp),
          state.lastWaterAt,
          checkin.timestamp,
          activeCheckins,
          state.profile,
        );

        if (blockReason !== null) {
          return false;
        }

        const newCheckins = [...state.checkins, checkin];
        const existing = state.checkins.some(
          (c) => c.beerName.toLowerCase() === checkin.beerName.toLowerCase(),
        );
        const baseXp = existing ? XP_DUPLICATE : XP_NEW_BEER;

        // Бонус за сканирование начисляется только если штрихкод найден в базе
        const scanBonus =
          checkin.scannedBarcode && findBeerByBarcode(checkin.scannedBarcode)
            ? XP_SCAN_BONUS
            : 0;

        set({
          checkins: newCheckins,
          xp: state.xp + baseXp + scanBonus,
        });

        return true;
      },

      drinkWater: () =>
        set({
          lastWaterAt: Date.now(),
          waterCount: get().waterCount + 1,
        }),

      resetBac: () => set({ lastBacReset: Date.now() }),

      resetAll: () => set({ ...initialState, hasHydrated: true }),
    }),
    {
      name: "craftbuddy-storage",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => {
        return (_state, error) => {
          useAppStore.getState().setHasHydrated(!error);
        };
      },
      partialize: (state) => ({
        profile: state.profile,
        checkins: state.checkins,
        xp: state.xp,
        lastWaterAt: state.lastWaterAt,
        waterCount: state.waterCount,
        lastBacReset: state.lastBacReset,
      }),
    },
  ),
);
