import * as Haptics from "expo-haptics";
import { Link } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import BacChart from "../components/BacChart";
import BeerGlass from "../components/BeerGlass";
import Companion from "../components/Companion";
import { calculateBac } from "../lib/bac";
import {
  getCompanionState,
  isCheckinBlocked,
  isWaterActive,
} from "../lib/companion";
import { BAC_LIMIT, LEVEL_XP, WATER_UNLOCK_MIN } from "../lib/constants";
import { useAppStore } from "../store/useAppStore";

const LEVEL_UP_DISPLAY_MS = 2000;

export default function Home() {
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
  const blocked = isCheckinBlocked(bac) && !waterActive;
  const fillLevel = Math.min(1, bac / BAC_LIMIT);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <BeerGlass fillLevel={fillLevel} size={130} />
      <Companion state={state} />

      <Text style={styles.bac}>BAC: {bac.toFixed(3)}</Text>
      <Text style={styles.muted}>
        Чекинов: {checkins.length} · XP: {xp} · Ур.{" "}
        {Math.floor(xp / LEVEL_XP) + 1}
      </Text>

      <BacChart checkins={checkins} profile={profile} now={now} />

      {/* Ссылка на историю */}
      <Link href="/history" asChild>
        <Pressable style={styles.historyBtn}>
          <Text style={styles.historyBtnText}>
            📋 История ({checkins.length})
          </Text>
        </Pressable>
      </Link>

      {blocked ? (
        <View style={styles.blocked}>
          <Text style={styles.blockedTitle}>Лимит превышен</Text>
          <Text style={styles.blockedText}>
            Добавление пива заблокировано. Выпейте стакан воды.
          </Text>
          <Pressable
            style={styles.waterBtn}
            onPress={() => {
              drinkWater();
              Alert.alert(
                "💧",
                `Блокировка снята на ${WATER_UNLOCK_MIN} минут`,
              );
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
    backgroundColor: "#FFFBEB",
  },
  bac: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#78350F",
    marginBottom: 4,
    marginTop: 8,
  },
  muted: { fontSize: 13, color: "#92400E", marginBottom: 8 },
  button: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F59E0B",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  blocked: {
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    maxWidth: 320,
  },
  blockedTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#991B1B",
    marginBottom: 6,
  },
  blockedText: {
    fontSize: 13,
    color: "#991B1B",
    textAlign: "center",
    marginBottom: 14,
  },
  waterBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#3B82F6",
  },
  waterText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  hint: { marginTop: 12, fontSize: 12, color: "#2563EB" },
  historyBtn: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#FEF3C7",
  },
  historyBtnText: {
    color: "#92400E",
    fontSize: 14,
    fontWeight: "600",
  },
});
