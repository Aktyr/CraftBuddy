import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import TasteChips from "../components/TasteChips";
import { calculateBac } from "../lib/bac";
import { isCheckinBlocked } from "../lib/companion";
import { GLASSES } from "../lib/constants";
import { colors } from "../lib/theme";
import { useAppStore } from "../store/useAppStore";
import { BeerType, Checkin } from "../types";
import * as Haptics from "expo-haptics";

export default function CheckinScreen() {
  const router = useRouter();
  const profile = useAppStore((s) => s.profile);
  const checkins = useAppStore((s) => s.checkins);
  const lastWaterAt = useAppStore((s) => s.lastWaterAt);
  const addCheckin = useAppStore((s) => s.addCheckin);

  const [name, setName] = useState("");
  const [volume, setVolume] = useState("500");
  const [abv, setAbv] = useState("5");
  const [rating, setRating] = useState(0);
  const [glass, setGlass] = useState(GLASSES[0].id);
  const [beerType, setBeerType] = useState<BeerType>("light");
  const [tasteTags, setTasteTags] = useState<string[]>([]);

  const params = useLocalSearchParams<{
    scannedName?: string;
    scannedAbv?: string;
    scannedBarcode?: string;
    scannedType?: BeerType;
  }>();

  useEffect(() => {
    if (params.scannedName) setName(params.scannedName);
    if (params.scannedAbv) setAbv(params.scannedAbv);
    if (params.scannedType) setBeerType(params.scannedType);
  }, [params]);

  if (profile) {
    const bac = calculateBac(checkins, profile);
    if (isCheckinBlocked(bac, lastWaterAt)) {
      return <Redirect href="/" />;
    }
  }

  const volumeNum = parseInt(volume, 10);
  const abvNum = parseFloat(abv.replace(",", "."));
  const isValid =
    name.trim().length > 0 &&
    !isNaN(volumeNum) &&
    volumeNum > 0 &&
    volumeNum <= 2000 &&
    !isNaN(abvNum) &&
    abvNum > 0 &&
    abvNum <= 60 &&
    rating > 0;

  const TYPES: BeerType[] = ["light", "wheat", "ipa", "dark", "stout"];
  const TYPE_LABELS: Record<BeerType, string> = {
    light: "Светлое",
    wheat: "Пшеничное",
    ipa: "IPA",
    dark: "Тёмное",
    stout: "Стаут",
  };

  const onSave = () => {
    const checkin: Checkin = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      beerName: name.trim(),
      volumeMl: volumeNum,
      abv: abvNum,
      rating,
      glassType: glass,
      beerType,
      tasteTags,
      isNew: true,
      timestamp: Date.now(),
    };
    addCheckin(checkin);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Новый чекин</Text>

        <Text style={styles.label}>Название сорта</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Например, Hazy IPA"
          placeholderTextColor={colors.textLight}
        />

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Объём, мл</Text>
            <TextInput
              style={styles.input}
              value={volume}
              onChangeText={setVolume}
              keyboardType="numeric"
              placeholder="500"
              placeholderTextColor={colors.textLight}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Крепость, %</Text>
            <TextInput
              style={styles.input}
              value={abv}
              onChangeText={setAbv}
              keyboardType="decimal-pad"
              placeholder="5.0"
              placeholderTextColor={colors.textLight}
            />
          </View>
        </View>

        <Text style={styles.label}>Тип пива</Text>
        <View style={styles.row}>
          {TYPES.map((t) => (
            <Pressable
              key={t}
              style={[styles.chip, beerType === t && styles.chipActive]}
              onPress={() => setBeerType(t)}
            >
              <Text
                style={[
                  styles.chipText,
                  beerType === t && styles.chipTextActive,
                ]}
              >
                {TYPE_LABELS[t]}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Оценка</Text>
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Pressable key={n} onPress={() => setRating(n)} hitSlop={6}>
              <Text style={[styles.star, n <= rating && styles.starActive]}>
                ★
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Бокал</Text>
        <View style={styles.row}>
          {GLASSES.map((g) => (
            <Pressable
              key={g.id}
              style={[styles.chip, glass === g.id && styles.chipActive]}
              onPress={() => setGlass(g.id)}
            >
              <Text
                style={[
                  styles.chipText,
                  glass === g.id && styles.chipTextActive,
                ]}
              >
                {g.emoji} {g.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Вкус</Text>
        <TasteChips selected={tasteTags} onChange={setTasteTags} />

        <Pressable
          style={[styles.button, !isValid && styles.buttonDisabled]}
          disabled={!isValid}
          onPress={onSave}
        >
          <Text style={styles.buttonText}>Сохранить</Text>
        </Pressable>
        <Pressable style={styles.cancel} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Отмена</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: colors.bg, flexGrow: 1 },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  row: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  stars: { flexDirection: "row", gap: 6 },
  star: { fontSize: 36, color: colors.inactive },
  starActive: { color: colors.primary },
  chip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    minWidth: 80,
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  chipText: { fontSize: 12, color: colors.textMuted },
  chipTextActive: { color: colors.textPrimary, fontWeight: "700" },
  button: {
    marginTop: 28,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  cancel: { marginTop: 12, alignItems: "center", paddingVertical: 8 },
  cancelText: { color: colors.textSecondary, fontSize: 14 },
});
