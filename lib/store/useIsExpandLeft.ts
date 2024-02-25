import { create } from "zustand";

interface State {
  isExpandeLeft: boolean;
  setIsExpandeLeft: (bool: boolean) => void;
}

export const useIsExpandLeft = create<State>()((set) => ({
  isExpandeLeft: false,
  setIsExpandeLeft: (bool) =>
    set(() => ({
      isExpandeLeft: bool,
    })),
}));
