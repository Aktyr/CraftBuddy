import { Stack } from "expo-router";

// Якорь обязателен: без index на этом уровне первым по алфавиту станет checkin
export const unstable_settings = { anchor: "(drawer)" };

/** Корневой навигатор. Навигатор монтируется всегда, гейты живут в группе. */
export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
