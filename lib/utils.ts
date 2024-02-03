import { ImageFormData } from "@/app/interface/ImageData";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const debounce = (func: any, delay: number) => {
  let timer: ReturnType<typeof setTimeout>;
  return function (this: unknown, ...args: any) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

export function generateRandomInteger() {
  return Math.floor(Math.random() * 4294967295);
}

function formatNegativePrompt(negativePrompt: string): string {
  const words = negativePrompt.split(" ").filter((word) => word.trim() !== "");
  const formattedWords = words.map((word) => `--no ${word}`).join(" ");
  return formattedWords;
}

export function generateFinalPrompt(values: ImageFormData) {
  const {
    prompt,
    negativePrompt,
    seeds,
    // speed,
    stylize,
    chaos,
    aspectRatio,
    model,
    artStyles,
  } = values;

  const handledNegativePrompt = formatNegativePrompt(negativePrompt || "");

  const finalPromptArray = [];

  finalPromptArray.push(
    prompt,
    artStyles,
    handledNegativePrompt,
    // `--seed ${seeds}`,
    ` --stylize ${stylize}`,
    ` --chaos ${chaos}`,
    aspectRatio,
    model
    // speed
  );
  console.log(finalPromptArray);

  const finalPrompt =
    finalPromptArray.filter((item) => item !== "").length > 0
      ? finalPromptArray.filter(Boolean).join("").trim()
      : "";
  return finalPrompt;
}
