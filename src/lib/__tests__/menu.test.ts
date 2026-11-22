import { getVisibleMenuItems, MENU_ITEMS } from "../menu";

describe("menu", () => {
  it("MENU_ITEMS содержит все пункты меню", () => {
    expect(MENU_ITEMS).toHaveLength(7);
    expect(MENU_ITEMS.find((item) => item.name === "index")).toBeDefined();
    expect(MENU_ITEMS.find((item) => item.name === "debug")).toBeDefined();
  });

  it("debug имеет флаг devOnly", () => {
    const debugItem = MENU_ITEMS.find((item) => item.name === "debug");
    expect(debugItem?.devOnly).toBe(true);
  });

  describe("getVisibleMenuItems", () => {
    it("в dev-режиме возвращает все пункты", () => {
      const items = getVisibleMenuItems();
      expect(items).toHaveLength(7);
      expect(items.find((item) => item.name === "debug")).toBeDefined();
    });

    it("в продакшене скрывает devOnly пункты", () => {
      const originalDev = (globalThis as any).__DEV__;
      (globalThis as any).__DEV__ = false;

      try {
        const items = getVisibleMenuItems();
        expect(items).toHaveLength(6);
        expect(items.find((item) => item.name === "debug")).toBeUndefined();
      } finally {
        (globalThis as any).__DEV__ = originalDev;
      }
    });
  });
});
