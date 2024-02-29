import { create } from "zustand";

interface OpenState {
  open: boolean;
  index: number;
  imgListName: string;
  imgUrl: string;
  setOpen: (bool: boolean) => void;
  setIndex: (index: number) => void;
  setImgListName: (imgListName: string) => void;
  setImgUrl: (imgUrl: string) => void;
}

export const useFullViewImage = create<OpenState>()((set) => ({
  open: false,
  index: 0,
  imgListName: "",
  imgUrl: "",
  setOpen: (bool) => set(() => ({ open: bool })),
  setIndex: (index) => set(() => ({ index: index })),
  setImgListName: (imgListName) => set(() => ({ imgListName: imgListName })),
  setImgUrl: (imgUrl) => set(() => ({ imgUrl: imgUrl })),
}));
