import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import AppHeader from "../../components/AppHeader";
import { GLASSES } from "../../lib/constants";
import { colors } from "../../lib/theme";
import { useAppStore } from "../../store/useAppStore";
import { GlassId } from "../../types";

export default function SkinsScreen() {
  const router = useRouter();
  const profile = useAppStore((s) => s.profile);
  const setProfile = useAppStore((s) => s.setProfile);
  const [selectedGlass, setSelectedGlass] = useState<GlassId>(
    profile?.preferredGlass ?? GLASSES[0].id,
  );

  const handleSave = () => {
    if (profile) {
      setProfile({ ...profile, preferredGlass: selectedGlass });
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Скины бокалов" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>
          Выберите бокал по умолчанию для новых чекинов
        </Text>
        <View style={styles.grid}>
          {GLASSES.map((g) => {
            const active = selectedGlass === g.id;
            return (
              <Pressable
                key={g.id}
                style={[styles.card, active && styles.cardActive]}
                onPress={() => setSelectedGlass(g.id)}
              >
                <Text style={styles.emoji}>{g.emoji}</Text>
                <Text style={[styles.label, active && styles.labelActive]}>
                  {g.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Pressable style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Сохранить</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 24 },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  card: {
    flex: 1,
    minWidth: "45%",
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
  },
  cardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  emoji: { fontSize: 48, marginBottom: 8 },
  label: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: "500",
  },
  labelActive: {
    color: colors.textPrimary,
    fontWeight: "700",
  },
  saveBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
