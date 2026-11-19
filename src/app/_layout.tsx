import { useRouter, useSegments } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { useEffect } from "react";
import { colors } from "../lib/theme";
import { useAppStore } from "../store/useAppStore";

const MENU_ITEMS = [
  { name: "index", label: "🏠 Главная", href: "/" },
  { name: "history", label: "📋 История", href: "/history" },
  { name: "achievements", label: "🏆 Достижения", href: "/achievements" },
  { name: "settings", label: "⚙️ Настройки", href: "/settings" },
  { name: "about", label: "ℹ️ О приложении", href: "/about" },
  { name: "debug", label: "🐛 Debug", href: "/debug" },
];

export default function RootLayout() {
  const profile = useAppStore((s) => s.profile);
  const hasHydrated = useAppStore((s) => s.hasHydrated);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!hasHydrated) return;

    const inOnboarding = segments[0] === "onboarding";
    if (!profile && !inOnboarding) router.replace("/onboarding");
    else if (profile && inOnboarding) router.replace("/");
  }, [profile, segments, hasHydrated, router]);

  if (!hasHydrated) return null;

  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        drawerStyle: { backgroundColor: colors.bg, width: 280 },
        drawerActiveBackgroundColor: colors.primarySoft,
        drawerActiveTintColor: colors.textPrimary,
        drawerInactiveTintColor: colors.textMuted,
      }}
    >
      {MENU_ITEMS.map((item) => (
        <Drawer.Screen
          key={item.name}
          name={item.name}
          options={{ title: item.label, drawerLabel: item.label }}
        />
      ))}
    </Drawer>
  );
}
