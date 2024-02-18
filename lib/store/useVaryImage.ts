import { create } from "zustand";

interface ImageState {
  images: string[];
  setImages: (images: string[]) => void;
  deleteImage: (images: string) => void;
}

export const useVaryImage = create<ImageState>()((set) => ({
  images: [],
  setImages: (images) =>
    set((state) => ({ images: [...state.images, ...images] })),
  deleteImage: (image) =>
    set((state) => ({ images: state.images.filter((img) => img !== image) })),
}));
