import { create } from "zustand";

interface State {
  isExpandeUp: boolean;
  setIsExpandeUp: (bool: boolean) => void;
}

export const useIsExpandUp = create<State>()((set) => ({
  isExpandeUp: false,
  setIsExpandeUp: (bool) =>
    set(() => ({
      isExpandeUp: bool,
    })),
}));
