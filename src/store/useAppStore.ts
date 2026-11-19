import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";
import { calculateBac } from "../lib/bac";
import { findBeerByBarcode } from "../lib/beers";
import { getCheckinBlockReason } from "../lib/companion";
import { XP_DUPLICATE, XP_NEW_BEER, XP_SCAN_BONUS } from "../lib/constants";
import { Checkin, UserProfile } from "../types";

// В React Native window есть, а localStorage нет, поэтому на устройствах пишем в AsyncStorage.
// Проверка window нужна только для серверного рендера веба
const safeStorage: StateStorage = {
  getItem: async (name) => {
    if (Platform.OS !== "web") return AsyncStorage.getItem(name);
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(name);
  },
  setItem: async (name, value) => {
    if (Platform.OS !== "web") return AsyncStorage.setItem(name, value);
    if (typeof window === "undefined") return;
    window.localStorage.setItem(name, value);
  },
  removeItem: async (name) => {
    if (Platform.OS !== "web") return AsyncStorage.removeItem(name);
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(name);
  },
};

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
        let newCheckins = [...state.checkins, checkin];
        if (newCheckins.length > 1000) {
          newCheckins = newCheckins.slice(-1000);
        }
        const existing = state.checkins.some(
          (c) => c.beerName.toLowerCase() === checkin.beerName.toLowerCase(),
        );
        const baseXp = existing ? XP_DUPLICATE : XP_NEW_BEER;
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
      version: 1,
      migrate: (persistedState: any, version: number) => {
        // Битая запись не должна ронять гидрацию, иначе флаг загрузки не выставится
        if (!persistedState || typeof persistedState !== "object") {
          return persistedState as any;
        }
        if (version === 0) {
          delete persistedState.peakBac;
          delete persistedState.achievements;
          if (Array.isArray(persistedState.checkins)) {
            persistedState.checkins = persistedState.checkins.map((c: any) => {
              const { isNew, ...rest } = c;
              return rest;
            });
          }
        }
        return persistedState as any;
      },
      storage: createJSONStorage(() => safeStorage),

      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn("Zustand hydration error:", error);
        }
        // При ошибке чтения state не приходит, а флаг нужен, иначе layout навсегда вернёт null.
        // Обращение к useAppStore безопасно: AsyncStorage отвечает асинхронно, стор уже создан
        (state ?? useAppStore.getState()).setHasHydrated(true);
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
