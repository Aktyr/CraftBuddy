export type Gender = "male" | "female";
export type BeerType = "light" | "dark" | "ipa" | "wheat" | "stout";
export type CompanionState = "idle" | "happy" | "levelUp" | "drunk" | "sleep";

export interface UserProfile {
  weightKg: number;
  gender: Gender;
}

export interface Checkin {
  id: string;
  beerName: string;
  volumeMl: number;
  abv: number;
  rating: number;
  glassType: string;
  beerType: BeerType;
  tasteTags: string[];
  isNew: boolean; // был ли сорт уникальным на момент чекина
  timestamp: number;
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
