import {
  getCompanionState,
  isCheckinBlocked,
  isWaterActive,
} from "../companion";
import { BAC_LIMIT, WATER_UNLOCK_MIN } from "../constants";

describe("getCompanionState", () => {
  it("idle при нулевом BAC", () => {
    expect(getCompanionState(0, false)).toBe("idle");
  });
  it("drunk при BAC_DRUNK < bac < BAC_HAPPY", () => {
    expect(getCompanionState(0.1, false)).toBe("drunk");
  });
  it("happy при BAC_HAPPY <= bac <= BAC_LIMIT", () => {
    expect(getCompanionState(0.5, false)).toBe("happy");
  });
  it("sleep при превышении лимита", () => {
    expect(getCompanionState(BAC_LIMIT + 0.1, false)).toBe("sleep");
  });
  it("levelUp имеет приоритет", () => {
    expect(getCompanionState(BAC_LIMIT + 0.5, true)).toBe("levelUp");
  });
});

describe("isCheckinBlocked", () => {
  it("false ниже лимита", () => expect(isCheckinBlocked(0.5, 0)).toBe(false));
  it("true выше лимита", () =>
    expect(isCheckinBlocked(BAC_LIMIT + 0.01, 0)).toBe(true));
});

describe("isWaterActive", () => {
  it("true сразу после воды", () => {
    const now = Date.now();
    expect(isWaterActive(now - 1000, now)).toBe(true);
  });
  it("false после истечения WINDOW", () => {
    const now = Date.now();
    const last = now - (WATER_UNLOCK_MIN + 1) * 60_000;
    expect(isWaterActive(last, now)).toBe(false);
  });
});
