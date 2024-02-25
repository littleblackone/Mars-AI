import { create } from "zustand";

interface ImageState {
  images: string[];
  setImages: (images: string[]) => void;
  deleteImage: (index: number) => void;
}

export const useOriginImage = create<ImageState>()((set) => ({
  images: [],
  setImages: (images) =>
    set((state) => ({ images: [...state.images, ...images] })),
  deleteImage: (index) =>
    set((state) => ({ images: state.images.filter((img, i) => i !== index) })),
}));
