import { DrawerActions } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { Link, useFocusEffect, useNavigation } from "expo-router";
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
import AppHeader from "../components/AppHeader";
import BacChart from "../components/BacChart";
import BeerGlass from "../components/BeerGlass";
import Companion from "../components/Companion";
import QrIcon from "../components/icons/QrIcon";
import { useActiveCheckins } from "../hooks/useActiveCheckins";
import { calculateBac, calculatePeakBac } from "../lib/bac";
import {
  getCheckinBlockReason,
  getCompanionState,
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
  const navigation = useNavigation();
  const { profile, xp, lastWaterAt, drinkWater } = useAppStore();
  const activeCheckins = useActiveCheckins();
  const [now, setNow] = useState(Date.now());
  const [justLeveledUp, setJustLeveledUp] = useState(false);
  const prevLevelRef = useRef(Math.floor(xp / LEVEL_XP));

  // Таймер обновляет now только пока экран в фокусе
  useFocusEffect(
    useMemo(
      () => () => {
        const t = setInterval(() => setNow(Date.now()), 5_000);
        return () => clearInterval(t);
      },
      [],
    ),
  );

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

  // useMemo ДО early return — иначе ломается правило хуков React
  const stats = useMemo(() => computeStats(activeCheckins), [activeCheckins]);

  if (!profile) return null;

  const bac = calculateBac(activeCheckins, profile, now);
  const peakBac = calculatePeakBac(activeCheckins, profile, now);
  const state = getCompanionState(bac, justLeveledUp);
  const waterActive = isWaterActive(lastWaterAt, now);
  const blockReason = getCheckinBlockReason(
    bac,
    lastWaterAt,
    now,
    activeCheckins,
    profile,
  );

  const fillLevel = Math.min(1, peakBac / BAC_LIMIT);
  const lastType =
    activeCheckins.length > 0
      ? activeCheckins[activeCheckins.length - 1].beerType
      : "light";

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <AppHeader
        title="CraftBuddy"
        isHome
        onMenuPress={() => navigation.dispatch(DrawerActions.openDrawer())}
      />
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <BeerGlass fillLevel={fillLevel} size={130} beerType={lastType} />
        <Companion state={state} />
        <Text style={styles.bac}>BAC: {bac.toFixed(3)}</Text>
        <Text style={styles.muted}>
          Чекинов: {activeCheckins.length} · XP: {xp} · Ур.{" "}
          {Math.floor(xp / LEVEL_XP) + 1}
        </Text>
        {activeCheckins.length > 0 ? (
          <View style={styles.statsRow}>
            <Text style={styles.statItem}>★ {stats.avgRating.toFixed(1)}</Text>
            <Text style={styles.statItem}>🍺 {stats.favoriteStyle}</Text>
            <Text style={styles.statItem}>{stats.favoriteGlass}</Text>
          </View>
        ) : null}
        <BacChart checkins={activeCheckins} profile={profile} now={now} />
        {blockReason === "hard" ? (
          <View style={styles.blocked}>
            <Text style={styles.blockedTitle}>Критический уровень</Text>
            <Text style={styles.blockedText}>
              BAC слишком высок. Виртуальная вода не поможет. Пожалуйста,
              подождите, пока алкоголь выветрится.
            </Text>
            <Text style={styles.hardBlockHint}>
              Текущий BAC: {bac.toFixed(2)} (макс. для разблокировки:{" "}
              {BAC_HARD_LIMIT})
            </Text>
          </View>
        ) : blockReason !== null ? (
          <View style={styles.blocked}>
            <Text style={styles.blockedTitle}>
              {blockReason === "forecast"
                ? "Прогноз превышения лимита"
                : "Лимит превышен"}
            </Text>
            <Text style={styles.blockedText}>
              {blockReason === "forecast"
                ? "Прогнозируется опасный уровень опьянения. Подождите, пока алкоголь выветрится."
                : "Добавление пива заблокировано. Выпейте стакан воды, чтобы получить временный доступ."}
            </Text>
            {blockReason === "soft" && (
              <Pressable
                style={styles.waterBtn}
                onPress={() => {
                  drinkWater();
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  if (Platform.OS === "web") {
                    window.alert(
                      `Блокировка снята на ${WATER_UNLOCK_MIN} минут`,
                    );
                  } else {
                    Alert.alert(
                      "Блокировка снята",
                      `Доступ открыт на ${WATER_UNLOCK_MIN} минут`,
                    );
                  }
                }}
              >
                <Text style={styles.waterText}>Выпить воды</Text>
              </Pressable>
            )}
          </View>
        ) : (
          <View style={styles.primaryActions}>
            <Link href="/checkin" asChild>
              <Pressable style={styles.bigBtn}>
                <Text style={styles.bigBtnIcon}>+</Text>
                <Text style={styles.bigBtnText}>Добавить пиво</Text>
              </Pressable>
            </Link>
            <Link href="/scanner" asChild>
              <Pressable style={styles.scanBtn}>
                <QrIcon color={colors.textPrimary} size={32} />
              </Pressable>
            </Link>
          </View>
        )}
        {waterActive ? (
          <Text style={styles.hint}>Вода действует ещё несколько минут</Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
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
  primaryActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    alignItems: "center",
  },
  bigBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
    gap: 8,
  },
  bigBtnIcon: { color: "#fff", fontSize: 20, fontWeight: "700" },
  bigBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  scanBtn: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.borderWarm,
    alignItems: "center",
    justifyContent: "center",
  },
  blocked: {
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    backgroundColor: colors.dangerSoft,
    alignItems: "center",
    width: "100%",
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
