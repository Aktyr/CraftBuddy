import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "../lib/theme";
import { SortMode } from "../types";

const OPTIONS: { id: SortMode; label: string }[] = [
  { id: "fresh", label: "Свежие" },
  { id: "old", label: "Старые" },
  { id: "rating", label: "Оценка" },
  { id: "abv", label: "Крепость" },
];

interface Props {
  value: SortMode;
  onChange: (v: SortMode) => void;
}

export default function SortChips({ value, onChange }: Props) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.wrap}
      >
        {OPTIONS.map((o) => {
          const active = value === o.id;
          return (
            <Pressable
              key={o.id}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => onChange(o.id)}
            >
              <Text style={styles.text}>{o.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Внешний контейнер задаёт фиксированную высоту — чипы больше не схлопываются
  container: {
    height: 48,
    marginBottom: 16,
  },
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 24,
  },
  // Фиксированные размеры чипа — геометрия константна, прыгать нечему
  chip: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  // Один стиль для текста — никаких изменений при активации
  text: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textMuted,
  },
});
