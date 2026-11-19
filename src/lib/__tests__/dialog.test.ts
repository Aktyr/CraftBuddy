import { Alert, Platform } from "react-native";
import { confirmAsync, confirmDestructiveAsync, showInfo } from "../dialog";

// Мокаем React Native, чтобы изолировать тесты от нативных модулей
jest.mock("react-native", () => ({
  Alert: { alert: jest.fn() },
  Platform: { OS: "ios" },
}));

describe("dialog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Настраиваем глобальные моки для веб-платформы через globalThis
    (globalThis as any).alert = jest.fn();
    (globalThis as any).confirm = jest.fn(() => true);
  });

  describe("showInfo", () => {
    it("на нативной платформе вызывает Alert.alert", () => {
      (Platform as any).OS = "ios";
      showInfo("Тест", "Сообщение");
      expect(Alert.alert as jest.Mock).toHaveBeenCalledWith(
        "Тест",
        "Сообщение",
      );
      expect((globalThis as any).alert).not.toHaveBeenCalled();
    });

    it("на веб-платформе вызывает global.alert", () => {
      (Platform as any).OS = "web";
      showInfo("Тест", "Сообщение");
      expect((globalThis as any).alert).toHaveBeenCalledWith(
        "Тест\n\nСообщение",
      );
      expect(Alert.alert as jest.Mock).not.toHaveBeenCalled();
    });
  });

  describe("confirmAsync", () => {
    it("на нативной платформе возвращает Promise и вызывает Alert.alert", async () => {
      (Platform as any).OS = "ios";
      (Alert.alert as jest.Mock).mockImplementation(
        (title: string, message: string, buttons: any[]) => {
          if (buttons && buttons[1]) buttons[1].onPress?.();
        },
      );

      const result = await confirmAsync("Подтвердить", "Вы уверены?");
      expect(result).toBe(true);
      expect(Alert.alert).toHaveBeenCalled();
    });

    it("на веб-платформе вызывает global.confirm", async () => {
      (Platform as any).OS = "web";
      (globalThis as any).confirm.mockReturnValue(true);

      const result = await confirmAsync("Подтвердить", "Вы уверены?");
      expect(result).toBe(true);
      expect((globalThis as any).confirm).toHaveBeenCalledWith(
        "Подтвердить\n\nВы уверены?",
      );
    });
  });

  describe("confirmDestructiveAsync", () => {
    it("на нативной платформе создаёт диалог с destructive кнопкой", async () => {
      (Platform as any).OS = "ios";
      (Alert.alert as jest.Mock).mockImplementation(
        (title: string, message: string, buttons: any[]) => {
          expect(buttons?.[1]?.style).toBe("destructive");
          if (buttons && buttons[1]) buttons[1].onPress?.();
        },
      );

      const result = await confirmDestructiveAsync(
        "Удалить",
        "Необратимо",
        "Удалить",
      );
      expect(result).toBe(true);
    });
  });
});
