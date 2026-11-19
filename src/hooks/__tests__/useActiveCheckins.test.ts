jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

import { useAppStore } from "../../store/useAppStore";
import { Checkin } from "../../types";

function getActiveCheckins(): Checkin[] {
  const { checkins, lastBacReset } = useAppStore.getState();
  return lastBacReset
    ? checkins.filter((c) => c.timestamp >= lastBacReset)
    : checkins;
}

describe("useActiveCheckins (логика фильтрации)", () => {
  beforeEach(() => {
    useAppStore.setState({
      checkins: [],
      lastBacReset: null,
    });
  });

  it("возвращает все чекины, если сброса не было", () => {
    const checkins: Checkin[] = [
      {
        id: "1",
        beerName: "Test 1",
        volumeMl: 500,
        abv: 5,
        rating: 4,
        glassType: "pint",
        beerType: "light",
        tasteTags: [],
        timestamp: Date.now() - 10000,
      },
    ];
    useAppStore.setState({ checkins });
    expect(getActiveCheckins()).toEqual(checkins);
  });

  it("возвращает только чекины после lastBacReset", () => {
    const now = Date.now();
    const resetTime = now - 60000;
    const checkins: Checkin[] = [
      {
        id: "1",
        beerName: "Old",
        volumeMl: 500,
        abv: 5,
        rating: 4,
        glassType: "pint",
        beerType: "light",
        tasteTags: [],
        timestamp: now - 120000,
      },
      {
        id: "2",
        beerName: "New",
        volumeMl: 330,
        abv: 4.5,
        rating: 3,
        glassType: "tulip",
        beerType: "wheat",
        tasteTags: [],
        timestamp: now - 30000,
      },
    ];
    useAppStore.setState({ checkins, lastBacReset: resetTime });
    const active = getActiveCheckins();
    expect(active).toHaveLength(1);
    expect(active[0].id).toBe("2");
  });

  it("возвращает пустой массив, если все чекины до сброса", () => {
    const now = Date.now();
    const resetTime = now - 30000;
    const checkins: Checkin[] = [
      {
        id: "1",
        beerName: "Old",
        volumeMl: 500,
        abv: 5,
        rating: 4,
        glassType: "pint",
        beerType: "light",
        tasteTags: [],
        timestamp: now - 60000,
      },
    ];
    useAppStore.setState({ checkins, lastBacReset: resetTime });
    expect(getActiveCheckins()).toHaveLength(0);
  });
});
