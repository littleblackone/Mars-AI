import { create } from "zustand";

interface CreditsState {
  infinityai_user_credits: number;
  setCredits: (num: number) => void;
}

export const useCredits = create<CreditsState>()((set) => ({
  infinityai_user_credits: 0,
  setCredits: (num) => set(() => ({ infinityai_user_credits: num })),
}));
