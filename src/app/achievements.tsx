import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import AchievementCard from "../components/AchievementCard";
import { ACHIEVEMENTS, getUnlockedAchievements } from "../lib/achievements";
import { colors } from "../lib/theme";
import { useAppStore } from "../store/useAppStore";

export default function AchievementsScreen() {
  const router = useRouter();
  const checkins = useAppStore((s) => s.checkins);
  const waterCount = useAppStore((s) => s.waterCount);

  const unlocked = useMemo(
    () => getUnlockedAchievements(checkins, waterCount),
    [checkins, waterCount],
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Достижения</Text>
      <Text style={styles.subtitle}>
        Открыто: {unlocked.size} / {ACHIEVEMENTS.length}
      </Text>

      {ACHIEVEMENTS.map((a) => (
        <AchievementCard
          key={a.id}
          achievement={a}
          unlocked={unlocked.has(a.id)}
        />
      ))}

      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backBtnText}>Назад</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: colors.bg, flexGrow: 1 },
  title: { fontSize: 26, fontWeight: "bold", color: colors.textPrimary },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 20,
  },
  backBtn: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.inactive,
    alignItems: "center",
  },
  backBtnText: { color: colors.textMuted, fontSize: 16, fontWeight: "600" },
});
