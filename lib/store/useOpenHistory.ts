import { create } from "zustand";

interface OpenState {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const useOpenHistory = create<OpenState>()((set) => ({
  open: true,
  setOpen: (open) => set(() => ({ open: open })),
}));
