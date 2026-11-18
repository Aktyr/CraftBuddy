import {
  BarcodeScanningResult,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import * as Haptics from "expo-haptics";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { findBeerByBarcode } from "../lib/beers";
import { colors } from "../lib/theme";
import { useAppStore } from "../store/useAppStore";
import { Checkin } from "../types";

export default function ScannerScreen() {
  const checkins = useAppStore((s) => s.checkins);
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  // Сбрасываем scanned при каждом входе на экран
  useFocusEffect(
    useCallback(() => {
      setScanned(false);
    }, []),
  );

  if (!permission) return <View style={styles.container} />;

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

  const handleBarcodeScanned = async (result: BarcodeScanningResult) => {
    if (scanned) return;
    setScanned(true);
    const beer = findBeerByBarcode(result.data);
    const existingCheckin = checkins.find(
      (c: Checkin) => c.scannedBarcode === result.data,
    );
    const params: any = {
      scannedBarcode: result.data,
    };
    if (existingCheckin) {
      params.scannedName = existingCheckin.beerName;
      params.scannedAbv = String(existingCheckin.abv);
      params.scannedType = existingCheckin.beerType;
      params.scannedVolume = String(existingCheckin.volumeMl);
      params.scannedGlass = existingCheckin.glassType;
      params.scannedTasteTags = JSON.stringify(existingCheckin.tasteTags);
    } else if (beer) {
      params.scannedName = beer.name;
      params.scannedAbv = String(beer.abv);
      params.scannedType = beer.type;
    }
    if (beer || existingCheckin) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    // Уникальный ключ заставляет React пересоздать форму checkin
    params._scanKey = Date.now().toString();
    router.replace({ pathname: "/checkin", params });
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ["ean13", "ean8", "code128", "qr", "datamatrix"],
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
    backgroundColor: colors.primary,
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
    backgroundColor: colors.overlay,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    overflow: "hidden",
  },
  cancelBtn: { paddingHorizontal: 24, paddingVertical: 10 },
  cancelBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
