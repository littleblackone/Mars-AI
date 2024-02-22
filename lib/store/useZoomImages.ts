import { create } from "zustand";

interface ImageState {
  images: string[];
  setImages: (images: string[]) => void;
  deleteImage: (image: string) => void;
}

export const useZoomImages = create<ImageState>()((set) => ({
  images: [],
  setImages: (images: string[]) =>
    set((state) => ({
      images: [...state.images, ...images],
    })),
  deleteImage: (image) =>
    set((state) => ({
      images: state.images.filter((img) => img !== image),
    })),
}));
