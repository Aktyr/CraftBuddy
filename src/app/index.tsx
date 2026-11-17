import * as Haptics from "expo-haptics";
import { Link } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BacChart from "../components/BacChart";
import BeerGlass from "../components/BeerGlass";
import Companion from "../components/Companion";
import { calculateBac } from "../lib/bac";
import {
  getCompanionState,
  isCheckinBlocked,
  isWaterActive,
} from "../lib/companion";
import {
  BAC_HARD_LIMIT,
  BAC_LIMIT,
  LEVEL_XP,
  WATER_UNLOCK_MIN,
} from "../lib/constants";
import { computeStats } from "../lib/stats";
import { colors } from "../lib/theme";
import { useAppStore } from "../store/useAppStore";

const LEVEL_UP_DISPLAY_MS = 2000;

export default function Home() {
  const insets = useSafeAreaInsets();
  const { profile, checkins, xp, lastWaterAt, drinkWater } = useAppStore();
  const [now, setNow] = useState(Date.now());
  const [justLeveledUp, setJustLeveledUp] = useState(false);
  const prevLevelRef = useRef(Math.floor(xp / LEVEL_XP));

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 20_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const currentLevel = Math.floor(xp / LEVEL_XP);
    if (currentLevel > prevLevelRef.current) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setJustLeveledUp(true);
      prevLevelRef.current = currentLevel;
      const timer = setTimeout(
        () => setJustLeveledUp(false),
        LEVEL_UP_DISPLAY_MS,
      );
      return () => clearTimeout(timer);
    }
  }, [xp]);

  if (!profile) return null;

  const bac = calculateBac(checkins, profile, now);
  const state = getCompanionState(bac, justLeveledUp);
  const waterActive = isWaterActive(lastWaterAt, now);
  const blocked = isCheckinBlocked(bac, lastWaterAt, now);
  const isHardBlocked = bac > BAC_HARD_LIMIT;
  const fillLevel = Math.min(1, bac / BAC_LIMIT);

  const stats = useMemo(() => computeStats(checkins), [checkins]);
  const lastType =
    checkins.length > 0 ? checkins[checkins.length - 1].beerType : "light";

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { paddingBottom: insets.bottom + 24 },
      ]}
    >
      <BeerGlass
        fillLevel={fillLevel}
        size={130}
        beerType={
          checkins.length > 0 ? checkins[checkins.length - 1].beerType : "light"
        }
      />
      <Companion state={state} />
      <Text style={styles.bac}>BAC: {bac.toFixed(3)}</Text>
      <Text style={styles.muted}>
        Чекинов: {checkins.length} · XP: {xp} · Ур.{" "}
        {Math.floor(xp / LEVEL_XP) + 1}
      </Text>

      {checkins.length > 0 && (
        <View style={styles.statsRow}>
          <Text style={styles.statItem}>★ {stats.avgRating.toFixed(1)}</Text>
          <Text style={styles.statItem}>🍺 {stats.favoriteStyle}</Text>
          <Text style={styles.statItem}>{stats.favoriteGlass}</Text>
        </View>
      )}

      <BacChart checkins={checkins} profile={profile} now={now} />

      <View style={styles.actions}>
        <Link href="/achievements" asChild>
          <Pressable style={styles.secondaryBtn}>
            <Text style={styles.secondaryBtnText}>🏆 Достижения</Text>
          </Pressable>
        </Link>
        <Link href="/history" asChild>
          <Pressable style={styles.secondaryBtn}>
            <Text style={styles.secondaryBtnText}>
              📋 История ({checkins.length})
            </Text>
          </Pressable>
        </Link>
        <Link href="/settings" asChild>
          <Pressable style={styles.secondaryBtn}>
            <Text style={styles.secondaryBtnText}>⚙️ Настройки</Text>
          </Pressable>
        </Link>
      </View>

      {isHardBlocked ? (
        <View style={styles.blocked}>
          <Text style={styles.blockedTitle}>⛔ Критический уровень</Text>
          <Text style={styles.blockedText}>
            BAC слишком высок. Виртуальная вода не поможет. Пожалуйста,
            подождите, пока алкоголь выветрится.
          </Text>
          <Text style={styles.hardBlockHint}>
            Текущий BAC: {bac.toFixed(2)} (макс. для разблокировки: 1.5)
          </Text>
        </View>
      ) : blocked ? (
        <View style={styles.blocked}>
          <Text style={styles.blockedTitle}>Лимит превышен</Text>
          <Text style={styles.blockedText}>
            Добавление пива заблокировано. Выпейте стакан воды, чтобы получить
            временный доступ.
          </Text>
          <Pressable
            style={styles.waterBtn}
            onPress={() => {
              drinkWater();
              if (Platform.OS === "web") {
                window.alert(
                  `💧 Блокировка временно снята на ${WATER_UNLOCK_MIN} минут`,
                );
              } else {
                Alert.alert(
                  "💧",
                  `Блокировка временно снята на ${WATER_UNLOCK_MIN} минут`,
                );
              }
            }}
          >
            <Text style={styles.waterText}>💧 Выпить воды</Text>
          </Pressable>
        </View>
      ) : (
        <Link href="/checkin" asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>+ Добавить пиво</Text>
          </Pressable>
        </Link>
      )}

      {waterActive && (
        <Text style={styles.hint}>Вода действует ещё несколько минут</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: colors.bg,
  },
  bac: {
    fontSize: 36,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 4,
    marginTop: 8,
  },
  muted: { fontSize: 13, color: colors.textSecondary, marginBottom: 8 },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.primarySoft,
    borderRadius: 10,
  },
  statItem: { fontSize: 12, color: colors.textPrimary, fontWeight: "600" },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  secondaryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
  },
  secondaryBtnText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  button: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  blocked: {
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    backgroundColor: colors.dangerSoft,
    alignItems: "center",
    maxWidth: 320,
  },
  blockedTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.dangerText,
    marginBottom: 6,
  },
  blockedText: {
    fontSize: 13,
    color: colors.dangerText,
    textAlign: "center",
    marginBottom: 14,
  },
  waterBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: colors.info,
  },
  hardBlockHint: {
    marginTop: 8,
    fontSize: 12,
    color: "#991B1B",
    fontWeight: "bold",
    backgroundColor: "rgba(255,255,255,0.5)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  waterText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  hint: { marginTop: 12, fontSize: 12, color: colors.infoText },
});
