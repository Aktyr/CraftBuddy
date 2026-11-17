import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { calculateBac } from "../lib/bac";
import { useAppStore } from "../store/useAppStore";

export default function Home() {
  const { profile, checkins } = useAppStore();
  if (!profile) return null;

  const bac = calculateBac(checkins, profile);

  return (
    <View style={styles.container}>
      <Text style={styles.companion}>🐱 Idle</Text>
      <Text style={styles.bac}>BAC: {bac.toFixed(3)}</Text>
      <Text style={styles.muted}>Чекинов: {checkins.length}</Text>

      <Link href="/checkin" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>+ Добавить пиво</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#FFFBEB",
  },
  companion: { fontSize: 64, marginBottom: 12 },
  bac: { fontSize: 36, fontWeight: "bold", color: "#78350F", marginBottom: 4 },
  muted: { fontSize: 14, color: "#92400E", marginBottom: 32 },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F59E0B",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
