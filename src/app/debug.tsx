import * as Haptics from "expo-haptics";
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
import { colors } from "../lib/theme";
import { useAppStore } from "../store/useAppStore";

export default function DebugScreen() {
  const insets = useSafeAreaInsets();
  const { lastBacReset, resetBac, checkins } = useAppStore();

  const handleReset = () => {
    const doReset = () => {
      resetBac();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (Platform.OS === "web") {
        window.alert("BAC сброшен до 0");
      } else {
        Alert.alert("Готово", "BAC = 0");
      }
    };
    if (Platform.OS === "web") {
      if (window.confirm("Сбросить BAC до 0?")) doReset();
    } else {
      Alert.alert("Сбросить BAC?", "Текущий уровень опьянения будет обнулён.", [
        { text: "Отмена", style: "cancel" },
        { text: "Сбросить", onPress: doReset },
      ]);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <AppHeader title="Debug" />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 24 },
        ]}
      >
        <Text style={styles.info}>Чекинов в истории: {checkins.length}</Text>
        <Text style={styles.info}>
          Статус: {lastBacReset ? "BAC сброшен" : "Нормальный расчёт"}
        </Text>

        <Pressable style={styles.button} onPress={handleReset}>
          <Text style={styles.buttonText}>🧪 Сбросить BAC до 0</Text>
        </Pressable>

        <Text style={styles.hint}>
          История чекинов сохраняется. При перезапуске приложения расчёт BAC
          восстановится автоматически.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24 },
  info: { fontSize: 14, color: colors.textSecondary, marginBottom: 8 },
  button: {
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.info,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  hint: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 24,
    textAlign: "center",
  },
});
