import { Redirect } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { getVisibleMenuItems } from "../../lib/menu";
import { colors } from "../../lib/theme";
import { useAppStore } from "../../store/useAppStore";

export default function DrawerLayout() {
  const profile = useAppStore((s) => s.profile);
  const hasHydrated = useAppStore((s) => s.hasHydrated);

  // Гейт допустим только ниже корня: корневой навигатор уже смонтирован
  if (!hasHydrated) return null;
  if (!profile) return <Redirect href="/onboarding" />;

  const menuItems = getVisibleMenuItems();

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
      {menuItems.map((item) => (
        <Drawer.Screen
          key={item.name}
          name={item.name}
          options={{ title: item.label, drawerLabel: item.label }}
        />
      ))}
    </Drawer>
  );
}
