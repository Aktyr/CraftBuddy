export type Gender = "male" | "female";

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
  tasteTags: string[];
  timestamp: number; // Date.now()
}

export type CompanionState = "idle" | "happy" | "levelUp" | "drunk" | "sleep";
