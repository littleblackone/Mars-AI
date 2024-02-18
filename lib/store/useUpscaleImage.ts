import { create } from "zustand";

interface ImageState {
  images: string[];
  setImages: (image: string) => void;
  deleteImage: (image: string) => void;
}

export const useUpscaleImage = create<ImageState>()((set) => ({
  images: [],
  setImages: (image) =>
    set((state) => ({
      images: [...state.images, image],
    })),
  deleteImage: (image) =>
    set((state) => ({
      images: state.images.filter((img) => img !== image),
    })),
}));
