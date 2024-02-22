import { create } from "zustand";

interface ImageState {
  images: string[];
  setImages: (images: string[]) => void;
  deleteImage: (image: string) => void;
}

export const useExpandImages = create<ImageState>()((set) => ({
  images: [],
  setImages: (images) =>
    set((state) => ({
      images: [...state.images, ...images],
    })),
  deleteImage: (image) =>
    set((state) => ({
      images: state.images.filter((img) => img !== image),
    })),
}));
