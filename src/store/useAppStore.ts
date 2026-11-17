import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { XP_DUPLICATE, XP_NEW_BEER } from "../lib/constants";
import { Checkin, UserProfile } from "../types";

interface AppState {
  profile: UserProfile | null;
  checkins: Checkin[];
  xp: number;
  waterCount: number;
  lastWaterAt: number;
  setProfile: (profile: UserProfile) => void;
  addCheckin: (checkin: Checkin) => void;
  drinkWater: () => void;
  resetWater: () => void;
  resetAll: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      profile: null,
      checkins: [],
      xp: 0,
      waterCount: 0,
      lastWaterAt: 0,

      setProfile: (profile) => set({ profile }),

      addCheckin: (checkin) => {
        const state = get();
        const existing = state.checkins.some(
          (c) => c.beerName.toLowerCase() === checkin.beerName.toLowerCase(),
        );
        const xpGain = existing ? XP_DUPLICATE : XP_NEW_BEER;
        set({
          checkins: [...state.checkins, { ...checkin, isNew: !existing }],
          xp: state.xp + xpGain,
        });
      },

      drinkWater: () =>
        set((state) => ({
          waterCount: state.waterCount + 1,
          lastWaterAt: Date.now(),
        })),

      resetWater: () => set({ waterCount: 0, lastWaterAt: 0 }),

      resetAll: () =>
        set({
          profile: null,
          checkins: [],
          xp: 0,
          waterCount: 0,
          lastWaterAt: 0,
        }),
    }),
    {
      name: "craftbuddy-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
