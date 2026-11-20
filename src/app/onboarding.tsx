import Slider from "@react-native-community/slider";
import { Redirect, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { GLASSES } from "../lib/constants";
import { colors } from "../lib/theme";
import { useAppStore } from "../store/useAppStore";
import { Gender } from "../types";

export default function Onboarding() {
  const profile = useAppStore((s) => s.profile);
  const setProfile = useAppStore((s) => s.setProfile);
  const router = useRouter();
  const [weight, setWeight] = useState(70);
  const [gender, setGender] = useState<Gender | null>(null);

  const canContinue = gender !== null;

  if (profile) return <Redirect href="/" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CraftBuddy</Text>
      <Text style={styles.subtitle}>Немного о вас — нужно для расчёта BAC</Text>

      <View style={styles.block}>
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
        <View style={styles.range}>
          <Text style={styles.rangeText}>40</Text>
          <Text style={styles.rangeText}>150</Text>
        </View>
      </View>

      <View style={styles.block}>
        <Text style={styles.label}>Пол</Text>
        <View style={styles.row}>
          <Pressable
            style={[styles.option, gender === "male" && styles.optionActive]}
            onPress={() => setGender("male")}
          >
            <Text
              style={[
                styles.optionText,
                gender === "male" && styles.optionTextActive,
              ]}
            >
              Мужской
            </Text>
          </Pressable>
          <Pressable
            style={[styles.option, gender === "female" && styles.optionActive]}
            onPress={() => setGender("female")}
          >
            <Text
              style={[
                styles.optionText,
                gender === "female" && styles.optionTextActive,
              ]}
            >
              Женский
            </Text>
          </Pressable>
        </View>
      </View>

      <Pressable
        style={[styles.button, !canContinue && styles.buttonDisabled]}
        disabled={!canContinue}
        onPress={() => {
          setProfile({
            weightKg: Math.round(weight),
            gender: gender!,
            preferredGlass: GLASSES[0].id,
          });
          router.replace("/");
        }}
      >
        <Text style={styles.buttonText}>Продолжить</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: colors.bg,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 32 },
  block: { marginBottom: 28 },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  slider: { width: "100%", height: 40 },
  range: { flexDirection: "row", justifyContent: "space-between" },
  rangeText: { fontSize: 12, color: colors.textSecondary },
  row: { flexDirection: "row", gap: 12 },
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
  button: {
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: colors.surface, fontSize: 16, fontWeight: "700" },
});
