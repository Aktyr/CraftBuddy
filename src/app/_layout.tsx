import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { useAppStore } from "../store/useAppStore";

export default function RootLayout() {
  const profile = useAppStore((s) => s.profile);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inOnboarding = segments[0] === "onboarding";
    if (!profile && !inOnboarding) router.replace("/onboarding");
    else if (profile && inOnboarding) router.replace("/");
  }, [profile, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="index" />
      <Stack.Screen name="checkin" />
      <Stack.Screen name="history" />
      <Stack.Screen name="scanner" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="achievements" />
    </Stack>
  );
}
