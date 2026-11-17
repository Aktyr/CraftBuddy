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
import { calculateBac } from "../lib/bac";
import { isCheckinBlocked, isWaterActive } from "../lib/companion";
import { useAppStore } from "../store/useAppStore";
import { Checkin } from "../types";

const GLASSES = [
  { id: "tulip", label: "Тюльпан" },
  { id: "pint", label: "Пинта" },
  { id: "snifter", label: "Снифтер" },
];

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
  const [glass, setGlass] = useState("tulip");

  const params = useLocalSearchParams<{
    scannedName?: string;
    scannedAbv?: string;
    scannedBarcode?: string;
  }>();

  useEffect(() => {
    if (params.scannedName) {
      setName(params.scannedName);
    }
    if (params.scannedAbv) {
      setAbv(params.scannedAbv);
    }
  }, [params.scannedName, params.scannedAbv]);

  if (profile) {
    const bac = calculateBac(checkins, profile);
    if (isCheckinBlocked(bac) && !isWaterActive(lastWaterAt)) {
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

  const onSave = () => {
    const checkin: Checkin = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      beerName: name.trim(),
      volumeMl: volumeNum,
      abv: abvNum,
      rating,
      glassType: glass,
      tasteTags: [],
      timestamp: Date.now(),
    };
    addCheckin(checkin);
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
          placeholderTextColor="#9CA3AF"
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
              placeholderTextColor="#9CA3AF"
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
              placeholderTextColor="#9CA3AF"
            />
          </View>
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
                {g.label}
              </Text>
            </Pressable>
          ))}
        </View>

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
  container: { padding: 24, backgroundColor: "#FFFBEB", flexGrow: 1 },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#78350F",
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#78350F",
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  row: { flexDirection: "row", gap: 12 },
  stars: { flexDirection: "row", gap: 6 },
  star: { fontSize: 36, color: "#E5E7EB" },
  starActive: { color: "#F59E0B" },
  chip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  chipActive: { borderColor: "#F59E0B", backgroundColor: "#FEF3C7" },
  chipText: { fontSize: 13, color: "#6B7280" },
  chipTextActive: { color: "#78350F", fontWeight: "700" },
  button: {
    marginTop: 28,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#F59E0B",
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  cancel: { marginTop: 12, alignItems: "center", paddingVertical: 8 },
  cancelText: { color: "#92400E", fontSize: 14 },
});
