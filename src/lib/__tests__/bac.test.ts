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

  it("увеличивается после чекина", () => {
    const now = Date.now();
    const checkins = [makeCheckin(500, 5, 0)];
    const bac = calculateBac(checkins, profile, now);
    expect(bac).toBeGreaterThan(0);
  });

  it("падает со временем", () => {
    const now = Date.now();
    const fresh = calculateBac([makeCheckin(500, 5, 0)], profile, now);
    const old = calculateBac([makeCheckin(500, 5, 120)], profile, now);
    expect(old).toBeLessThan(fresh);
  });
  it("полностью выветривается", () => {
    expect(calculateBac([makeCheckin(500, 5, 2000)], profile)).toBe(0);
  });

  it("женский BAC выше при тех же параметрах", () => {
    const female: UserProfile = { weightKg: 70, gender: "female" };
    const checkins = [makeCheckin(500, 5, 0)];
    const now = Date.now();
    const maleBac = calculateBac(checkins, profile, now);
    const femaleBac = calculateBac(checkins, female, now);
    expect(femaleBac).toBeGreaterThan(maleBac);
  });

  it("суммируется от нескольких чекинов", () => {
    const checkins = [makeCheckin(500, 5, 0), makeCheckin(500, 5, 0)];
    const single = calculateBac([checkins[0]], profile);
    const total = calculateBac(checkins, profile);
    expect(total).toBeGreaterThan(single);
  });

  it("не уходит в минус", () => {
    const checkins = [makeCheckin(100, 4, 10_000)];
    expect(calculateBac(checkins, profile)).toBe(0);
  });
});
