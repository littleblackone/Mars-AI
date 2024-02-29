import { create } from "zustand";

interface ImageState {
  images: string[];
  prompts: string[];
  setImages: (images: string[]) => void;
  deleteImage: (index: number) => void;
  setPrompts: (prompt: string) => void;
  deletePrompt: (index: number) => void;
}

export const useZoomImages = create<ImageState>()((set) => ({
  images: [],
  prompts: [],
  setImages: (images) =>
    set((state) => ({ images: [...state.images, ...images] })),
  deleteImage: (index) =>
    set((state) => ({
      images: state.images.map((img, i) => (i === index ? "" : img)),
    })),
  setPrompts: (prompt) =>
    set((state) => ({ prompts: [...state.prompts, prompt] })),
  deletePrompt: (index) =>
    set((state) => ({
      prompts: state.prompts.filter((_, i) => i !== index),
    })),
}));
