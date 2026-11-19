import { useRouter, useSegments } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { useEffect } from "react";
import { StyleSheet, Text } from "react-native";
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
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inOnboarding = segments[0] === "onboarding";
    if (!profile && !inOnboarding) router.replace("/onboarding");
    else if (profile && inOnboarding) router.replace("/");
  }, [profile, segments]);

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
          options={{
            title: item.label,
            drawerLabel: ({ focused }) => (
              <Text
                style={[
                  styles.drawerLabel,
                  focused && styles.drawerLabelActive,
                ]}
              >
                {item.label}
              </Text>
            ),
          }}
        />
      ))}
      {/* Только скрытые экраны — их не должно быть в MENU_ITEMS */}
      <Drawer.Screen
        name="onboarding"
        options={{ drawerItemStyle: { display: "none" } }}
      />
      <Drawer.Screen
        name="checkin"
        options={{ drawerItemStyle: { display: "none" } }}
      />
      <Drawer.Screen
        name="scanner"
        options={{ drawerItemStyle: { display: "none" } }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  drawerLabel: { fontSize: 16, fontWeight: "600", marginLeft: 16 },
  drawerLabelActive: { color: colors.textPrimary, fontWeight: "700" },
});
