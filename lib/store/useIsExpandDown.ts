import { create } from "zustand";

interface State {
  isExpandeDown: boolean;
  setIsExpandeDown: (bool: boolean) => void;
}

export const useIsExpandDown= create<State>()((set) => ({
  isExpandeDown: false,
  setIsExpandeDown: (bool) =>
    set(() => ({
      isExpandeDown: bool,
    })),
}));
