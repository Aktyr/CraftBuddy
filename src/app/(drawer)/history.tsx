import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import AppHeader from "../../components/AppHeader";
import FilterModal from "../../components/FilterModal";
import { useActiveCheckins } from "../../hooks/useActiveCheckins";
import { calculateBac } from "../../lib/bac";
import { getBeerAccent } from "../../lib/beerColor";
import { getCheckinBlockReason } from "../../lib/companion";
import { TYPE_LABELS } from "../../lib/constants";
import { formatHumanDate } from "../../lib/dates";
import { computeStats } from "../../lib/stats";
import { colors } from "../../lib/theme";
import { useAppStore } from "../../store/useAppStore";
import { BeerType, Checkin } from "../../types";

interface RepeatRouteParams {
  scannedName: string;
  scannedType: BeerType;
  scannedBarcode?: string;
  scannedAbv: string;
  scannedVolume: string;
  scannedGlass: string;
  scannedTasteTags: string;
  returnTo?: string;
  _scanKey: string;
}

interface GroupedCheckin {
  id: string;
  beerName: string;
  beerType: BeerType;
  totalCount: number;
  totalVolumeMl: number;
  avgRating: number;
  avgAbv: number;
  lastTimestamp: number;
  scannedBarcode?: string;
  lastCheckin: Checkin;
}

export default function HistoryScreen() {
  const router = useRouter();
  const checkins = useAppStore((s) => s.checkins);
  const profile = useAppStore((s) => s.profile);
  const lastWaterAt = useAppStore((s) => s.lastWaterAt);
  const activeCheckins = useActiveCheckins();
  const historySort = useAppStore((s) => s.historySort);
  const historyGrouped = useAppStore((s) => s.historyGrouped);
  const setHistorySort = useAppStore((s) => s.setHistorySort);
  const setHistoryGrouped = useAppStore((s) => s.setHistoryGrouped);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<React.ElementRef<typeof TextInput>>(null);
  const [now, setNow] = useState(Date.now());

  useFocusEffect(
    useCallback(() => {
      const t = setInterval(() => setNow(Date.now()), 30_000);
      return () => clearInterval(t);
    }, []),
  );

  const stats = useMemo(() => computeStats(checkins), [checkins]);

  const sorted = useMemo(() => {
    const arr = [...checkins];
    switch (historySort) {
      case "fresh":
        arr.sort((a, b) => b.timestamp - a.timestamp);
        break;
      case "old":
        arr.sort((a, b) => a.timestamp - b.timestamp);
        break;
      case "rating":
        arr.sort((a, b) => b.rating - a.rating);
        break;
      case "abv":
        arr.sort((a, b) => b.abv - a.abv);
        break;
    }
    if (!historyGrouped) return arr;
    const groupedMap = new Map<string, GroupedCheckin>();
    for (const c of arr) {
      const key = c.beerName.toLowerCase();
      const existing = groupedMap.get(key);
      if (existing) {
        existing.totalCount++;
        existing.totalVolumeMl += c.volumeMl;
        existing.avgRating =
          (existing.avgRating * (existing.totalCount - 1) + c.rating) /
          existing.totalCount;
        existing.avgAbv =
          (existing.avgAbv * (existing.totalCount - 1) + c.abv) /
          existing.totalCount;
        if (c.timestamp > existing.lastTimestamp) {
          existing.lastTimestamp = c.timestamp;
          existing.beerType = c.beerType;
          existing.lastCheckin = c;
          if (c.scannedBarcode) existing.scannedBarcode = c.scannedBarcode;
        }
      } else {
        groupedMap.set(key, {
          id: key,
          beerName: c.beerName,
          beerType: c.beerType,
          totalCount: 1,
          totalVolumeMl: c.volumeMl,
          avgRating: c.rating,
          avgAbv: c.abv,
          lastTimestamp: c.timestamp,
          scannedBarcode: c.scannedBarcode,
          lastCheckin: c,
        });
      }
    }
    const groups = Array.from(groupedMap.values());
    switch (historySort) {
      case "fresh":
        groups.sort((a, b) => b.lastTimestamp - a.lastTimestamp);
        break;
      case "old":
        groups.sort((a, b) => a.lastTimestamp - b.lastTimestamp);
        break;
      case "rating":
        groups.sort((a, b) => b.avgRating - a.avgRating);
        break;
      case "abv":
        groups.sort((a, b) => b.avgAbv - a.avgAbv);
        break;
    }
    return groups;
  }, [checkins, historySort, historyGrouped]);
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return sorted;
    const q = searchQuery.toLowerCase();
    return sorted.filter((item) => item.beerName.toLowerCase().includes(q));
  }, [sorted, searchQuery]);

  const bac = useMemo(
    () => (profile ? calculateBac(activeCheckins, profile, now) : 0),
    [activeCheckins, profile, now],
  );

  const blocked = useMemo(
    () =>
      profile
        ? getCheckinBlockReason(
            bac,
            lastWaterAt,
            now,
            activeCheckins,
            profile,
          ) !== null
        : false,
    [bac, lastWaterAt, now, activeCheckins, profile],
  );

  const repeatCheckin = useCallback(
    (c: Checkin | GroupedCheckin) => {
      if (blocked) return;
      const isGrouped = "totalCount" in c;
      const source = isGrouped
        ? (c as GroupedCheckin).lastCheckin
        : (c as Checkin);
      const params: Record<string, string | undefined> = {
        scannedName: source.beerName,
        scannedType: source.beerType,
        scannedBarcode: source.scannedBarcode,
        scannedAbv: String(source.abv),
        scannedVolume: String(source.volumeMl),
        scannedGlass: source.glassType,
        scannedTasteTags: JSON.stringify(source.tasteTags),
        scannedRating: String(source.rating),
        returnTo: "home",
        _scanKey: `repeat-${Date.now()}`,
      };
      router.push({ pathname: "/checkin", params });
    },
    [blocked, router],
  );

  const editCheckin = useCallback(
    (c: Checkin) => {
      router.push({
        pathname: "/checkin",
        params: { editId: c.id },
      });
    },
    [router],
  );
  const renderItem = useCallback(
    ({ item }: { item: Checkin | GroupedCheckin }) => {
      const isGrouped = "totalCount" in item;
      const accent = getBeerAccent(
        isGrouped ? item.beerType : (item as Checkin).beerType,
      );
      const isVerified = isGrouped
        ? !!(item as GroupedCheckin).scannedBarcode
        : !!(item as Checkin).scannedBarcode;
      const barcode = isGrouped
        ? (item as GroupedCheckin).scannedBarcode
        : (item as Checkin).scannedBarcode;
      const rating = isGrouped ? 0 : (item as Checkin).rating;
      return (
        <View style={styles.card}>
          <View style={[styles.accent, { backgroundColor: accent }]} />
          <View style={styles.cardBody}>
            <View style={styles.cardHeader}>
              {isVerified && <Text style={styles.verifiedIcon}>✓</Text>}
              <View style={{ flex: 1 }}>
                <Text style={styles.beerName}>{item.beerName}</Text>
                <Text style={styles.details}>
                  {isGrouped
                    ? `${(item as GroupedCheckin).totalCount}× · ${(item as GroupedCheckin).totalVolumeMl} мл · ср. ${(item as GroupedCheckin).avgRating.toFixed(1)} ★ · ${(item as GroupedCheckin).avgAbv.toFixed(1)}%`
                    : `${(item as Checkin).volumeMl} мл · ${(item as Checkin).abv}% · ${TYPE_LABELS[(item as Checkin).beerType]}`}
                </Text>
                {barcode && (
                  <Text style={styles.barcode}>Штрихкод: {barcode}</Text>
                )}
              </View>
              {!isGrouped && (
                <View accessibilityLabel={`Оценка ${rating} из 5`}>
                  <Text style={styles.rating}>{"★".repeat(rating)}</Text>
                </View>
              )}
            </View>
            {!isGrouped && (item as Checkin).tasteTags.length > 0 && (
              <View style={styles.tags}>
                {(item as Checkin).tasteTags.map((t) => (
                  <View key={t} style={styles.tag}>
                    <Text style={styles.tagText}>{t}</Text>
                  </View>
                ))}
              </View>
            )}
            <View style={styles.cardFooter}>
              <Text style={styles.date}>
                {isGrouped
                  ? formatHumanDate((item as GroupedCheckin).lastTimestamp)
                  : formatHumanDate((item as Checkin).timestamp)}
              </Text>
              <View style={styles.cardActions}>
                {!isGrouped && !blocked && (
                  <Pressable
                    onPress={() => editCheckin(item as Checkin)}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={`Редактировать ${item.beerName}`}
                  >
                    <Text style={styles.edit}>✎</Text>
                  </Pressable>
                )}
                {!blocked && (
                  <Pressable
                    onPress={() => repeatCheckin(item)}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={`Повторить ${item.beerName}`}
                  >
                    <Text style={styles.repeat}>↻ Повторить</Text>
                  </Pressable>
                )}
              </View>
            </View>
          </View>
        </View>
      );
    },
    [blocked, repeatCheckin],
  );

  if (!profile) return null;

  return (
    <View style={styles.container}>
      <AppHeader
        title="История"
        rightActions={[
          {
            key: "search",
            icon: searchOpen ? "close" : "search",
            onPress: () => {
              if (searchOpen) {
                setSearchOpen(false);
                setSearchQuery("");
              } else {
                setSearchOpen(true);
                setTimeout(() => searchInputRef.current?.focus(), 100);
              }
            },
            label: searchOpen ? "Закрыть поиск" : "Поиск",
          },
          {
            key: "filter",
            icon: "funnel",
            onPress: () => setFilterOpen(true),
            label: "Фильтры",
          },
        ]}
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.subtitle}>
            {stats.totalCount} чекинов ·
            {(stats.totalVolumeMl / 1000).toFixed(1)} л · ср.
            {stats.avgRating.toFixed(1)} ★
          </Text>
          <Text style={styles.favorite}>
            Любимый стиль: {stats.favoriteStyle}
          </Text>
        </View>

        {searchOpen && (
          <View style={styles.searchBar}>
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Поиск по названию..."
              placeholderTextColor={colors.textLight}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
          </View>
        )}

        {checkins.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🍺</Text>
            <Text style={styles.emptyText}>
              Пока пусто. Самое время открыть что-то новое!
            </Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyText}>
              Ничего не найдено по запросу «{searchQuery}»
            </Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <FilterModal
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        sort={historySort}
        onSortChange={setHistorySort}
        grouped={historyGrouped}
        onGroupedChange={setHistoryGrouped}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, padding: 24 },
  header: { marginBottom: 12 },
  subtitle: { fontSize: 14, color: colors.textSecondary },
  favorite: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  searchBar: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 12,
  },
  searchInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.textPrimary,
  },
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
  verifiedIcon: {
    fontSize: 18,
    color: colors.success,
    fontWeight: "bold",
    marginRight: 6,
  },
  beerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.textPrimary,
    flex: 1,
  },
  rating: { fontSize: 14, color: colors.primary },
  details: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  barcode: { fontSize: 11, color: colors.textLight, marginTop: 2 },
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
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  date: { fontSize: 12, color: colors.textLight },
  edit: { fontSize: 18, color: colors.infoText, fontWeight: "600" },
  repeat: { fontSize: 13, color: colors.infoText, fontWeight: "600" },
  empty: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: 32,
  },
});
