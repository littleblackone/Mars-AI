import * as z from "zod";

export const ImageValidation = z.object({
  aspectRatio: z
    .enum([
      " --ar 1:1",
      " --ar 3:2",
      " --ar 4:3",
      " --ar 16:9",
      " --ar 9:16",
      " ",
    ])
    .optional(),

  model: z.enum([" --v 5.2", " --v 6", " --niji 6"]).optional(),
  negativePrompt: z.string().max(300, "字数超过限制,请简短一些").optional(),
  seeds: z.number().min(0).max(4294967295).optional(),
  stylize: z.number().min(0).max(1000),
  quality: z.enum([" --q .25", " --q .5", " --q 1"]),
  chaos: z.number().min(0).max(100),
  prompt: z
    .string()
    .min(1, "请写下你的想法")
    .max(1500, "字数超过限制,请简短一些"),
});
