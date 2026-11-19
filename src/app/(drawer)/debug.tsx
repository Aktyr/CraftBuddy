import * as Haptics from "expo-haptics";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppHeader from "../../components/AppHeader";
import { confirmAsync, showInfo } from "../../lib/dialog";
import { colors } from "../../lib/theme";
import { useAppStore } from "../../store/useAppStore";

export default function DebugScreen() {
  const insets = useSafeAreaInsets();
  const { lastBacReset, resetBac, checkins } = useAppStore();

  // Блокируем доступ к функционалу в продакшен-сборках
  if (!__DEV__) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, padding: 24 }}>
        <AppHeader title="Debug" />
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={[styles.info, { textAlign: "center", marginTop: 32 }]}>
            Экран отладки доступен только в режиме разработки (__DEV__).
          </Text>
        </View>
      </View>
    );
  }

  const handleReset = async () => {
    const confirmed = await confirmAsync(
      "Сбросить BAC?",
      "Текущий уровень опьянения будет обнулён.",
    );
    if (!confirmed) return;
    resetBac();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showInfo("Готово", "BAC = 0");
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
          Сброс BAC сохраняется после перезапуска приложения. История чекинов
          при этом не удаляется.
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
