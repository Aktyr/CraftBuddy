import { Achievement, AchievementId, Checkin } from "../types";

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_beer",
    title: "Первое пиво",
    description: "Сделай первый чекин",
    emoji: "🍺",
  },
  { id: "taster", title: "Дегустатор", description: "10 чекинов", emoji: "🏅" },
  {
    id: "gourmet",
    title: "Гурман",
    description: "5 уникальных сортов",
    emoji: "👨‍🍳",
  },
  {
    id: "traveler",
    title: "Путешественник",
    description: "Попробуй все 5 типов пива",
    emoji: "🌍",
  },
  {
    id: "teetotaler",
    title: "Трезвенник",
    description: "Нажми «Вода» 5 раз",
    emoji: "💧",
  },
];

export function getUnlockedAchievements(
  checkins: Checkin[],
  waterCount: number,
): Set<AchievementId> {
  const unlocked = new Set<AchievementId>();
  if (checkins.length >= 1) unlocked.add("first_beer");
  if (checkins.length >= 10) unlocked.add("taster");

  const uniqueNames = new Set(checkins.map((c) => c.beerName.toLowerCase()));
  if (uniqueNames.size >= 5) unlocked.add("gourmet");

  const types = new Set(checkins.map((c) => c.beerType));
  if (types.size >= 5) unlocked.add("traveler");

  if (waterCount >= 5) unlocked.add("teetotaler");

  return unlocked;
}
