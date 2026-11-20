import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../lib/theme";
import { SortMode } from "../types";

interface Props {
  value: SortMode;
  onChange: (mode: SortMode) => void;
}

const MODES: { id: SortMode; label: string }[] = [
  { id: "fresh", label: "Свежие" },
  { id: "old", label: "Старые" },
  { id: "rating", label: "Рейтинг" },
  { id: "abv", label: "Крепость" },
];

export default function SortChips({ value, onChange }: Props) {
  return (
    <View
      style={styles.wrap}
      accessibilityRole="radiogroup"
      accessibilityLabel="Сортировка чекинов"
    >
      {MODES.map((mode) => {
        const active = value === mode.id;
        return (
          <Pressable
            key={mode.id}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onChange(mode.id)}
            accessibilityRole="radio"
            accessibilityLabel={mode.label}
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.text, active && styles.textActive]}>
              {mode.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  text: { fontSize: 13, color: colors.textMuted },
  textActive: { color: colors.textPrimary, fontWeight: "700" },
});
