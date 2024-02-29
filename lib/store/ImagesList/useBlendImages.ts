import { create } from "zustand";

interface ImageState {
  images: string[];
  setImages: (images: string[]) => void;
  deleteImage: (index: number) => void;
}

export const useBlendImages = create<ImageState>()((set) => ({
  images: [],
  prompts: [],
  setImages: (images) =>
    set((state) => ({ images: [...state.images, ...images] })),
  deleteImage: (index) =>
    set((state) => ({
      images: state.images.map((img, i) => (i === index ? "" : img)),
    })),
}));
