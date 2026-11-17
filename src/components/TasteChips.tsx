import { Pressable, StyleSheet, Text, View } from "react-native";
import { TASTE_TAGS } from "../lib/constants";
import { colors } from "../lib/theme";

interface Props {
  selected: string[];
  onChange: (tags: string[]) => void;
}

export default function TasteChips({ selected, onChange }: Props) {
  const toggle = (tag: string) => {
    onChange(
      selected.includes(tag)
        ? selected.filter((t) => t !== tag)
        : [...selected, tag],
    );
  };

  return (
    <View style={styles.wrap}>
      {TASTE_TAGS.map((tag) => {
        const active = selected.includes(tag);
        return (
          <Pressable
            key={tag}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => toggle(tag)}
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
  text: { fontSize: 13, color: colors.textMuted },
  textActive: { color: colors.textPrimary, fontWeight: "700" },
});
