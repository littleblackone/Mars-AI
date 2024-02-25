import { create } from "zustand";

interface State {
  isExpandeRight: boolean;
  setIsExpandeRight: (bool: boolean) => void;
}

export const useIsExpandRight = create<State>()((set) => ({
  isExpandeRight: false,
  setIsExpandeRight: (bool) =>
    set(() => ({
      isExpandeRight: bool,
    })),
}));
