import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { Checkin, UserProfile } from "../types";

interface AppState {
  profile: UserProfile | null;
  checkins: Checkin[];
  waterCount: number;
  setProfile: (profile: UserProfile) => void;
  addCheckin: (checkin: Checkin) => void;
  drinkWater: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      profile: null,
      checkins: [],
      waterCount: 0,
      setProfile: (profile) => set({ profile }),
      addCheckin: (checkin) =>
        set((state) => ({ checkins: [...state.checkins, checkin] })),
      drinkWater: () => set((state) => ({ waterCount: state.waterCount + 1 })),
    }),
    {
      name: "craftbuddy-storage",
      storage: createJSONStorage(() => AsyncStorage), // Важно: именно такая обёртка[reference:3]
    },
  ),
);
