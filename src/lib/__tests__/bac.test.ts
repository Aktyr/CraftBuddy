import { Checkin, UserProfile } from "../../types";
import { calculateBac } from "../bac";

const profile: UserProfile = { weightKg: 70, gender: "male" };

const makeCheckin = (
  volumeMl: number,
  abv: number,
  minutesAgo: number,
): Checkin => ({
  id: "x",
  beerName: "Test",
  volumeMl,
  abv,
  rating: 4,
  glassType: "pint",
  beerType: "light",
  tasteTags: [],
  isNew: true,
  timestamp: Date.now() - minutesAgo * 60_000,
});

describe("calculateBac", () => {
  it("возвращает 0 при пустом списке", () => {
    expect(calculateBac([], profile)).toBe(0);
  });

  it("растёт в фазе всасывания", () => {
    const now = Date.now();
    const start = calculateBac([makeCheckin(500, 5, 0)], profile, now);
    const mid = calculateBac([makeCheckin(500, 5, 22)], profile, now);
    expect(mid).toBeGreaterThan(start);
  });

  it("падает после пика всасывания", () => {
    const now = Date.now();
    const peak = calculateBac([makeCheckin(500, 5, 45)], profile, now);
    const later = calculateBac([makeCheckin(500, 5, 120)], profile, now);
    expect(later).toBeLessThan(peak);
  });

  it("полностью выветривается", () => {
    expect(calculateBac([makeCheckin(500, 5, 2000)], profile)).toBe(0);
  });

  it("женский BAC выше при тех же параметрах", () => {
    const female: UserProfile = { weightKg: 70, gender: "female" };
    const now = Date.now();
    const maleBac = calculateBac([makeCheckin(500, 5, 60)], profile, now);
    const femaleBac = calculateBac([makeCheckin(500, 5, 60)], female, now);
    expect(femaleBac).toBeGreaterThan(maleBac);
  });

  it("суммируется от нескольких чекинов", () => {
    const now = Date.now();
    const single = calculateBac([makeCheckin(500, 5, 60)], profile, now);
    const double = calculateBac(
      [makeCheckin(500, 5, 60), makeCheckin(500, 5, 60)],
      profile,
      now,
    );
    expect(double).toBeGreaterThan(single);
  });

  it("не уходит в минус", () => {
    expect(calculateBac([makeCheckin(100, 4, 10_000)], profile)).toBe(0);
  });
});
