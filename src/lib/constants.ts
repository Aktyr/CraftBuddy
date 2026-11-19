import { BeerType, GlassId, TasteTag } from "../types";

export const LEVEL_XP = 50;
export const WATER_UNLOCK_MIN = 10;
export const BAC_LIMIT = 0.8;
export const BAC_HARD_LIMIT = 1.5;
export const BAC_HAPPY = 0.3;
export const BAC_DRUNK = 0.05;
export const XP_NEW_BEER = 15;
export const XP_DUPLICATE = 5;
export const XP_SCAN_BONUS = 5;

export const PREVENTIVE_THRESHOLD = 0.7;
export const MAX_VOLUME_ML = 2000;
export const MAX_ABV_PERCENT = 60;

/** Окно графика BAC: 24 часа назад от текущего момента */
export const CHART_WINDOW_BACK_MS = 24 * 60 * 60 * 1000;
/** Окно графика BAC: 4 часа вперёд от текущего момента */
export const CHART_WINDOW_FORWARD_MS = 4 * 60 * 60 * 1000;
/** Максимальное число точек на графике — защита от деградации производительности */
export const CHART_MAX_POINTS = 200;
/** Базовый шаг дискретизации графика (2 минуты) */
export const CHART_BASE_STEP_MS = 2 * 60 * 1000;

export const BEER_TYPES: BeerType[] = [
  "light",
  "wheat",
  "ipa",
  "dark",
  "stout",
];

export const TYPE_LABELS: Record<BeerType, string> = {
  light: "Светлое",
  wheat: "Пшеничное",
  ipa: "IPA",
  dark: "Тёмное",
  stout: "Стаут",
};

export const GLASSES: { id: GlassId; label: string; emoji: string }[] = [
  { id: "tulip", label: "Тюльпан", emoji: "🌷" },
  { id: "pint", label: "Пинта", emoji: "🍺" },
  { id: "snifter", label: "Снифтер", emoji: "🥃" },
  { id: "mug", label: "Кружка", emoji: "🍻" },
  { id: "weizen", label: "Вайцен", emoji: "🌾" },
];

export const TASTE_TAGS: TasteTag[] = [
  "Цитрус",
  "Хвойный",
  "Карамель",
  "Шоколад",
  "Кофе",
  "Фруктовый",
  "Травянистый",
  "Сладкий",
  "Горький",
  "Кислый",
  "Дымный",
  "Пряный",
];
