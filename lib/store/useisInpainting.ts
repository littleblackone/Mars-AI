import { create } from "zustand";

interface OpenState {
  isInpainting: boolean;
  setIsInpainting: (bool: boolean) => void;
}

export const useIsInpainting = create<OpenState>()((set) => ({
  isInpainting: false,
  setIsInpainting: (bool) => set(() => ({ isInpainting: bool })),
}));
