import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppHeader from "../components/AppHeader";
import TasteChips from "../components/TasteChips";
import { useActiveCheckins } from "../hooks/useActiveCheckins";
import { calculateBac } from "../lib/bac";
import { getBeerAccent } from "../lib/beerColor";
import { getCheckinBlockReason } from "../lib/companion";
import {
  BEER_TYPES,
  MAX_ABV_PERCENT,
  MAX_VOLUME_ML,
  TYPE_LABELS,
} from "../lib/constants";
import { colors } from "../lib/theme";
import { useAppStore } from "../store/useAppStore";
import { BeerType, Checkin, TasteTag } from "../types";

export default function CheckinScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const profile = useAppStore((s) => s.profile);
  const lastWaterAt = useAppStore((s) => s.lastWaterAt);
  const addCheckin = useAppStore((s) => s.addCheckin);
  const updateCheckin = useAppStore((s) => s.updateCheckin);
  const checkins = useAppStore((s) => s.checkins);
  const activeCheckins = useActiveCheckins();
  const [name, setName] = useState("");
  const [volume, setVolume] = useState("500");
  const [abv, setAbv] = useState("5");
  const [rating, setRating] = useState(0);
  const [beerType, setBeerType] = useState<BeerType>("light");
  const [tasteTags, setTasteTags] = useState<TasteTag[]>([]);
  const params = useLocalSearchParams<{
    scannedName?: string;
    scannedAbv?: string;
    scannedBarcode?: string;
    scannedType?: BeerType;
    scannedVolume?: string;
    scannedTasteTags?: string;
    scannedRating?: string;
    returnTo?: string;
    _scanKey?: string;
    editId?: string;
  }>();

  const editingCheckin = params.editId
    ? checkins.find((c) => c.id === params.editId)
    : null;

  const isRepeatMode = !!params.scannedName && !editingCheckin;

  useEffect(() => {
    if (editingCheckin) {
      setName(editingCheckin.beerName);
      setAbv(String(editingCheckin.abv));
      setBeerType(editingCheckin.beerType);
      setVolume(String(editingCheckin.volumeMl));
      setTasteTags(editingCheckin.tasteTags);
      setRating(editingCheckin.rating);
    } else {
      setName(params.scannedName ?? "");
      setAbv(params.scannedAbv ?? "5");
      setBeerType(params.scannedType ?? "light");
      setVolume(params.scannedVolume ?? "500");
      if (params.scannedTasteTags) {
        try {
          setTasteTags(JSON.parse(params.scannedTasteTags) as TasteTag[]);
        } catch {
          setTasteTags([]);
        }
      } else {
        setTasteTags([]);
      }
      const scannedRating = params.scannedRating
        ? parseInt(params.scannedRating, 10)
        : 0;
      setRating(scannedRating);
    }
  }, [params._scanKey, params.editId, editingCheckin]);

  if (profile && !editingCheckin) {
    const now = Date.now();
    const bac = calculateBac(activeCheckins, profile, now);
    const blockReason = getCheckinBlockReason(
      bac,
      lastWaterAt,
      now,
      activeCheckins,
      profile,
    );
    if (blockReason !== null) {
      return (
        <View style={{ flex: 1, backgroundColor: colors.bg }}>
          <AppHeader title="Новый чекин" />
          <View style={styles.blockedContainer}>
            <Text style={styles.blockedTitle}>
              {blockReason === "hard"
                ? "Критический уровень BAC"
                : blockReason === "forecast"
                  ? "Прогноз превышения лимита"
                  : "Лимит превышен"}
            </Text>
            <Text style={styles.blockedText}>
              {blockReason === "hard"
                ? "BAC слишком высок. Подождите, пока алкоголь выветрится."
                : blockReason === "forecast"
                  ? "Прогнозируется опасный уровень опьянения. Подождите."
                  : "Добавление пива заблокировано. Выпейте воды или подождите."}
            </Text>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>Назад</Text>
            </Pressable>
          </View>
        </View>
      );
    }
  }

  const volumeNum = parseInt(volume, 10);
  const abvNum = parseFloat(abv.replace(",", "."));
  const isValid =
    name.trim().length > 0 &&
    !isNaN(volumeNum) &&
    volumeNum > 0 &&
    volumeNum <= MAX_VOLUME_ML &&
    !isNaN(abvNum) &&
    abvNum > 0 &&
    abvNum <= MAX_ABV_PERCENT &&
    rating > 0;

  const onSave = () => {
    if (editingCheckin) {
      const success = updateCheckin(editingCheckin.id, {
        beerName: name.trim(),
        volumeMl: volumeNum,
        abv: abvNum,
        rating,
        beerType,
        tasteTags,
      });
      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.back();
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("Ошибка", "Не удалось сохранить изменения");
      }
    } else {
      const checkin: Checkin = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        beerName: name.trim(),
        volumeMl: volumeNum,
        abv: abvNum,
        rating,
        glassType: profile?.preferredGlass ?? "pint",
        beerType,
        tasteTags,
        timestamp: Date.now(),
        scannedBarcode: params.scannedBarcode,
      };
      const success = addCheckin(checkin);
      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        if (params.returnTo === "home") {
          router.replace("/");
        } else {
          router.back();
        }
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert(
          "Добавление заблокировано",
          "Превышен лимит BAC или сработал превентивный запрет. Выпейте воды или подождите.",
        );
      }
    }
  };

  const headerTitle = editingCheckin
    ? "Редактирование чекина"
    : isRepeatMode
      ? "Повторение чекина"
      : "Новый чекин";

  const buttonText = editingCheckin
    ? "Сохранить изменения"
    : isRepeatMode
      ? "Повторить"
      : "Сохранить";

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <AppHeader title={headerTitle} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.container,
            { paddingBottom: insets.bottom + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>{headerTitle}</Text>
          <Text style={styles.label}>Название сорта</Text>
          <TextInput
            style={[styles.input, isRepeatMode && styles.inputDisabled]}
            value={name}
            onChangeText={setName}
            placeholder="Например, Hazy IPA"
            placeholderTextColor={colors.textLight}
            editable={!isRepeatMode}
          />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Объём, мл</Text>
              <TextInput
                style={[styles.input, isRepeatMode && styles.inputDisabled]}
                value={volume}
                onChangeText={setVolume}
                keyboardType="numeric"
                placeholder="500"
                placeholderTextColor={colors.textLight}
                editable={!isRepeatMode}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Крепость, %</Text>
              <TextInput
                style={[styles.input, isRepeatMode && styles.inputDisabled]}
                value={abv}
                onChangeText={setAbv}
                keyboardType="decimal-pad"
                placeholder="5.0"
                placeholderTextColor={colors.textLight}
                editable={!isRepeatMode}
              />
            </View>
          </View>
          <Text style={styles.label}>Тип пива</Text>
          <View style={styles.row}>
            {BEER_TYPES.map((t) => (
              <Pressable
                key={t}
                style={[
                  styles.chip,
                  beerType === t && styles.chipActive,
                  isRepeatMode && styles.chipDisabled,
                ]}
                onPress={() => !isRepeatMode && setBeerType(t)}
                disabled={isRepeatMode}
              >
                <View
                  style={[
                    styles.colorDot,
                    { backgroundColor: getBeerAccent(t) },
                  ]}
                />
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
              <Pressable
                key={n}
                onPress={() => !isRepeatMode && setRating(n)}
                hitSlop={6}
                accessibilityRole="button"
                accessibilityLabel={`Оценка ${n}`}
                accessibilityState={{ selected: n <= rating }}
                disabled={isRepeatMode}
              >
                <Text
                  style={[
                    styles.star,
                    n <= rating && styles.starActive,
                    isRepeatMode && styles.starDisabled,
                  ]}
                >
                  ★
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.label}>Вкус</Text>
          <TasteChips
            selected={tasteTags}
            onChange={setTasteTags}
            disabled={isRepeatMode}
          />
          <Pressable
            style={[styles.button, !isValid && styles.buttonDisabled]}
            disabled={!isValid}
            onPress={onSave}
          >
            <Text style={styles.buttonText}>{buttonText}</Text>
          </Pressable>
          <Pressable style={styles.cancel} onPress={() => router.back()}>
            <Text style={styles.cancelText}>Отмена</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
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
  inputDisabled: {
    backgroundColor: colors.surfaceDisabled,
    color: colors.textMuted,
  },
  row: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  stars: { flexDirection: "row", gap: 6 },
  star: { fontSize: 36, color: colors.inactive },
  starActive: { color: colors.primary },
  starDisabled: { opacity: 0.5 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    minWidth: 80,
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  chipDisabled: {
    opacity: 0.5,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 3,
    marginRight: 6,
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
  blockedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  blockedTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.dangerText,
    marginBottom: 12,
    textAlign: "center",
  },
  blockedText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  backButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
