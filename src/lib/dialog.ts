import { Alert, Platform } from "react-native";

/** Показывает информационное сообщение (одна кнопка OK) */
export function showInfo(title: string, message: string): void {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    window.alert(message ? `${title}\n${message}` : title);
  } else {
    Alert.alert(title, message);
  }
}

/** Показывает диалог подтверждения. Возвращает true, если пользователь нажал "ОК" */
export async function confirmAsync(
  title: string,
  message: string,
): Promise<boolean> {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    return window.confirm(message ? `${title}\n${message}` : title);
  }
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: "Отмена", style: "cancel", onPress: () => resolve(false) },
      { text: "ОК", onPress: () => resolve(true) },
    ]);
  });
}

/** Показывает диалог подтверждения с деструктивным действием */
export async function confirmDestructiveAsync(
  title: string,
  message: string,
  actionLabel: string,
): Promise<boolean> {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    return window.confirm(message ? `${title}\n${message}` : title);
  }
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: "Отмена", style: "cancel", onPress: () => resolve(false) },
      { text: actionLabel, style: "destructive", onPress: () => resolve(true) },
    ]);
  });
}
