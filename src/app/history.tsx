import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import SortChips from "../components/SortChips";
import { calculateBac } from "../lib/bac";
import { getBeerAccent } from "../lib/beerColor";
import { isCheckinBlocked } from "../lib/companion";
import { GLASSES } from "../lib/constants";
import { formatHumanDate } from "../lib/dates";
import { computeStats } from "../lib/stats";
import { colors } from "../lib/theme";
import { useAppStore } from "../store/useAppStore";
import { Checkin, SortMode } from "../types";

export default function HistoryScreen() {
  const router = useRouter();
  const checkins = useAppStore((s) => s.checkins);
  const profile = useAppStore((s) => s.profile);
  const lastWaterAt = useAppStore((s) => s.lastWaterAt);
  const [sort, setSort] = useState<SortMode>("fresh");

  const stats = useMemo(() => computeStats(checkins), [checkins]);

  const sorted = useMemo(() => {
    const arr = [...checkins];
    switch (sort) {
      case "fresh":
        return arr.sort((a, b) => b.timestamp - a.timestamp);
      case "old":
        return arr.sort((a, b) => a.timestamp - b.timestamp);
      case "rating":
        return arr.sort((a, b) => b.rating - a.rating);
      case "abv":
        return arr.sort((a, b) => b.abv - a.abv);
    }
  }, [checkins, sort]);

  if (!profile) return null;

  const bac = calculateBac(checkins, profile);
  const blocked = isCheckinBlocked(bac, lastWaterAt);

  const repeatCheckin = (c: Checkin) => {
    if (blocked) {
      router.push("/");
      return;
    }
    router.push({
      pathname: "/checkin",
      params: {
        scannedName: c.beerName,
        scannedAbv: String(c.abv),
        scannedType: c.beerType,
      },
    });
  };

  const glassLabel = (id: string) =>
    GLASSES.find((g) => g.id === id)?.emoji ?? "🍺";

  const renderItem = ({ item }: { item: Checkin }) => {
    const accent = getBeerAccent(item.beerType);
    return (
      <View style={styles.card}>
        <View style={[styles.accent, { backgroundColor: accent }]} />
        <View style={styles.cardBody}>
          <View style={styles.cardHeader}>
            <Text style={styles.glassIcon}>{glassLabel(item.glassType)}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.beerName}>{item.beerName}</Text>
              <Text style={styles.details}>
                {item.volumeMl} мл · {item.abv}% · {item.beerType}
              </Text>
            </View>
            <Text style={styles.rating}>{"★".repeat(item.rating)}</Text>
          </View>
          {item.tasteTags.length > 0 && (
            <View style={styles.tags}>
              {item.tasteTags.map((t) => (
                <View key={t} style={styles.tag}>
                  <Text style={styles.tagText}>{t}</Text>
                </View>
              ))}
            </View>
          )}
          <View style={styles.cardFooter}>
            <Text style={styles.date}>{formatHumanDate(item.timestamp)}</Text>
            <Pressable onPress={() => repeatCheckin(item)}>
              <Text style={styles.repeat}>↻ Повторить</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>История дегустаций</Text>
        <Text style={styles.subtitle}>
          {stats.totalCount} чекинов · {(stats.totalVolumeMl / 1000).toFixed(1)}{" "}
          л · ср. {stats.avgRating.toFixed(1)} ★
        </Text>
        <Text style={styles.favorite}>
          Любимый стиль: {stats.favoriteStyle} · Бокал: {stats.favoriteGlass}
        </Text>
      </View>

      <SortChips value={sort} onChange={setSort} />

      {checkins.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🍺</Text>
          <Text style={styles.emptyText}>
            Пока пусто. Самое время открыть что-то новое!
          </Text>
        </View>
      ) : (
        <FlatList
          data={sorted}
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
  container: { flex: 1, backgroundColor: colors.bg, padding: 24 },
  header: { marginBottom: 12, marginTop: 12 },
  title: { fontSize: 26, fontWeight: "bold", color: colors.textPrimary },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  favorite: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  list: { paddingBottom: 24 },
  card: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.borderWarm,
  },
  accent: { width: 6 },
  cardBody: { flex: 1, padding: 14 },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  glassIcon: { fontSize: 22, marginRight: 8 },
  beerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.textPrimary,
    flex: 1,
  },
  rating: { fontSize: 14, color: colors.primary },
  details: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  tag: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  tagText: { fontSize: 11, color: colors.textPrimary },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  date: { fontSize: 12, color: colors.textLight },
  repeat: { fontSize: 13, color: colors.infoText, fontWeight: "600" },
  empty: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  backBtn: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.inactive,
    alignItems: "center",
  },
  backBtnText: { color: colors.textMuted, fontSize: 16, fontWeight: "600" },
});
