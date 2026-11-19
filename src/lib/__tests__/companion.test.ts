import { UserProfile } from "../../types";
import {
  getCheckinBlockReason,
  getCompanionState,
  isWaterActive,
} from "../companion";
import { BAC_LIMIT, WATER_UNLOCK_MIN } from "../constants";

const mockProfile: UserProfile = { weightKg: 70, gender: "male" };

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

describe("getCheckinBlockReason", () => {
  const now = Date.now();

  it("null ниже лимита", () => {
    expect(getCheckinBlockReason(0.5, 0, now, [], mockProfile)).toBe(null);
  });
  it("soft выше лимита без воды", () => {
    expect(
      getCheckinBlockReason(BAC_LIMIT + 0.01, 0, now, [], mockProfile),
    ).toBe("soft");
  });
  it("null выше лимита с активной водой", () => {
    expect(
      getCheckinBlockReason(BAC_LIMIT + 0.01, now - 1000, now, [], mockProfile),
    ).toBe(null);
  });
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
