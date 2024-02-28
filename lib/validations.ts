import * as z from "zod";

export const ImageValidation = z.object({
  aspectRatio: z.enum([
    " --ar 1:1",
    " --ar 3:2",
    " --ar 4:3",
    " --ar 16:9",
    " --ar 9:16",
    " ",
  ]),
  model: z.enum([" --v 5.2", " --v 6", " --niji 6"]),
  negativePrompt: z.string().max(300, "字数超过限制,请简短一些"),
  seeds: z.number().min(0).max(4294967295),
  stylize: z.number().min(0).max(1000),
  quality: z.enum([" --q .25", " --q .5", " --q 1"]),
  chaos: z.number().min(0).max(100),
  prompt: z
    .string()
    .min(1, "请描述你的想象")
    .max(3000, "字数超过限制,请简短一些"),
  imageWeight: z.number().min(0).max(3),
  stop: z.number().min(10).max(100),
  weird: z.number().min(0).max(3000),
});
