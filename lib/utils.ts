import {
  FetchImageData,
  ImageFormData,
  Options,
} from "@/lib/interface/ImageData";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import md5 from "md5";
import axios from "axios";
import { toast } from "sonner";
import { supabaseCli } from "./supabase/supabaseClient";
import { UserData } from "@/lib/interface/ImageData";

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

export const handleIw = (iw: number) => {
  if (iw > 0 && iw < 1) {
    return (iw + "").split("0")[1];
  } else {
    return iw;
  }
};

export const handleQuality = (q: string) => {
  // " --q .25" | " --q .5" | " --q 1"
  if (q === " --q .25") {
    return ".25";
  }
  if (q === " --q .5") {
    return ".5";
  }
  if (q === " --q 1") {
    return "1";
  }
};

export function cleanInput(input: string) {
  // 替换连字符 -- 及其后面的内容为空字符串
  input = input.replace(/--.*/, "");

  // 去除图片地址
  // input = input.replace(/\bhttps?:\/\/\S+/gi, "");
  input = input.replace(/\//g, "");

  // 使用正则表达式保留英文、中文和常用标点符号
  input = input.replace(
    /[^\u0020-\u007E\uFF00-\uFFEF\u3000-\u303F\uFF00-\uFFEF\u2000-\u206F]+/g,
    ""
  );

  return input;
}

export async function generateFinalPrompt(
  values: ImageFormData,
  useStyleRow: boolean,
  useTile: boolean,
  imageUrls: string[],
  srefUrl: string,
  customASW: number,
  customASH: number,
  stylesList: string[]
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
    stop,
    weird,
    imageWeight,
  } = values;

  const handledNegativePrompt =
    " --no " +
    negativePrompt
      ?.replace(/[^a-zA-Z,]+/g, "")
      .replace(/,{2,}/g, ",")
      .replace(/^,|,$/g, "")
      .trim();

  const finalPromptArray = [];

  imageUrls.map((url) => {
    if (url != "") {
      finalPromptArray.push(url + " ");
    }
  });

  let handledPrompt = cleanInput(prompt);

  const response = await axios.post(
    "https://api.midjourneyapi.xyz/mj/v2/validation",
    { prompt: handledPrompt }
  );

  if (response.data.ErrorMessage !== "") {
    toast.error(response.data.ErrorMessage, { duration: 3500 });
    return;
  }

  finalPromptArray.push(handledPrompt);

  if (stylesList.length > 0) {
    stylesList.map((style) => finalPromptArray.push(`, ${style}`));
  }

  if (useStyleRow) {
    finalPromptArray.push(" --style raw");
  }
  if (useTile) {
    finalPromptArray.push(" --tile");
  }

  if (handledNegativePrompt !== " --no ") {
    finalPromptArray.push(handledNegativePrompt);
  }

  if (aspectRatio !== " ") {
    finalPromptArray.push(aspectRatio);
  } else {
    finalPromptArray.push(` --ar ${customASW + ":" + customASH}`);
  }

  const newIw = handleIw(imageWeight);

  finalPromptArray.push(
    quality,
    ` --stylize ${stylize}`,
    ` --chaos ${chaos}`,
    ` --w ${weird}`,
    ` --stop ${stop}`,
    ` --iw ${newIw}`,
    model
  );

  if (srefUrl !== "") {
    finalPromptArray.push(` --sref ${srefUrl}`);
  }

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

export async function imageUrlToBase64(imageUrl: string) {
  try {
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });

    if (!response.data) {
      throw new Error("No image data received");
    }

    const base64Data = Buffer.from(response.data, "binary").toString("base64");
    return `data:image/jpeg;base64,${base64Data}`;
  } catch (error) {
    console.error("Error converting image to base64:", error);
    throw error;
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
      case "v":
      case "niji":
        options.Version = `${key} ${value}`;
        break;
      default:
        break;
    }
  });

  return options;
}

export async function cropImageIntoFour(imageUrl: string): Promise<string[]> {
  return new Promise<string[]>((resolve, reject) => {
    // 创建一个 Image 元素
    const img = new Image();
    img.crossOrigin = "Anonymous"; // 设置跨域请求
    img.src = imageUrl;

    // 在图片加载完成后执行裁剪操作
    img.onload = function () {
      const fullWidth = img.width;
      const fullHeight = img.height;

      // 计算裁剪后每张图片的尺寸
      const croppedWidth = fullWidth / 2;
      const croppedHeight = fullHeight / 2;

      // 创建一个 Canvas 元素
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (ctx) {
        canvas.width = croppedWidth;
        canvas.height = croppedHeight;

        const imagesBase64: string[] = [];

        // 循环裁剪四张图片
        for (let i = 0; i < 2; i++) {
          for (let j = 0; j < 2; j++) {
            const startX = j * croppedWidth;
            const startY = i * croppedHeight;

            // 在 Canvas 上绘制裁剪后的图片
            ctx.drawImage(
              img,
              startX,
              startY,
              croppedWidth,
              croppedHeight,
              0,
              0,
              croppedWidth,
              croppedHeight
            );

            // 将 Canvas 转换为 base64 格式的图片数据并存储到数组中
            const croppedImageBase64 = canvas.toDataURL();
            imagesBase64.push(croppedImageBase64);
          }
        }

        // 返回裁剪后的图片数据数组
        resolve(imagesBase64);
      } else {
        reject(new Error("Canvas context is not supported"));
      }
    };

    // 图片加载失败时的错误处理
    img.onerror = function (error) {
      reject(new Error("Failed to load image: " + error));
    };
  });
}

export const handleDownloadBase64 = (base64Data: string, index: number) => {
  try {
    // 将 base64 数据转换为 Blob 对象
    const blob = base64toBlob(base64Data);

    // 创建 blob 对象的 URL
    const blobUrl = URL.createObjectURL(blob);

    // 创建一个 <a> 元素并设置下载属性
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `midjourney${index}.png`;

    // 将 <a> 元素添加到文档中，模拟点击下载
    document.body.appendChild(link);
    link.click();

    // 清理
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    toast.error("服务器繁忙，请稍后重试");
    console.error("Error downloading image:", error);
  }
};

export const handleDownloadBase64s = (base64Datas: string[]) => {
  try {
    base64Datas.forEach((base64Data, index) => {
      // 将 base64 数据转换为 Blob 对象
      const blob = base64toBlob(base64Data);

      // 创建 blob 对象的 URL
      const blobUrl = URL.createObjectURL(blob);

      // 创建一个 <a> 元素并设置下载属性
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `midjourney${index}.png`;

      // 将 <a> 元素添加到文档中，模拟点击下载
      document.body.appendChild(link);
      link.click();

      // 清理
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    });
  } catch (error) {
    toast.error("服务器繁忙，请稍后重试");
    console.error("Error downloading image:", error);
  }
};

// 辅助函数：将 base64 数据转换为 Blob 对象
function base64toBlob(base64Data: string): Blob {
  const byteString = atob(base64Data.split(",")[1]);
  const mimeString = base64Data.split(",")[0].split(":")[1].split(";")[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}

export function getRandomPrompt(prompts: string[]): string {
  // 生成一个介于 0 到 prompts.length - 1 之间的随机整数
  const randomIndex: number = Math.floor(Math.random() * prompts.length);
  // 返回随机选择的 prompt
  return prompts[randomIndex];
}

export function convertTimestampToDateTime(timestamp: number) {
  // 如果时间戳是以毫秒为单位的，请将其转换为秒
  if (timestamp.toString().length > 10) {
    timestamp = Math.floor(timestamp / 1000);
  }

  // 创建一个新的 Date 对象，将时间戳作为参数传递给构造函数
  let date = new Date(timestamp * 1000);

  return date;
}

export const getUserCredits = async (email: string) => {
  const supabase = supabaseCli();
  const res = await supabase
    .from("infinityai_352020833zsx_users")
    .select()
    .eq("email", email);
  const realData: UserData = res.data && res.data[0];
  return realData.infinityai_user_credits;
};

export const updateUserCredits = async (
  infinityai_user_credits: number,
  email: string,
) => {
  const supabase = supabaseCli();
  try {
    const res = await supabase
      .from("infinityai_352020833zsx_users")
      .update({
        infinityai_user_credits: infinityai_user_credits,
      })
      .eq("email", email)
      .select();

    return res;
  } catch (error) {
    console.log(error);
  }
};

export const createUser = async (user: UserData) => {
  const supabase = supabaseCli();

  const createTime = convertTimestampToDateTime(user.created_at);

  const res = await supabase.from("infinityai_352020833zsx_users").insert([
    {
      created_at: createTime,
      email: user.email,
      subscription_type: "free",
      infinityai_user_credits: user.infinityai_user_credits,
      user_id: user.user_id,
    },
  ]);

  return res;
};

export function generateOrderNumber() {
  const prefix = "infinity";
  const timestamp = Date.now(); // 获取当前时间戳
  const randomDigits = Math.floor(Math.random() * 1000000); // 生成一个 0 到 999999 之间的随机数
  const orderNumber = `${prefix}${timestamp}${randomDigits
    .toString()
    .padStart(3, "0")}`; // 将时间戳和随机数填充到 6 位数并与前缀拼接
  return orderNumber;
}

interface PayParams {
  [key: string]: string;
}

export function wxPaySign(params: PayParams, key: string) {
  const paramsArr = Object.keys(params);
  paramsArr.sort();
  const stringArr = [];
  paramsArr.map((key) => {
    stringArr.push(key + "=" + params[key]);
  });
  // 最后加上商户Key
  stringArr.push("key=" + key);
  const string = stringArr.join("&");
  return md5(string).toString().toUpperCase();
}
