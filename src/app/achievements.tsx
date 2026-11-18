import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import AchievementCard from "../components/AchievementCard";
import AppHeader from "../components/AppHeader";
import { ACHIEVEMENTS, getUnlockedAchievements } from "../lib/achievements";
import { colors } from "../lib/theme";
import { useAppStore } from "../store/useAppStore";

export default function AchievementsScreen() {
  const checkins = useAppStore((s) => s.checkins);
  const waterCount = useAppStore((s) => s.waterCount);
  const unlocked = useMemo(
    () => getUnlockedAchievements(checkins, waterCount),
    [checkins, waterCount],
  );

  return (
    <View style={styles.container}>
      <AppHeader title="Достижения" />
      <ScrollView contentContainerStyle={styles.content}>
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 24 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 20 },
});
