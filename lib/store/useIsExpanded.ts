import { create } from "zustand";

interface State {
  isExpanded: boolean;
  setIsExpanded: (bool: boolean) => void;
}

export const useIsExpanded = create<State>()((set) => ({
  isExpanded: false,
  setIsExpanded: (bool) =>
    set(() => ({
      isExpanded: bool,
    })),
}));
