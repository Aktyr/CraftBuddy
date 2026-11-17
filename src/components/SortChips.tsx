import { Pressable, StyleSheet, Text, View } from "react-native";
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
    <View style={styles.wrap}>
      {OPTIONS.map((o) => {
        const active = value === o.id;
        return (
          <Pressable
            key={o.id}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onChange(o.id)}
          >
            <Text style={[styles.text, active && styles.textActive]}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", gap: 8, marginBottom: 16 },
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
