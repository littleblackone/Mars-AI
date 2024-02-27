import { create } from "zustand";

interface OpenState {
  isUpscaled: boolean;
  setIsUpscaled: (bool: boolean) => void;
}

export const useIsUpscaled = create<OpenState>()((set) => ({
  isUpscaled: false,
  setIsUpscaled: (bool) => set(() => ({ isUpscaled: bool })),
}));
