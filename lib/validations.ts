import * as z from "zod";

// AspectRatio（图片比例）：1:1 4:3 3:2 16:9 9:16 自定义
// Models(模型)：v1 v2 v3 v4 v5 v5.1 v5.2 v6 niji v4 niji v5 niji v6
// Art styles (艺术风格)：
// Negative prompt（否定描述）：
// seeds:不同的seed的图片变体不同0–4294967295
// 绘图速度：快速，涡轮
// 艺术程度：0-1000越高艺术性越强画面越丰富但是离prompt的描述越远。默认100
// 混乱程度：0-100，越高越混乱，能产生意想不到的结果。默认0
export const ImageValidation = z.object({
  aspectRatio: z
    .enum([" --ar 1:1", " --ar 3:2", " --ar 4:3", " --ar 16:9", " --ar 9:16"])
    .default(" --ar 1:1")
    .optional(),
  model: z
    .enum([
      " --v 1",
      " --v 2",
      " --v 3",
      " --v 4",
      " --v 5",
      " --v 5.1",
      " --v 5.2",
      " --v 6",

      " --niji 4",
      " --niji 5",
      " --niji 6",
    ])
    .default(" --v 5.2")
    .optional(),
  artStyles: z.string().max(50, "艺术风格过多").optional(),
  negativePrompt: z.string().max(100, "字数超过限制,请简短一些").optional(),
  seeds: z.number().min(0).max(4294967295).optional(),
  speed: z.enum([" --fast", " --turbo"]).optional(),
  stylize: z.number().min(0).max(1000).default(100),
  chaos: z.number().min(0).max(100).default(0),
  prompt: z
    .string()
    .min(1, "请写下你的想法")
    .max(300, "字数超过限制,请简短一些"),
  numberOfImage: z.enum(["1", "2", "3", "4"]).optional(),
});
