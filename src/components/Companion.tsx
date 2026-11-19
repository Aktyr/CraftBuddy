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
        return "Отличный выбор! Cheers! 🍻";
      case "levelUp":
        return "Новый уровень! 🎉";
      case "drunk":
        return "Кажется, пора остановиться... 🥴";
      case "sleep":
        return "Компаньон спит. Выпейте воды. 💤";
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
