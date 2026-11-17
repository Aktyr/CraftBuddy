import {
  BarcodeScanningResult,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { findBeerByBarcode } from "../lib/beers";

export default function ScannerScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  // 1. Пока разрешение не запрошено — пустой экран (избегаем мигания)
  if (!permission) {
    return <View style={styles.container} />;
  }

  // 2. Разрешение не выдано — показываем кнопку запроса
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Нужен доступ к камере</Text>
        <Text style={styles.text}>
          Камера используется только для сканирования штрихкодов пива.
        </Text>
        <Pressable style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Разрешить доступ</Text>
        </Pressable>
        <Pressable style={styles.cancel} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Отмена</Text>
        </Pressable>
      </View>
    );
  }

  // 3. Обработчик сканирования
  const handleBarcodeScanned = async (result: BarcodeScanningResult) => {
    if (scanned) return; // защита от повторных срабатываний
    setScanned(true);

    const beer = findBeerByBarcode(result.data);
    if (beer) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Возвращаемся на чекин с предзаполненными полями
      router.replace({
        pathname: "/checkin",
        params: { scannedName: beer.name, scannedAbv: String(beer.abv) },
      });
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      router.replace({
        pathname: "/checkin",
        params: { scannedBarcode: result.data },
      });
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ["ean13", "ean8", "code128", "qr"],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />
      <View style={styles.overlay}>
        <Text style={styles.hint}>Наведите камеру на штрихкод бутылки</Text>
        <Pressable style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelBtnText}>Отмена</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    padding: 24,
  },
  title: { fontSize: 20, fontWeight: "bold", color: "#fff", marginBottom: 8 },
  text: { fontSize: 14, color: "#D1D5DB", marginBottom: 20 },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F59E0B",
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  cancel: { marginTop: 12, alignItems: "center" },
  cancelText: { color: "#9CA3AF", fontSize: 14 },
  overlay: {
    position: "absolute",
    bottom: 48,
    left: 0,
    right: 0,
    alignItems: "center",
    gap: 16,
  },
  hint: {
    color: "#fff",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    overflow: "hidden",
  },
  cancelBtn: { paddingHorizontal: 24, paddingVertical: 10 },
  cancelBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
