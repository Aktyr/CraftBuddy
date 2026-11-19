export interface MenuItem {
  name: string;
  label: string;
  /** Скрывать пункт в продакшен-сборках */
  devOnly?: boolean;
}

export const MENU_ITEMS: MenuItem[] = [
  { name: "index", label: "🏠 Главная" },
  { name: "history", label: "📋 История" },
  { name: "achievements", label: "🏆 Достижения" },
  { name: "settings", label: "⚙️ Настройки" },
  { name: "about", label: "ℹ️ О приложении" },
  { name: "debug", label: "🐛 Debug", devOnly: true },
];

/** Возвращает пункты меню с учётом режима сборки */
export function getVisibleMenuItems(): MenuItem[] {
  return MENU_ITEMS.filter((item) => !item.devOnly || __DEV__);
}
