import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../lib/theme";
import { SortMode } from "../types";
import SortChips from "./SortChips";

interface Props {
  visible: boolean;
  onClose: () => void;
  sort: SortMode;
  onSortChange: (mode: SortMode) => void;
  grouped: boolean;
  onGroupedChange: (v: boolean) => void;
}

export default function FilterModal({
  visible,
  onClose,
  sort,
  onSortChange,
  grouped,
  onGroupedChange,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop} accessibilityViewIsModal>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Закрыть фильтры"
        />
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Фильтры</Text>
            <Pressable
              onPress={onClose}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Закрыть"
            >
              <Text style={styles.closeBtn}>✕</Text>
            </Pressable>
          </View>

          <Text style={styles.sectionLabel}>Сортировка</Text>
          <View style={styles.sortChipsWrap}>
            <SortChips value={sort} onChange={onSortChange} />
          </View>
          <View style={styles.groupToggle}>
            <Text style={styles.groupLabel}>Объединять по сортам</Text>
            <Pressable
              style={[styles.toggle, grouped && styles.toggleActive]}
              onPress={() => onGroupedChange(!grouped)}
              accessibilityRole="switch"
              accessibilityState={{ checked: grouped }}
              accessibilityLabel="Объединять по сортам"
            >
              <View
                style={[
                  styles.toggleTrack,
                  grouped && styles.toggleTrackActive,
                ]}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    grouped && styles.toggleThumbActive,
                  ]}
                />
              </View>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "center",
    padding: 24,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.borderWarm,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  closeBtn: {
    fontSize: 20,
    color: colors.textMuted,
    paddingHorizontal: 4,
  },
  sectionLabel: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 8,
    fontWeight: "600",
  },
  groupToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  groupLabel: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  toggle: { padding: 4 },
  toggleActive: {},
  toggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.inactive,
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  toggleTrackActive: { backgroundColor: colors.primary },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  toggleThumbActive: { marginLeft: 20 },
  sortChipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
});
