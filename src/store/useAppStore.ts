import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";
import { getUnlockedAchievements } from "../lib/achievements";
import { calculateBac } from "../lib/bac";
import { findBeerByBarcode } from "../lib/beers";
import { getCheckinBlockReason } from "../lib/companion";
import {
  GLASSES,
  XP_DUPLICATE,
  XP_NEW_BEER,
  XP_PER_ACHIEVEMENT,
  XP_SCAN_BONUS,
} from "../lib/constants";
import { AchievementId, Checkin, SortMode, UserProfile } from "../types";

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
  claimedAchievements: AchievementId[];
  historySort: SortMode;
  historyGrouped: boolean;
  setProfile: (profile: UserProfile) => void;
  addCheckin: (checkin: Checkin) => boolean;
  updateCheckin: (id: string, patch: Partial<Checkin>) => boolean;
  drinkWater: () => void;
  resetAll: () => void;
  resetBac: () => void;
  setHasHydrated: (v: boolean) => void;
  setHistorySort: (mode: SortMode) => void;
  setHistoryGrouped: (v: boolean) => void;
}

const initialState: Omit<
  AppState,
  | "setProfile"
  | "addCheckin"
  | "updateCheckin"
  | "drinkWater"
  | "resetAll"
  | "resetBac"
  | "setHasHydrated"
  | "setHistorySort"
  | "setHistoryGrouped"
> = {
  profile: null,
  checkins: [],
  xp: 0,
  lastWaterAt: 0,
  waterCount: 0,
  lastBacReset: null,
  hasHydrated: false,
  claimedAchievements: [],
  historySort: "fresh",
  historyGrouped: false,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,
      setProfile: (profile) => set({ profile }),
      setHasHydrated: (v) => set({ hasHydrated: v }),
      setHistorySort: (mode) => set({ historySort: mode }),
      setHistoryGrouped: (v) => set({ historyGrouped: v }),
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
        // Начисляем XP за новые достижения после добавления чекина
        const newUnlocked = getUnlockedAchievements(
          newCheckins,
          state.waterCount,
        );
        const newlyClaimed = [...newUnlocked].filter(
          (id) => !state.claimedAchievements.includes(id),
        );
        const achievementXp = newlyClaimed.length * XP_PER_ACHIEVEMENT;
        set({
          checkins: newCheckins,
          xp: state.xp + baseXp + scanBonus + achievementXp,
          claimedAchievements: [...state.claimedAchievements, ...newlyClaimed],
        });
        return true;
      },
      updateCheckin: (id, patch) => {
        const state = get();
        const idx = state.checkins.findIndex((c) => c.id === id);
        if (idx === -1) return false;
        const updated: Checkin = { ...state.checkins[idx], ...patch, id };
        const newCheckins = [...state.checkins];
        newCheckins[idx] = updated;
        set({ checkins: newCheckins });
        return true;
      },
      drinkWater: () => {
        const state = get();
        const newWaterCount = state.waterCount + 1;
        // Начисляем XP за новые достижения после питья воды
        const newUnlocked = getUnlockedAchievements(
          state.checkins,
          newWaterCount,
        );
        const newlyClaimed = [...newUnlocked].filter(
          (id) => !state.claimedAchievements.includes(id),
        );
        const achievementXp = newlyClaimed.length * XP_PER_ACHIEVEMENT;
        set({
          lastWaterAt: Date.now(),
          waterCount: newWaterCount,
          xp: state.xp + achievementXp,
          claimedAchievements: [...state.claimedAchievements, ...newlyClaimed],
        });
      },
      resetBac: () => set({ lastBacReset: Date.now() }),
      resetAll: () => set({ ...initialState, hasHydrated: true }),
    }),
    {
      name: "craftbuddy-storage",
      version: 1,
      migrate: (persistedState: any, version: number) => {
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
        // Миграция: добавить preferredGlass в старые профили
        if (persistedState.profile && !persistedState.profile.preferredGlass) {
          persistedState.profile.preferredGlass = GLASSES[0].id;
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
        historySort: state.historySort,
        historyGrouped: state.historyGrouped,
      }),
    },
  ),
);
