import {
  FetchImageData,
  ImageFormData,
  Options,
} from "@/app/interface/ImageData";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { styles } from "./constant";
import axios from "axios";
import { toast } from "sonner";

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

export function generateFinalPrompt(
  values: ImageFormData,
  useStyleRow: boolean
) {
  const {
    prompt,
    negativePrompt,
    seeds,
    stylize,
    chaos,
    aspectRatio,
    model,
    quality,
  } = values;

  const handledNegativePrompt =
    " --no " + negativePrompt?.replace(/，/g, ",").replace(/\s+/g, "").trim();

  const finalPromptArray = [];

  finalPromptArray.push(prompt);

  if (useStyleRow) {
    finalPromptArray.push(" --style raw");
  }

  if (handledNegativePrompt !== " --no ") {
    finalPromptArray.push(handledNegativePrompt);
  }

  finalPromptArray.push(
    quality,
    ` --stylize ${stylize}`,
    ` --chaos ${chaos}`,
    aspectRatio,
    model
  );

  if (seeds !== 0) {
    finalPromptArray.push(` --seed ${seeds}`);
  }
  const finalPrompt =
    finalPromptArray.filter((item) => item !== "").length > 0
      ? finalPromptArray.filter(Boolean).join("").trim()
      : "";
  return finalPrompt;
}

export const handleDownload = (url: string, index: number) => {
  try {
    //添加时间戳作为请求url的随机参数，避免浏览器使用缓存的响应(解决跨域)
    const timeStamp = new Date().getTime();
    axios
      .get(url, {
        params: { timeStamp },
        responseType: "blob",
      })
      .then((res) => {
        let contentType = "";
        if (res.headers["content-type"]) {
          contentType = res.headers["content-type"];
        }
        const blob = new Blob([res.data], {
          type: contentType,
        });
        const blobUrl = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `midjourney${index}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      });
  } catch (error) {
    toast.error("服务器繁忙，请稍后重试");
    console.error("Error downloading image:", error);
  }
};

export function extractArAndModel(input: string): string {
  if (input.includes("--ar")) {
    return input.split(" --ar ")[1];
  } else if (input.includes("--v")) {
    return input.split(" --")[1];
  } else if (input.includes("--niji")) {
    return input.split(" --")[1];
  } else {
    return "";
  }
}

export function parseAspectRatio(aspectRatio: string): {
  greaterThanOne: boolean;
  equalToOne: boolean;
  lessThanOne: boolean;
} {
  const ratio = aspectRatio.split(" --ar ")[1].split(":");
  const width = parseInt(ratio[0]);
  const height = parseInt(ratio[1]);

  const aspectRatioValue = width / height;

  return {
    greaterThanOne: aspectRatioValue > 1,
    equalToOne: aspectRatioValue === 1,
    lessThanOne: aspectRatioValue < 1,
  };
}

export const handleCopy = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("prompt已复制到剪贴板");
  } catch (error) {
    console.error("Failed to copy: ", error);
  }
};

export function convertStringToArray(input: string): string[] {
  // 将字符串按换行符分割成数组
  const lines: string[] = input.split("\n");

  // 去除空白行
  const filteredLines: string[] = lines.filter((line) => line.trim() !== "");

  // 去除序号并保存剩余内容到数组中
  const result: string[] = filteredLines.map((line) => {
    // 去除开头的序号
    const lineWithoutIndex = line.replace(/^\d+\️⃣/, "").trim();
    // 匹配类似 [artist name](artist link) 格式的字符串
    const regex = /\[([^\]]+)\]\([^)]+\)/g;
    const artistsMatches = lineWithoutIndex.match(regex);

    if (artistsMatches) {
      // 替换字符串中的 artist link 为艺术家的姓名
      const replacedLine = lineWithoutIndex.replace(regex, (match, p1) => p1);
      return replacedLine.trim();
    }

    return lineWithoutIndex.trim();
  });

  return result;
}

export const handleGetSeed = async (taskId: string, setSeed: any) => {
  try {
    const response = await axios.post("/api/seed", { taskId });

    const newTaskId = response.data.task_id;

    const intervalId = setInterval(async () => {
      const taskResult: FetchImageData = await axios.post("/api/fetchImage", {
        taskId: newTaskId,
      });

      if (taskResult.data.status === "finished") {
        clearInterval(intervalId);
        setSeed(taskResult.data.task_result.seed);
      }
    }, 1000);
  } catch (error) {
    console.error("Error fetching seed:", error);
  }
};

export function extractOptions(inputString: string): Options {
  const options: Options = {
    AspectRatio: "",
    Chaos: "",
    ImageWeight: "",
    Quality: "",
    Stop: "",
    Style: "",
    Stylize: "",
    Tile: false,
    Weird: "",
    Seed: "",
    Version: "",
  };

  const parts = inputString.split("--").slice(1); // Split string by '--', ignore first element
  parts.forEach((part) => {
    const [key, ...valueParts] = part.trim().split(/\s+/);
    const value = valueParts.join(" ");

    switch (key) {
      case "aspect":
      case "ar":
        options.AspectRatio = value;
        break;
      case "chaos":
        options.Chaos = value;
        break;
      case "iw":
        options.ImageWeight = value;
        break;
      case "quality":
      case "q":
        options.Quality = value;
        break;
      case "stop":
        options.Stop = value;
        break;
      case "style":
        options.Style = value;
        break;
      case "stylize":
      case "s":
        options.Stylize = value;
        break;
      case "tile":
        options.Tile = true;
        break;
      case "weird":
      case "w":
        options.Weird = value;
        break;
      case "seed":
        options.Seed = value;
        break;
      case "version":
      case "v":
        options.Version = value;
        break;
      default:
        break;
    }
  });

  return options;
}
