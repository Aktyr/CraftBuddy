import { BeerType } from "../types";
import { colors } from "./theme";

export function getBeerColor(type: BeerType): { top: string; bottom: string } {
  return (
    colors.beerColors[type] ?? {
      top: colors.beerLight,
      bottom: colors.beerLight,
    }
  );
}

export function getBeerAccent(type: BeerType): string {
  switch (type) {
    case "light":
      return colors.beerLight;
    case "wheat":
      return colors.beerWheat;
    case "ipa":
      return colors.beerIpa;
    case "dark":
      return colors.beerDark;
    case "stout":
      return colors.beerStout;
  }
}
