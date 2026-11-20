import { Checkin, UserProfile } from "../../types";
import {
  getCheckinBlockReason,
  getCompanionState,
  isWaterActive,
} from "../companion";
import { BAC_HARD_LIMIT, BAC_LIMIT, WATER_UNLOCK_MIN } from "../constants";

const mockProfile: UserProfile = {
  weightKg: 70,
  gender: "male",
  preferredGlass: "pint",
};

describe("getCheckinBlockReason", () => {
  const now = Date.now();
  const emptyCheckins: Checkin[] = [];

  it("возвращает null ниже лимита", () => {
    expect(getCheckinBlockReason(0.5, 0, now, emptyCheckins, mockProfile)).toBe(
      null,
    );
  });

  it("возвращает 'soft' выше лимита без воды", () => {
    expect(
      getCheckinBlockReason(
        BAC_LIMIT + 0.01,
        0,
        now,
        emptyCheckins,
        mockProfile,
      ),
    ).toBe("soft");
  });

  it("возвращает null выше лимита с активной водой", () => {
    const lastWaterAt = now - 1000; // вода выпита 1 секунду назад
    expect(
      getCheckinBlockReason(
        BAC_LIMIT + 0.01,
        lastWaterAt,
        now,
        emptyCheckins,
        mockProfile,
      ),
    ).toBe(null);
  });

  it("возвращает 'hard' при критическом уровне", () => {
    expect(
      getCheckinBlockReason(
        BAC_HARD_LIMIT + 0.01,
        0,
        now,
        emptyCheckins,
        mockProfile,
      ),
    ).toBe("hard");
  });

  it("возвращает 'hard' даже с активной водой при критическом уровне", () => {
    const lastWaterAt = now - 1000;
    expect(
      getCheckinBlockReason(
        BAC_HARD_LIMIT + 0.01,
        lastWaterAt,
        now,
        emptyCheckins,
        mockProfile,
      ),
    ).toBe("hard");
  });

  it("возвращает 'forecast' при прогнозе превышения", () => {
    // Создаём чекин, который через 2 часа даст BAC > BAC_HARD_LIMIT
    const futureCheckin: Checkin = {
      id: "1",
      beerName: "Test",
      volumeMl: 1000,
      abv: 12,
      rating: 4,
      glassType: "pint",
      beerType: "light",
      tasteTags: [],
      timestamp: now - 60000, // 1 минуту назад
    };

    // Текущий BAC чуть ниже лимита, но прогноз показывает превышение
    const currentBac = BAC_LIMIT * 0.8; // 80% от лимита
    expect(
      getCheckinBlockReason(currentBac, 0, now, [futureCheckin], mockProfile),
    ).toBe("forecast");
  });

  it("не возвращает 'forecast' если текущий BAC слишком низкий", () => {
    const futureCheckin: Checkin = {
      id: "1",
      beerName: "Test",
      volumeMl: 1000,
      abv: 12,
      rating: 4,
      glassType: "pint",
      beerType: "light",
      tasteTags: [],
      timestamp: now - 60000,
    };

    // Текущий BAC значительно ниже лимита — прогноз не должен срабатывать
    const currentBac = BAC_LIMIT * 0.3; // 30% от лимита
    expect(
      getCheckinBlockReason(currentBac, 0, now, [futureCheckin], mockProfile),
    ).not.toBe("forecast");
  });
});

describe("getCompanionState", () => {
  it("возвращает 'idle' при нулевом BAC и без прогноза", () => {
    expect(getCompanionState(0, false)).toBe("idle");
  });

  it("возвращает 'happy' при текущем BAC в диапазоне (BAC_DRUNK, BAC_HAPPY)", () => {
    expect(getCompanionState(0.1, false)).toBe("happy");
  });

  it("возвращает 'cheerful' при текущем BAC >= BAC_HAPPY без прогноза", () => {
    expect(getCompanionState(0.5, false)).toBe("cheerful");
  });

  it("оценивает состояние по peakBac, а не по текущему BAC", () => {
    // Текущий BAC низкий, но прогноз превышает лимит
    expect(getCompanionState(0.2, false, 1.0)).toBe("forecast");
    expect(getCompanionState(0.5, false, 1.0)).toBe("warning");
  });

  it("возвращает 'critical' при peakBac > BAC_HARD_LIMIT", () => {
    expect(getCompanionState(0.5, false, 2.0)).toBe("critical");
  });

  it("возвращает 'forecast' при peakBac > BAC_LIMIT и текущем BAC < BAC_HAPPY", () => {
    expect(getCompanionState(0.1, false, 1.0)).toBe("forecast");
  });

  it("возвращает 'warning' при peakBac > BAC_LIMIT и текущем BAC >= BAC_HAPPY", () => {
    expect(getCompanionState(0.5, false, 1.0)).toBe("warning");
  });

  it("'levelUp' имеет приоритет над любыми состояниями", () => {
    expect(getCompanionState(2.0, true, 2.0)).toBe("levelUp");
  });

  it("без peakBac возвращается к оценке по текущему BAC", () => {
    expect(getCompanionState(0.9, false)).toBe("warning");
    expect(getCompanionState(1.6, false)).toBe("critical");
  });
});

describe("isWaterActive", () => {
  it("возвращает true сразу после воды", () => {
    const now = Date.now();
    expect(isWaterActive(now - 1000, now)).toBe(true);
  });

  it("возвращает false после истечения WINDOW", () => {
    const now = Date.now();
    const last = now - (WATER_UNLOCK_MIN + 1) * 60_000;
    expect(isWaterActive(last, now)).toBe(false);
  });
});
