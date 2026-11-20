import Constants from "expo-constants";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppHeader from "../../components/AppHeader";
import {
  LEVEL_XP,
  XP_DUPLICATE,
  XP_NEW_BEER,
  XP_PER_ACHIEVEMENT,
  XP_SCAN_BONUS,
} from "../../lib/constants";
import { colors } from "../../lib/theme";

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const version = Constants.expoConfig?.version ?? "1.0.0";

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <AppHeader title="О приложении" />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 24 },
        ]}
      >
        <Text style={styles.subtitle}>CraftBuddy v{version}</Text>
        <Text style={styles.body}>
          Умный трекер дегустации пива с виртуальным компаньоном. Приложение
          рассчитывает уровень алкоголя в крови по формуле Видмарка,
          предупреждает о превышении лимита и геймифицирует процесс дегустации
          через систему достижений и опыта.
        </Text>

        <Text style={styles.sectionTitle}>Как это работает</Text>
        <Text style={styles.body}>
          При первом запуске вы указываете вес и пол — эти параметры нужны для
          расчёта BAC. Каждый чекин (добавленный вручную или через сканер
          штрихкода) влияет на график опьянения. Виртуальный компаньон меняет
          поведение в зависимости от текущего уровня алкоголя.
        </Text>

        <Text style={styles.sectionTitle}>Система опыта</Text>
        <Text style={styles.body}>За каждый чекин вы получаете опыт (XP):</Text>
        <Text style={styles.bullet}>• Новый сорт пива: +{XP_NEW_BEER} XP</Text>
        <Text style={styles.bullet}>• Повторный сорт: +{XP_DUPLICATE} XP</Text>
        <Text style={styles.bullet}>
          • Бонус за сканирование штрихкода: +{XP_SCAN_BONUS} XP
        </Text>
        <Text style={styles.bullet}>
          • Разблокировка достижения: +{XP_PER_ACHIEVEMENT} XP
        </Text>
        <Text style={styles.body}>
          Каждые {LEVEL_XP} XP повышают ваш уровень. Компаньон радуется
          повышению уровня и меняет поведение в зависимости от уровня BAC.
        </Text>

        <Text style={styles.sectionTitle}>Безопасность</Text>
        <Text style={styles.body}>
          При превышении BAC 0,8 ‰ добавление пива блокируется. Снять блокировку
          можно «стаканом воды» на 10 минут. При критическом уровне (1,5 ‰)
          блокировка абсолютна — только время.
        </Text>

        <Text style={styles.sectionTitle}>Технологии</Text>
        <Text style={styles.body}>
          React Native, Expo SDK 58, Zustand, Reanimated, react-native-svg,
          expo-camera, expo-haptics, AsyncStorage.
        </Text>

        <Text style={styles.footer}>
          Разработано в рамках курсового проекта{"\n"}
          ММУИТ «Академия ТОП», 2026
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24 },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    marginTop: 20,
    marginBottom: 8,
  },
  body: { fontSize: 14, color: colors.textSecondary, lineHeight: 22 },
  bullet: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    marginLeft: 12,
    marginBottom: 4,
  },
  footer: {
    marginTop: 32,
    fontSize: 12,
    color: colors.textLight,
    textAlign: "center",
  },
});
