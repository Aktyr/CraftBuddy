import {
  BarcodeScanningResult,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import * as Haptics from "expo-haptics";
import { useFocusEffect, useRouter } from "expo-router";
import { ComponentProps, useCallback, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { findBeerByBarcode } from "../lib/beers";
import { colors } from "../lib/theme";
import { useAppStore } from "../store/useAppStore";
import { Checkin } from "../types";

// Конфигурация вынесена из рендера: новый объект пропа пересоздаёт сессию захвата
const BARCODE_SETTINGS: ComponentProps<
  typeof CameraView
>["barcodeScannerSettings"] = {
  barcodeTypes: ["ean13", "ean8", "code128", "qr", "datamatrix"],
};

// Монтаж камеры в одном кадре с переходом на экран роняет сессию захвата на iOS
const CAMERA_MOUNT_DELAY_MS = 250;

/** Экран сканирования штрихкода с переходом на предзаполненный чекин. */
export default function ScannerScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraMounted, setCameraMounted] = useState(false);
  const scannedRef = useRef(false);
  // Флаг отмены async-операций при уходе с экрана
  const cancelledRef = useRef(false);
  const cameraAllowed = permission?.granted ?? false;

  useFocusEffect(
    useCallback(() => {
      scannedRef.current = false;
      cancelledRef.current = false;
      const timer = cameraAllowed
        ? setTimeout(() => setCameraMounted(true), CAMERA_MOUNT_DELAY_MS)
        : null;
      return () => {
        if (timer !== null) clearTimeout(timer);
        cancelledRef.current = true;
        // Экран остаётся смонтированным под верхним экраном стека, превью снимаем сами
        setCameraMounted(false);
      };
    }, [cameraAllowed]),
  );

  const handleBarcodeScanned = useCallback(
    async (result: BarcodeScanningResult) => {
      if (scannedRef.current || cancelledRef.current) return;
      scannedRef.current = true;

      // Историю читаем в момент сканирования: обработчик обязан быть стабильным,
      // иначе смена пропа переконфигурирует сканер
      const checkins = useAppStore.getState().checkins;
      const beer = findBeerByBarcode(result.data);

      // Берём последний чекин с этим штрихкодом, а не первый
      let existingCheckin: Checkin | undefined;
      for (let i = checkins.length - 1; i >= 0; i--) {
        if (checkins[i].scannedBarcode === result.data) {
          existingCheckin = checkins[i];
          break;
        }
      }

      const params: Record<string, string | undefined> = {
        scannedBarcode: result.data,
      };
      if (existingCheckin) {
        params.scannedName = existingCheckin.beerName;
        params.scannedAbv = String(existingCheckin.abv);
        params.scannedType = existingCheckin.beerType;
        params.scannedVolume = String(existingCheckin.volumeMl);
        params.scannedTasteTags = JSON.stringify(existingCheckin.tasteTags);
      } else if (beer) {
        params.scannedName = beer.name;
        params.scannedAbv = String(beer.abv);
        params.scannedType = beer.type;
      }

      if (beer || existingCheckin) {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        );
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

      // Если пользователь ушёл со сканера во время await, не навигируем
      if (cancelledRef.current) return;
      params._scanKey = Date.now().toString();
      router.replace({ pathname: "/checkin", params });
    },
    [router],
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

  return (
    <View style={styles.container}>
      {cameraMounted && (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={BARCODE_SETTINGS}
          onBarcodeScanned={handleBarcodeScanned}
        />
      )}
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
