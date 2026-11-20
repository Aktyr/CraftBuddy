import { useEffect, useState } from "react";

// todo заменить состояния на Idle, Happy, Level Up, Sleep, Drunk
export type CompanionState = "sober" | "cheers" | "sleeping";

export interface CompanionStatus {
  state: CompanionState;
  bac: number;
  xp: number;
}

export const useCompanionState = (bac: number, xp: number): CompanionStatus => {
  const [state, setState] = useState<CompanionState>("sober");

  useEffect(() => {
    if (bac > 0.8) {
      setState("sleeping");
    } else if (bac >= 0.3 && bac <= 0.6) {
      setState("cheers");
    } else {
      setState("sober");
    }
  }, [bac, xp]);

  return { state, bac, xp };
};
