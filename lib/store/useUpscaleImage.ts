import { create } from "zustand";

interface ImageState {
  images: string[];
  setImages: (image: string) => void;
  deleteImage: (index: number) => void;
}

export const useUpscaleImage = create<ImageState>()((set) => ({
  images: [],
  setImages: (image) =>
    set((state) => ({
      images: [...state.images, image],
    })),
  deleteImage: (index) =>
    set((state) => ({
      images: state.images.filter((img, i) => i !== index),
    })),
}));
