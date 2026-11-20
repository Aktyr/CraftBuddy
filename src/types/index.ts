export type Gender = "male" | "female";
export type BeerType = "light" | "dark" | "ipa" | "wheat" | "stout";
export type CompanionState =
  | "idle"
  | "happy"
  | "cheerful"
  | "warning"
  | "critical"
  | "forecast"
  | "levelUp";

export type GlassId = "tulip" | "pint" | "snifter" | "mug" | "weizen";
export type TasteTag =
  | "Цитрус"
  | "Хвойный"
  | "Карамель"
  | "Шоколад"
  | "Кофе"
  | "Фруктовый"
  | "Травянистый"
  | "Сладкий"
  | "Горький"
  | "Кислый"
  | "Дымный"
  | "Пряный";

export interface UserProfile {
  weightKg: number;
  gender: Gender;
  preferredGlass: GlassId;
}
export interface Checkin {
  id: string;
  beerName: string;
  volumeMl: number;
  abv: number;
  rating: number;
  glassType: GlassId;
  beerType: BeerType;
  tasteTags: TasteTag[];
  timestamp: number;
  scannedBarcode?: string;
}

export type AchievementId =
  | "first_beer"
  | "taster"
  | "gourmet"
  | "traveler"
  | "teetotaler";

export interface Achievement {
  id: AchievementId;
  title: string;
  description: string;
  emoji: string;
}

export type SortMode = "fresh" | "old" | "rating" | "abv";
