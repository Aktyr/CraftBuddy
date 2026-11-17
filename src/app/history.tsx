import { useRouter } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useAppStore } from "../store/useAppStore";
import { Checkin } from "../types";

function formatDate(timestamp: number) {
  const d = new Date(timestamp);
  return `${d.toLocaleDateString("ru-RU")} в ${d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}`;
}

export default function HistoryScreen() {
  const router = useRouter();
  const checkins = useAppStore((s) => s.checkins);
  const profile = useAppStore((s) => s.profile);

  // Сортируем от новых к старым
  const sortedCheckins = [...checkins].sort(
    (a, b) => b.timestamp - a.timestamp,
  );

  if (!profile) return null;

  const renderItem = ({ item }: { item: Checkin }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.beerName}>{item.beerName}</Text>
        <Text style={styles.rating}>{"★".repeat(item.rating)}</Text>
      </View>
      <Text style={styles.details}>
        {item.volumeMl} мл · {item.abv}% · {item.glassType}
      </Text>
      <Text style={styles.date}>{formatDate(item.timestamp)}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>История дегустаций</Text>
        <Text style={styles.subtitle}>Всего чекинов: {checkins.length}</Text>
      </View>

      {checkins.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🍺</Text>
          <Text style={styles.emptyText}>
            Пока пусто. Самое время открыть что-то новое!
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedCheckins}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backBtnText}>Назад</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFBEB", padding: 24 },
  header: { marginBottom: 20, marginTop: 20 },
  title: { fontSize: 26, fontWeight: "bold", color: "#78350F" },
  subtitle: { fontSize: 14, color: "#92400E", marginTop: 4 },
  list: { paddingBottom: 24 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  beerName: { fontSize: 18, fontWeight: "bold", color: "#78350F", flex: 1 },
  rating: { fontSize: 16, color: "#F59E0B" },
  details: { fontSize: 14, color: "#6B7280", marginBottom: 8 },
  date: { fontSize: 12, color: "#9CA3AF" },
  empty: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyText: {
    fontSize: 16,
    color: "#92400E",
    textAlign: "center",
    paddingHorizontal: 32,
  },
  backBtn: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
  },
  backBtnText: { color: "#4B5563", fontSize: 16, fontWeight: "600" },
});
