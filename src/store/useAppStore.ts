import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
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
    (set) => ({
      profile: null,
      checkins: [],
      xp: 0,
      waterCount: 0,
      lastWaterAt: 0,

      setProfile: (profile) => set({ profile }),

      addCheckin: (checkin) =>
        set((state) => ({
          checkins: [...state.checkins, checkin],
          xp: state.xp + 10,
        })),

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
