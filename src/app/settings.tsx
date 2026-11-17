import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors } from "../lib/theme";
import { useAppStore } from "../store/useAppStore";
import { Gender } from "../types";

export default function SettingsScreen() {
  const router = useRouter();
  const { profile, setProfile, resetAll } = useAppStore();
  const [weight, setWeight] = useState(profile?.weightKg ?? 70);
  const [gender, setGender] = useState<Gender>(profile?.gender ?? "male");

  const save = () => {
    setProfile({ weightKg: Math.round(weight), gender });
    if (Platform.OS === "web") {
      window.alert("Сохранено. Профиль обновлён.");
    } else {
      Alert.alert("Сохранено", "Профиль обновлён");
    }
  };

  const confirmReset = () => {
    if (Platform.OS === "web") {
      // На вебе используем браузерный confirm
      if (
        window.confirm(
          "Сбросить всё? История, профиль и достижения будут удалены.",
        )
      ) {
        resetAll();
        router.replace("/onboarding");
      }
    } else {
      // На мобильных — нативный Alert
      Alert.alert(
        "Сбросить всё?",
        "История, профиль и достижения будут удалены.",
        [
          { text: "Отмена", style: "cancel" },
          {
            text: "Сбросить",
            style: "destructive",
            onPress: () => {
              resetAll();
              router.replace("/onboarding");
            },
          },
        ],
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Настройки</Text>

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

      <Text style={styles.version}>CraftBuddy v1.0.0</Text>

      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backBtnText}>Назад</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: colors.bg, flexGrow: 1 },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 24,
  },
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
  backBtn: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.inactive,
    alignItems: "center",
  },
  backBtnText: { color: colors.textMuted, fontSize: 16, fontWeight: "600" },
});
