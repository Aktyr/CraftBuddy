import { Pressable, StyleSheet, Text, View } from "react-native";
import { TASTE_TAGS } from "../lib/constants";
import { colors } from "../lib/theme";
import { TasteTag } from "../types";

interface Props {
  selected: TasteTag[];
  onChange: (tags: TasteTag[]) => void;
  disabled?: boolean;
}
export default function TasteChips({
  selected,
  onChange,
  disabled = false,
}: Props) {
  const toggle = (tag: TasteTag) => {
    if (disabled) return;
    onChange(
      selected.includes(tag)
        ? selected.filter((t) => t !== tag)
        : [...selected, tag],
    );
  };
  return (
    <View
      style={styles.wrap}
      accessibilityRole="group"
      accessibilityLabel="Вкусовые теги"
    >
      {TASTE_TAGS.map((tag) => {
        const active = selected.includes(tag);
        return (
          <Pressable
            key={tag}
            style={[
              styles.chip,
              active && styles.chipActive,
              disabled && styles.chipDisabled,
            ]}
            onPress={() => toggle(tag)}
            accessibilityRole="checkbox"
            accessibilityLabel={tag}
            accessibilityState={{ checked: active, disabled }}
            disabled={disabled}
          >
            <Text style={[styles.text, active && styles.textActive]}>
              {tag}
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
    paddingHorizontal: 12,
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
  chipDisabled: {
    opacity: 0.5,
  },
  text: { fontSize: 13, color: colors.textMuted },
  textActive: { color: colors.textPrimary, fontWeight: "700" },
});
