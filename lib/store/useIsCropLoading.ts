import { create } from "zustand";

interface OpenState {
  isLoading: boolean;
  setIsLoading: (bool: boolean) => void;
}

export const useIsCropLoading = create<OpenState>()((set) => ({
  isLoading: true,
  setIsLoading: (bool) => set(() => ({ isLoading: bool })),
}));
