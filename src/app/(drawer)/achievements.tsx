import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import AchievementCard from "../../components/AchievementCard";
import AppHeader from "../../components/AppHeader";
import { ACHIEVEMENTS, getUnlockedAchievements } from "../../lib/achievements";
import { XP_PER_ACHIEVEMENT } from "../../lib/constants";
import { colors } from "../../lib/theme";
import { useAppStore } from "../../store/useAppStore";

export default function AchievementsScreen() {
  const checkins = useAppStore((s) => s.checkins);
  const waterCount = useAppStore((s) => s.waterCount);
  const unlocked = useMemo(
    () => getUnlockedAchievements(checkins, waterCount),
    [checkins, waterCount],
  );

  const getProgress = (achievementId: string): string | undefined => {
    switch (achievementId) {
      case "first_beer":
        return checkins.length >= 1 ? undefined : `${checkins.length}/1`;
      case "taster":
        return checkins.length >= 10 ? undefined : `${checkins.length}/10`;
      case "gourmet": {
        const unique = new Set(checkins.map((c) => c.beerName.toLowerCase()))
          .size;
        return unique >= 5 ? undefined : `${unique}/5`;
      }
      case "traveler": {
        const types = new Set(checkins.map((c) => c.beerType)).size;
        return types >= 5 ? undefined : `${types}/5`;
      }
      case "teetotaler":
        return waterCount >= 5 ? undefined : `${waterCount}/5`;
      default:
        return undefined;
    }
  };

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
            xpReward={XP_PER_ACHIEVEMENT}
            progress={getProgress(a.id)}
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
