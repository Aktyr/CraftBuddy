import { StyleSheet, Text, View } from "react-native";
import { colors } from "../lib/theme";
import { CompanionState } from "../types";

interface Props {
  state: CompanionState;
}

export default function Companion({ state }: Props) {
  // ВСЕГДА возвращайте <Text>, никогда не возвращайте просто "строку"
  const getMessage = () => {
    switch (state) {
      case "idle":
        return "Ждёт чекина 🍺";
      case "happy":
        return "Отличный выбор! 🍻";
      case "cheerful":
        return "Cheers! 🎉";
      case "warning":
        return "Пора замедлиться 💧";
      case "critical":
        return "Критический уровень! ⚠️";
      case "forecast":
        return "Вы пьёте слишком быстро 💧";
      case "levelUp":
        return "Новый уровень! 🎊";
      default:
        return "Ждёт чекина 🍺";
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{getMessage()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 16, alignItems: "center" },
  text: { fontSize: 18, fontWeight: "600", color: colors.textPrimary },
});
