import { BeerType } from "../types";
import { colors } from "./theme";

export function getBeerColor(type: BeerType): { top: string; bottom: string } {
  switch (type) {
    case "light":
      return { top: "#FCD34D", bottom: "#F59E0B" };
    case "wheat":
      return { top: "#FEF3C7", bottom: "#FCD34D" };
    case "ipa":
      return { top: "#F59E0B", bottom: "#D97706" };
    case "dark":
      return { top: "#78350F", bottom: "#3F2410" };
    case "stout":
      return { top: "#3F2410", bottom: "#1C1108" };
    default:
      return { top: colors.beerLight, bottom: colors.beerLight };
  }
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
