import { create } from "zustand";

interface CreditsState {
  credits: number;
  setCredits: (num: number) => void;
}

export const useCredits = create<CreditsState>()((set) => ({
  credits: 0,
  setCredits: (num) => set(() => ({ credits: num })),
}));
