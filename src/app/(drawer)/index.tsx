import { DrawerActions } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { Link, useFocusEffect, useNavigation } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppHeader from "../../components/AppHeader";
import BacChart from "../../components/BacChart";
import BeerGlass from "../../components/BeerGlass";
import Companion from "../../components/Companion";
import QrIcon from "../../components/icons/QrIcon";
import { useActiveCheckins } from "../../hooks/useActiveCheckins";
import { useLiquidLayers } from "../../hooks/useLiquidLayers";
import { calculateBac, calculatePeakBac } from "../../lib/bac";
import {
  getCheckinBlockReason,
  getCompanionState,
  isWaterActive,
} from "../../lib/companion";
import {
  BAC_HARD_LIMIT,
  LEVEL_XP,
  WATER_UNLOCK_MIN,
} from "../../lib/constants";
import { showInfo } from "../../lib/dialog";
import { computeStats } from "../../lib/stats";
import { colors } from "../../lib/theme";
import { useAppStore } from "../../store/useAppStore";

const LEVEL_UP_DISPLAY_MS = 2000;

export default function Home() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { profile, xp, lastWaterAt, drinkWater, resetBac } = useAppStore();
  const activeCheckins = useActiveCheckins();
  const [now, setNow] = useState(Date.now());
  const liquidLayers = useLiquidLayers(now);
  const [justLeveledUp, setJustLeveledUp] = useState(false);
  const prevLevelRef = useRef(Math.floor(xp / LEVEL_XP));

  useFocusEffect(
    useCallback(() => {
      const t = setInterval(() => setNow(Date.now()), 5_000);
      return () => clearInterval(t);
    }, []),
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

  const stats = useMemo(() => computeStats(activeCheckins), [activeCheckins]);

  if (!profile) return null;

  const bac = calculateBac(activeCheckins, profile, now);
  const peakBac = calculatePeakBac(activeCheckins, profile, now);
  const state = getCompanionState(bac, justLeveledUp, peakBac);
  const waterActive = isWaterActive(lastWaterAt, now);
  const blockReason = getCheckinBlockReason(
    bac,
    lastWaterAt,
    now,
    activeCheckins,
    profile,
  );

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
        <BeerGlass
          layers={liquidLayers}
          size={130}
          now={now}
          accessibilityLabel={`Бокал с ${liquidLayers.length} слоями пива`}
        />
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
            {__DEV__ && (
              <Pressable
                style={styles.resetBtn}
                onPress={() => {
                  resetBac();
                  Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Success,
                  );
                  showInfo("BAC сброшен", "Расчёт начнётся заново с нуля");
                }}
              >
                <Text style={styles.resetBtnText}>Сбросить BAC</Text>
              </Pressable>
            )}
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
                ? "Прогнозируется опасный уровень опьянения. Выпейте воды или подождите."
                : "Добавление пива заблокировано. Выпейте стакан воды, чтобы получить временный доступ."}
            </Text>
            {!waterActive && (
              <Pressable
                style={styles.waterBtn}
                onPress={() => {
                  drinkWater();
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  showInfo(
                    "Блокировка снята",
                    `Доступ открыт на ${WATER_UNLOCK_MIN} минут`,
                  );
                }}
              >
                <Text style={styles.waterText}>Выпить воды</Text>
              </Pressable>
            )}
            {__DEV__ && (
              <Pressable
                style={styles.resetBtn}
                onPress={() => {
                  resetBac();
                  Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Success,
                  );
                  showInfo("BAC сброшен", "Расчёт начнётся заново с нуля");
                }}
              >
                <Text style={styles.resetBtnText}>Сбросить BAC</Text>
              </Pressable>
            )}
          </View>
        ) : (
          <View style={styles.primaryActions}>
            <Link href="/checkin" asChild>
              <Pressable
                style={styles.bigBtn}
                accessibilityRole="button"
                accessibilityLabel="Добавить пиво"
              >
                <Text style={styles.bigBtnIcon}>+</Text>
                <Text style={styles.bigBtnText}>Добавить пиво</Text>
              </Pressable>
            </Link>
            <Link href="/scanner" asChild>
              <Pressable
                style={styles.scanBtn}
                accessibilityRole="button"
                accessibilityLabel="Сканировать штрихкод"
              >
                <QrIcon color={colors.textPrimary} size={42} />
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
  resetBtn: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resetBtnText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "600",
  },
});
