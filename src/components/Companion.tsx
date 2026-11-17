import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { CompanionState } from "../types";

const CONFIG: Record<
  CompanionState,
  { emoji: string; label: string; color: string }
> = {
  idle: { emoji: "🐱", label: "Ждёт чекина", color: "#9CA3AF" },
  drunk: { emoji: "🐱", label: "Ты как?", color: "#FBBF24" },
  happy: { emoji: "😸", label: "Cheers!", color: "#34D399" },
  levelUp: { emoji: "🎉", label: "Новый сорт!", color: "#A78BFA" },
  sleep: { emoji: "😾", label: "Хватит. Вода!", color: "#EF4444" },
};

export default function Companion({ state }: { state: CompanionState }) {
  const scale = useRef(new Animated.Value(1)).current;
  const cfg = CONFIG[state];

  useEffect(() => {
    // мягкий «pulse» при каждой смене состояния
    scale.setValue(0.85);
    Animated.spring(scale, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  }, [state]);

  return (
    <View style={styles.wrap}>
      <Animated.Text style={[styles.emoji, { transform: [{ scale }] }]}>
        {cfg.emoji}
      </Animated.Text>
      <Text style={[styles.label, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", marginBottom: 16 },
  emoji: { fontSize: 80 },
  label: { fontSize: 14, fontWeight: "700", marginTop: 4 },
});
