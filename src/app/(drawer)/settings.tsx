import Slider from "@react-native-community/slider";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import AppHeader from "../../components/AppHeader";
import { confirmDestructiveAsync, showInfo } from "../../lib/dialog";
import { colors } from "../../lib/theme";
import { useAppStore } from "../../store/useAppStore";
import { Gender } from "../../types";

export default function SettingsScreen() {
  const router = useRouter();
  const { profile, setProfile, resetAll } = useAppStore();
  const [weight, setWeight] = useState(profile?.weightKg ?? 70);
  const [gender, setGender] = useState<Gender>(profile?.gender ?? "male");
  const version = Constants.expoConfig?.version ?? "1.0.0";

  // Синхронизация локальных состояний с профилем при его изменении извне
  useEffect(() => {
    if (profile) {
      setWeight(profile.weightKg);
      setGender(profile.gender);
    }
  }, [profile]);

  const save = () => {
    setProfile({ weightKg: Math.round(weight), gender });
    showInfo("Сохранено", "Профиль обновлён.");
  };

  const confirmReset = async () => {
    const confirmed = await confirmDestructiveAsync(
      "Сбросить всё?",
      "История, профиль и достижения будут удалены.",
      "Сбросить",
    );
    if (!confirmed) return;
    resetAll();
    router.replace("/onboarding");
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Настройки" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Вес: {Math.round(weight)} кг</Text>
        <Slider
          style={styles.slider}
          minimumValue={40}
          maximumValue={150}
          step={1}
          value={weight}
          onValueChange={setWeight}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.inactive}
          thumbTintColor={colors.primary}
        />

        <Text style={styles.label}>Пол</Text>
        <View style={styles.row}>
          {(["male", "female"] as Gender[]).map((g) => {
            const active = gender === g;
            return (
              <Pressable
                key={g}
                style={[styles.option, active && styles.optionActive]}
                onPress={() => setGender(g)}
              >
                <Text
                  style={[styles.optionText, active && styles.optionTextActive]}
                >
                  {g === "male" ? "Мужской" : "Женский"}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable style={styles.saveBtn} onPress={save}>
          <Text style={styles.saveBtnText}>Сохранить профиль</Text>
        </Pressable>

        <Pressable style={styles.resetBtn} onPress={confirmReset}>
          <Text style={styles.resetBtnText}>🗑 Сбросить всю историю</Text>
        </Pressable>

        <Text style={styles.version}>CraftBuddy v{version}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 24 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  slider: { width: "100%", height: 40, marginBottom: 20 },
  row: { flexDirection: "row", gap: 12, marginBottom: 20 },
  option: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  optionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  optionText: { fontSize: 15, color: colors.textMuted, fontWeight: "500" },
  optionTextActive: { color: colors.textPrimary, fontWeight: "700" },
  saveBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    marginTop: 8,
  },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  resetBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.dangerSoft,
    alignItems: "center",
    marginTop: 24,
  },
  resetBtnText: { color: colors.dangerText, fontSize: 15, fontWeight: "600" },
  version: {
    textAlign: "center",
    color: colors.textLight,
    fontSize: 12,
    marginTop: 24,
  },
});
