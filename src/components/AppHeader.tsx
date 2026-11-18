import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../lib/theme";

const HEADER_HEIGHT = 56;

interface Props {
  title: string;
  isHome?: boolean;
  onMenuPress?: () => void;
}

export default function AppHeader({
  title,
  isHome = false,
  onMenuPress,
}: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: insets.top,
          height: HEADER_HEIGHT + insets.top,
        },
      ]}
    >
      {/* Кнопка слева с видимым хитбоксом */}
      <View style={styles.left}>
        <Pressable
          onPress={isHome ? onMenuPress : () => router.back()}
          style={({ pressed }) => [
            styles.iconBtn,
            pressed && styles.iconBtnPressed,
          ]}
          hitSlop={8}
        >
          <Ionicons
            name={isHome ? "menu" : "chevron-back"}
            size={28}
            color={colors.textPrimary}
          />
        </Pressable>
      </View>

      {/* Заголовок по центру */}
      <View style={styles.center}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>

      {/* Пустой блок справа для симметрии */}
      <View style={styles.right} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  left: {
    width: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  right: {
    width: 56,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  iconBtnPressed: {
    backgroundColor: colors.primarySoft,
  },
});
