import { StyleSheet, Text, View } from "react-native";
import { colors } from "../lib/theme";
import { Achievement } from "../types";

interface Props {
  achievement: Achievement;
  unlocked: boolean;
}

export default function AchievementCard({ achievement, unlocked }: Props) {
  return (
    <View style={[styles.card, !unlocked && styles.cardLocked]}>
      <Text style={[styles.emoji, !unlocked && styles.emojiLocked]}>
        {achievement.emoji}
      </Text>
      <View style={styles.body}>
        <Text style={[styles.title, !unlocked && styles.titleLocked]}>
          {achievement.title}
        </Text>
        <Text style={[styles.desc, !unlocked && styles.descLocked]}>
          {achievement.description}
        </Text>
      </View>
      {unlocked && <Text style={styles.badge}>✓</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.borderWarm,
  },
  cardLocked: {
    backgroundColor: "#F3F4F6",
    borderColor: colors.border,
    opacity: 0.7,
  },
  emoji: { fontSize: 36, marginRight: 14 },
  emojiLocked: {},
  body: { flex: 1 },
  title: { fontSize: 16, fontWeight: "700", color: colors.textPrimary },
  titleLocked: { color: colors.textLight },
  desc: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  descLocked: { color: colors.textLight },
  badge: { fontSize: 20, color: colors.success, fontWeight: "bold" },
});
