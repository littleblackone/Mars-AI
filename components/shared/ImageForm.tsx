"use client";
import { ChangeEvent, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageValidation } from "../../lib/validations";
import {
  ArrowLeftIcon,
  CopyIcon,
  EnterFullScreenIcon,
  GearIcon,
  InfoCircledIcon,
  MagicWandIcon,
  MinusIcon,
  Pencil2Icon,
  PlusIcon,
} from "@radix-ui/react-icons";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import * as z from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  convertStringToArray,
  cropImageIntoFour,
  debounce,
  generateFinalPrompt,
  getRandomPrompt,
  getUserCredits,
  handleCopy,
  handleDownloadBase64,
  handleGetSeed,
  updateUserCredits,
} from "@/lib/utils";
import axios from "axios";
import { ImageFormData, FetchImageData } from "@/lib/interface/ImageData";
import { randomPrompts, styleTags } from "@/lib/constant";

import { Button } from "../ui/button";

import { Slider } from "../ui/slider";
import { Input } from "../ui/input";
import {
  DownloadIcon,
  Lightbulb,
  TagsIcon,
  UploadCloudIcon,
  X,
} from "lucide-react";
import { Separator } from "../ui/separator";
import { FileUploader } from "react-drag-drop-files";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { ImageFullView } from "./ImageFullView";
import { toast } from "sonner";
import { useOriginImage } from "@/lib/store/ImagesList/useOriginImage";
import { useVaryImage } from "@/lib/store/ImagesList/useVaryImage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

import VaryRegion from "./VaryRegion";
import { useIsInpainting } from "@/lib/store/useisInpainting";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import Link from "next/link";
import HistoryImage from "./HistoryImage";
import { useBlendImages } from "@/lib/store/ImagesList/useBlendImages";
import FullViewImg from "./FullViewImg";
import { useFullViewImage } from "@/lib/store/useFullViewImage";
import { Textarea } from "../ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { UserButton, useAuth } from "@clerk/nextjs";
import { useCredits } from "@/lib/store/useCredits";

export const ImageForm = ({ email }: { email: string }) => {
  const [fetchTime, setFetchTime] = useState<number>(0);
  const [isFetching, setIsFetching] = useState(false);
  const [imageArr, setImageArr] = useState<string[]>([]);
  const [taskId, setTaskId] = useState<string>("");
  const [seed, setSeed] = useState<string>("");
  const [tempFormValue, setTempFormValue] = useState<ImageFormData>();
  const [finalPrompt, setFinalPrompt] = useState<string>();
  const [open, setOpen] = useState(false);
  const [varyRegionOpen, setVaryRegionOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const [describeImageUrl, setDescribeImageUrl] = useState<string>("");
  const [generatePrompts, setGeneratePrompts] = useState<string[]>([
    "",
    "",
    "",
    "",
  ]);
  const [selectImageFile, setSelectImageFile] = useState<File>();
  const [uploadImg, setUploadImg] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [blendImages, setBlendImages] = useState<File[]>([]);
  const [blendOrgins, setBlendOrgins] = useState<
    { name: string; src: string }[]
  >([]);
  const [isBlending, setIsBlending] = useState<boolean>(false);
  const [canBlend, setCanBlend] = useState(true);

  const [dimension, setDimension] = useState("square");

  const [useTile, setUseTile] = useState(false);
  const [useTurbo, setUseTurbo] = useState(false);
  const [useStyleRow, setUseStyleRow] = useState(false);

  const [isDescribe, setIsDescribe] = useState(false);

  const [imgPromptUrls, setImgPromptUrls] = useState([""]);
  const [sreftUrl, setSrefUrl] = useState("");
  const [asRatio, setAsRatio] = useState("");
  const [customAs, setCustomAs] = useState(false);
  const [customASW, setCustomASW] = useState(1);
  const [customASH, setCustomASH] = useState(1);

  const [useDefaultModel, setUseDefaultModel] = useState(true);
  const [model, setModel] = useState(" --v 5.2");
  const [stylesList, setStylesList] = useState<string[]>([])

  const fileTypes = ["png", "jpg", "jpeg", "webp"];
  let uploadImages: string[] = [];
  const IMGBB_KEY = "bf349c2c6056943bee6bc4a507958c22";

  const setOriginImages = useOriginImage((state) => state.setImages);
  const setOriginPrompts = useOriginImage((state) => state.setPrompts);
  const setVaryImages = useVaryImage((state) => state.setImages);
  const setVaryPrompts = useVaryImage((state) => state.setPrompts);
  const setHistoryBlendImgs = useBlendImages((state) => state.setImages);

  const isInpainting = useIsInpainting((state) => state.isInpainting);

  const fullImgIndex = useFullViewImage((state) => state.index);
  const fullImgOpen = useFullViewImage((state) => state.open);
  const fullImgImgUrl = useFullViewImage((state) => state.imgUrl);
  const fullImgListName = useFullViewImage((state) => state.imgListName);
  const setFullImgOpen = useFullViewImage((state) => state.setOpen);

  const { getToken } = useAuth()
  const setCredits = useCredits(state => state.setCredits)

  const styleInList = (value: string): boolean => {
    return stylesList.includes(value);
  };


  // 添加输入框
  const handleAddInput = () => {
    if (imgPromptUrls.length < 5) {
      setImgPromptUrls([...imgPromptUrls, ""]);
    }
  };

  // 删除输入框
  const handleRemoveInput = (indexToRemove: number) => {
    setImgPromptUrls(
      imgPromptUrls.filter((_, index) => index !== indexToRemove)
    );
  };

  // 处理输入框变化
  const handleInputChange = (index: number, value: string) => {
    const newImageUrls = [...imgPromptUrls];
    newImageUrls[index] = value;
    setImgPromptUrls(newImageUrls);
  };

  // 处理输入框失焦事件
  const handleInputBlur = async (index: number, type: string) => {
    if (type === "imageUrls" && index !== -1) {
      const url = imgPromptUrls[index];
      const canAccessImg = await isUrlAccessibleImgPrompt(url);
      if (!isValidImageUrl(url) || canAccessImg === false) {
        toast.error(`Image Urls ${index + 1} 格式错误或图片地址不存在`, {
          duration: 3500,
        });
        const newImageUrls = [...imgPromptUrls];
        newImageUrls[index] = ""; // 清空输入框
        setImgPromptUrls(newImageUrls);
      }
    }
    if (type === "srefUrls") {
      const canAccessImg = await isUrlAccessibleImgPrompt(sreftUrl);
      if (!isValidImageUrl(sreftUrl) || canAccessImg === false) {
        toast.error(`Style references Images Url 格式错误或图片地址不存在`, {
          duration: 3500,
        });
        setSrefUrl(""); // 清空输入框
      }
    }
  };

  const isUrlAccessibleImgPrompt = async (url: string) => {
    try {
      const response = await fetch(url, { method: "HEAD" });
      return response.ok;
    } catch (error) {
      console.error("Error checking URL accessibility:", error);
      return false;
    }
  };

  //检查图片地址是否能正常访问
  const isUrlAccessible = async (url: string) => {
    try {
      const isWebp = url.endsWith(".webp");

      if (isWebp) {
        toast.error("不支持webp结尾的图片,请下载后本地上传。", {
          duration: 3500,
        });
        return false;
      }
      const response = await fetch(url, { method: "HEAD" });
      if (response.ok === false) {
        toast.error("图片地址无法访问", {
          duration: 3500,
        });
      }
      return response.ok;
    } catch (error) {
      console.error("Error checking URL accessibility:", error);
      return false;
    }
  };

  // 检查URL格式是否有效
  const isValidImageUrl = (url: string) => {
    if (url === "") return true;
    // const regex = /^https:\/\/.*\.(png|jpg|jpeg|webp)$/i;
    const regex =
      /^https:\/\/(?:[\w-]+\.)+[\w-]+(?:\/[\w-./?%&=]*)?(?:\.png|\.jpg|\.jpeg|\.webp)$/i;
    return regex.test(url);
  };

  const handleSelectImagUrl = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file.type.includes("image")) return;
      setSelectImageFile(file);
    }
  };

  const handleUploadImage = async () => {
    try {
      setIsUploading(true);
      if (selectImageFile) {
        const formData = new FormData();
        formData.append("image", selectImageFile);

        const response = await axios.post(
          "https://api.imgbb.com/1/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            params: {
              key: IMGBB_KEY,
            },
          }
        );

        if (response.data.success) {
          toast.success("上传成功");
          setIsUploading(false);
          setDescribeImageUrl(response.data.data.url);
          setUploadImg(response.data.data.url);
          await handleDescribe(response.data.data.url);
        }
      }
    } catch (error) {
      toast.error("上传失败，请检查文件格式或重新上传");
      console.error("Error upload image:", error);
    }
  };

  const handleUploadImages = async (images: File[]) => {
    try {
      const uploadPromises = images.map(async (img) => {
        const formData = new FormData();
        formData.append("image", img);

        const response = await axios.post(
          "https://api.imgbb.com/1/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            params: {
              key: IMGBB_KEY,
            },
          }
        );
        return response.data;
      });

      const results = await Promise.all(uploadPromises);

      results.map((res) => {
        uploadImages.push(res.data.url);
      });
      const allSuccess = results.every((res) => res.data.success === true);
      if (allSuccess) {
        toast.success("上传成功");
      }
    } catch (error) {
      toast.error("上传失败，请检查文件格式或重新上传");

      console.error("Error upload image:", error);
    }
  };

  const handleBlend = async () => {
    try {
      const token = await getToken({ template: 'supabase' })
      if (useDefaultModel) {
        if (useTurbo) {
          const infinityai_user_credits = await getUserCredits(email, token!)
          setCredits(infinityai_user_credits)
          if (infinityai_user_credits - 15 < 0) {
            toast.warning("积分余额不足")
            return;
          }
          await updateUserCredits(infinityai_user_credits - 15, email, token!)
          setCredits(infinityai_user_credits - 15)
        } else {
          const infinityai_user_credits = await getUserCredits(email, token!)
          setCredits(infinityai_user_credits)
          if (infinityai_user_credits - 10 < 0) {
            toast.warning("积分余额不足")
            return;
          }
          await updateUserCredits(infinityai_user_credits - 10, email, token!)
          setCredits(infinityai_user_credits - 10)
        }

      } else {
        const infinityai_user_credits = await getUserCredits(email, token!)
        await updateUserCredits(infinityai_user_credits - 15, email, token!)
      }

      setIsBlending(true);
      await handleUploadImages(blendImages);
      let time = 0;
      const response = await axios.post("/api/blend", {
        imageUrls: uploadImages,
        dimension,
        useTurbo,
      });


      const newTaskId = response.data.task_id;

      const intervalId = setInterval(async () => {
        const taskResult: FetchImageData = await axios.post("/api/fetchImage", {
          taskId: newTaskId,
        });

        time += 1;
        if (time >= 180) {
          clearInterval(intervalId);
          setIsBlending(false);
          toast.error("请求超时,请查看midjourney服务器状态后重试");
        }

        if (taskResult.data.status === "finished") {
          clearInterval(intervalId);
          uploadImages = [];
          const bast64ImgArr = await cropImageIntoFour(
            taskResult.data.task_result.image_url
          );

          setImageArr(bast64ImgArr);
          setHistoryBlendImgs(bast64ImgArr);
          setIsBlending(false);
          toast.success("blend成功! 如需对blend图片进行操作,请到文生图区域。", {
            duration: 2500,
          });
        }
      }, 1000);
    } catch (error) {
      toast.error("请求失败，请查看图片地址格式是否正确");
      setIsBlending(false);
      console.error("Error handle describe:", error);
    }
  };

  const handleDescribe = async (imageUrl: string) => {
    try {
      const token = await getToken({ template: 'supabase' })
      const infinityai_user_credits = await getUserCredits(email, token!)
      setCredits(infinityai_user_credits)
      if (infinityai_user_credits - 1 < 0) {
        toast.warning("积分余额不足")
        return;
      }
      await updateUserCredits(infinityai_user_credits - 1, email, token!)
      setCredits(infinityai_user_credits - 1)
      setIsDescribe(true);
      let time = 0;

      if (selectImageFile === undefined) {
        const canAccess = await isUrlAccessible(imageUrl);
        if (canAccess === false) {
          setIsDescribe(false);
          return;
        }
      }


      const response = await axios.post("/api/describe", {
        imageUrl,
        useTurbo,
      });

      const newTaskId = response.data.task_id;

      const intervalId = setInterval(async () => {
        const taskResult: FetchImageData = await axios.post("/api/fetchImage", {
          taskId: newTaskId,
        });

        time += 1;
        if (time >= 60) {
          clearInterval(intervalId);
          setIsDescribe(false);
          toast.error("请求超时,请查看midjourney服务器状态后重试");
        }

        if (taskResult.data.status === "finished") {
          clearInterval(intervalId);
          toast.success("prompt获取成功");
          const prompts = taskResult.data.task_result.message;
          const promptStringArray = convertStringToArray(prompts);
          setGeneratePrompts(promptStringArray);
          setIsDescribe(false);
        }
      }, 1000);

    } catch (error) {
      toast.error("请求失败，请查看图片地址格式是否正确");
      setIsDescribe(false);
      console.error("Error handle describe:", error);
    }
  };

  const handleVaryStrong = async (originTaskId: string, index: string) => {
    try {
      const token = await getToken({ template: 'supabase' })
      if (useDefaultModel) {
        const infinityai_user_credits = await getUserCredits(email, token!)
        setCredits(infinityai_user_credits)
        if (infinityai_user_credits - 10 < 0) {
          toast.warning("积分余额不足")
          return;
        }
        await updateUserCredits(infinityai_user_credits - 10, email, token!)
        setCredits(infinityai_user_credits - 10)
      } else {
        const infinityai_user_credits = await getUserCredits(email, token!)
        setCredits(infinityai_user_credits)
        if (infinityai_user_credits - 15 < 0) {
          toast.warning("积分余额不足")
          return;
        }
        await updateUserCredits(infinityai_user_credits - 15, email, token!)
        setCredits(infinityai_user_credits - 15)
      }

      setImageArr([]);
      setIsFetching(true);
      const response = await axios.post("/api/vary", { originTaskId, index });
      const newTaskId = response.data.task_id;

      const intervalId = setInterval(async () => {
        try {
          const taskResult: FetchImageData = await axios.post(
            "/api/fetchImage",
            {
              taskId: newTaskId,
            }
          );

          setFetchTime((prev) => prev + 1);
          if (fetchTime >= 180) {
            clearInterval(intervalId);
            setIsFetching(false);
            toast.error("请求超时,请查看midjourney服务器状态后重试");
          }

          if (taskResult.data.status === "finished") {
            clearInterval(intervalId);

            const bast64ImgArr = await cropImageIntoFour(
              taskResult.data.task_result.image_url
            );
            const prompt = taskResult.data.meta.task_param.prompt;
            setVaryPrompts(prompt);
            setImageArr(bast64ImgArr);
            setVaryImages(bast64ImgArr);
            setTaskId(taskResult.data.task_id);
            await handleGetSeed(taskResult.data.task_id, setSeed);
            setIsFetching(false);
          }
        } catch (error) {
          console.error("Error fetching image:", error);
        }
      }, 1000);
    } catch (error) {
      toast.error("请求失败,请查看midjourney服务器状态或过一段时间重试");
      setIsFetching(false);
      console.error("Error vary(strong) image:", error);
    }
  };

  const handleVarySubtle = async (originTaskId: string, index: string) => {
    try {
      const token = await getToken({ template: 'supabase' })
      if (useDefaultModel) {
        const infinityai_user_credits = await getUserCredits(email, token!)
        setCredits(infinityai_user_credits)
        if (infinityai_user_credits - 11 < 0) {
          toast.warning("积分余额不足")
          return;
        }
        await updateUserCredits(infinityai_user_credits - 11, email, token!)
        setCredits(infinityai_user_credits - 11)
      } else {
        const infinityai_user_credits = await getUserCredits(email, token!)
        setCredits(infinityai_user_credits)
        if (infinityai_user_credits - 16 < 0) {
          toast.warning("积分余额不足")
          return;
        }
        await updateUserCredits(infinityai_user_credits - 16, email, token!)
        setCredits(infinityai_user_credits - 16)
      }
      setImageArr([]);
      setIsFetching(true);
      let varySubId: string = "";
      let isFirstIntervalCompleted: boolean = false;

      const response = await axios.post("/api/upscale", {
        originTaskId,
        index,
      });

      const taskId = response.data.task_id;

      const upscaleIntervalId = setInterval(async () => {
        try {
          const taskResult: FetchImageData = await axios.post(
            "/api/fetchImage",
            {
              taskId,
            }
          );

          if (taskResult.data.status === "finished") {
            clearInterval(upscaleIntervalId);
            isFirstIntervalCompleted = true;
            const response: FetchImageData = await axios.post("/api/vary", {
              originTaskId: taskId,
              index: "low_variation",
            });
            varySubId = response.data.task_id;
          }
        } catch (error) {
          console.error("Error", error);
        }
      }, 1000);

      const intervalId = setInterval(async () => {
        try {
          if (isFirstIntervalCompleted === false || varySubId === "") return;

          const taskResult: FetchImageData = await axios.post(
            "/api/fetchImage",
            {
              taskId: varySubId,
            }
          );

          setFetchTime((prev) => prev + 1);

          if (fetchTime >= 180) {
            clearInterval(intervalId);
            setIsFetching(false);
            toast.error("请求超时,请查看midjourney服务器状态后重试");
          }

          if (taskResult.data.status === "finished") {
            clearInterval(intervalId);
            const bast64ImgArr = await cropImageIntoFour(
              taskResult.data.task_result.image_url
            );
            const prompt = taskResult.data.meta.task_param.prompt;
            setVaryPrompts(prompt);
            setImageArr(bast64ImgArr);
            setVaryImages(bast64ImgArr);
            setTaskId(taskResult.data.task_id);
            await handleGetSeed(taskResult.data.task_id, setSeed);
            setIsFetching(false);
          }
        } catch (error) {
          console.error("Error fetch image:", error);
        }
      }, 1000);
    } catch (error) {
      toast.error("请求失败,请查看midjourney服务器状态或过一段时间重试");
      setIsFetching(false);
      console.error("Error vary(subtle) image:", error);
    }
  };

  const handleGenerateImage = async (prompt: string) => {
    try {
      const token = await getToken({ template: 'supabase' })
      if (useDefaultModel) {
        if (useTurbo) {
          const infinityai_user_credits = await getUserCredits(email, token!)
          setCredits(infinityai_user_credits)
          if (infinityai_user_credits - 15 < 0) {
            toast.warning("积分余额不足")
            return;
          }
          await updateUserCredits(infinityai_user_credits - 15, email, token!)
          setCredits(infinityai_user_credits - 15)
        } else {

          const infinityai_user_credits = await getUserCredits(email, token!)
          setCredits(infinityai_user_credits)
          console.log(infinityai_user_credits);
          if (infinityai_user_credits - 10 < 0) {
            toast.warning("积分余额不足")
            return;
          }
          const res = await updateUserCredits(infinityai_user_credits - 10, email, token!)
          setCredits(infinityai_user_credits - 10)
          console.log(res);

        }

      } else {
        const infinityai_user_credits = await getUserCredits(email, token!)
        setCredits(infinityai_user_credits)
        if (infinityai_user_credits - 15 < 0) {
          toast.warning("积分余额不足")
          return;
        }
        await updateUserCredits(infinityai_user_credits - 15, email, token!)
        setCredits(infinityai_user_credits - 15)
      }

      setIsFetching(true);
      const response = await axios.post("/api/imagine", {
        prompt,
        useTurbo,
      });
      const taskId = response.data.task_id;
      setTaskId(taskId);

      const intervalId = setInterval(async () => {
        try {
          const taskResult: FetchImageData = await axios.post(
            "/api/fetchImage",
            { taskId }
          );

          setFetchTime((prev) => prev + 1);

          if (fetchTime >= 180) {
            clearInterval(intervalId);
            setIsFetching(false);
            toast.error("请求超时,请查看midjourney服务器状态后重试");
          }

          if (taskResult.data.task_result.error_messages.length > 0) {
            clearInterval(intervalId);
            setIsFetching(false);
            console.error(
              "Error imagine:",
              taskResult.data.task_result.error_messages[0]
            );
            toast.error(taskResult.data.task_result.error_messages[0], {
              duration: 5000,
            });
          }

          if (taskResult.data.status === "finished") {
            clearInterval(intervalId);
            console.log(taskResult.data.task_result.image_url);

            const bast64ImgArr = await cropImageIntoFour(
              taskResult.data.task_result.image_url
            );

            const prompt = taskResult.data.meta.task_param.prompt;
            setOriginPrompts(prompt);
            setImageArr(bast64ImgArr);

            setOriginImages(bast64ImgArr);

            setIsFetching(false);
            await handleGetSeed(taskId, setSeed);
          }
        } catch (error) {
          console.error("Error fetching image:", error);
          setIsFetching(false);
        }
      }, 1000);
    } catch (error) {
      console.log(error);

      toast.error(
        "请求失败,请检查prompt格式或查看midjourney服务器状态并过一段时间重试",
        { duration: 5000 }
      );
      setIsFetching(false);
      console.error("Error sending prompt:", error);
    }
  }


  const form = useForm<z.infer<typeof ImageValidation>>({
    resolver: zodResolver(ImageValidation),
    defaultValues: {
      prompt: "",
      negativePrompt: "",
      seeds: 0,
      quality: " --q 1",
      chaos: 0,
      aspectRatio: " --ar 1:1",
      model: " --v 5.2",
      stylize: 100,
      imageWeight: 1,
      stop: 100,
      weird: 0,
    },
  });


  useEffect(() => {
    if (model === " --v 5.2") {
      setUseDefaultModel(true);
    } else {
      setUseDefaultModel(false);
      setUseTurbo(false);
    }
  }, [model]);

  useEffect(() => {
    if (asRatio === " ") {
      setCustomAs(true);
    } else {
      setCustomAs(false);
    }
  }, [asRatio]);

  useEffect(() => {
    if (blendImages.length >= 2 && blendImages.length <= 5) {
      setCanBlend(true);
    } else {
      setCanBlend(false);
    }
    if (blendImages.length > 0) {
      const updatedBlendOrgins: { name: string; src: string }[] = [];

      blendImages.map((image) => {
        const fileReader = new FileReader();
        fileReader.onload = (event) => {
          const src = event.target?.result as string;

          updatedBlendOrgins.push({ name: image.name, src });
          setBlendOrgins([...updatedBlendOrgins]);
        };
        fileReader.readAsDataURL(image);
      });
    }
  }, [blendImages]);

  useEffect(() => {
    if (useTurbo) {
      toast.success("turbo模式开启");
    }
  }, [useTurbo]);

  useEffect(() => {
    console.log(fetchTime);

  }, [fetchTime])


  const onSubmit = async (values: z.infer<typeof ImageValidation>) => {
    if (customASW / customASH < 0.5 || customASW / customASH > 2) {
      toast.error("请输入合理比例的AspectRatio(0.5-2)", { duration: 3500 });
      return;
    }
    setImageArr([]);
    setFetchTime(0);
    setTempFormValue(values);
    console.log(values);

    const finalPrompt = await generateFinalPrompt(
      values,
      useStyleRow,
      useTile,
      imgPromptUrls,
      sreftUrl,
      customASW,
      customASH,
      stylesList
    );
    console.log(finalPrompt);
    setFinalPrompt(finalPrompt);
    debounce(() => handleGenerateImage(finalPrompt), 1000)();
  };

  return (
    <>
      <FullViewImg
        index={fullImgIndex}
        open={fullImgOpen}
        imgUrl={fullImgImgUrl}
        imgListName={fullImgListName}
        setOpen={setFullImgOpen}
      ></FullViewImg>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className=" w-full relative h-full">
          <div className=" h-[5vh] w-full bg-white border-b flex p-2 px-[1.4rem] items-center">
            <Link
              href="/"
              className=" w-fit active:translate-y-[1px] h-[30px] bg-gray-100 rounded-md hover:bg-gray-200 transition-all duration-200 p-2 flex-center"
            >
              <ArrowLeftIcon width={20} height={20}></ArrowLeftIcon>
              <span>返回</span>
            </Link>

            <div className="ml-auto gap-2 items-center flex">
              {/* <UserCreditsServer email={email}></UserCreditsServer> */}
              <UserButton afterSignOutUrl="/"></UserButton>
              {/* <SignOutButton ></SignOutButton>
              {/* <Sparkle width={15} height={15}></Sparkle> */}
            </div>
          </div>
          <div className=" flex items-center flex-1  w-full h-[95vh]">
            <div className="overflow-y-scroll styled-scrollbar  flex-shrink-0 w-fit px-6 py-4 h-full flex flex-col gap-4 items-start">
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between w-[200px]">
                    <div className=" flex gap-2 items-center">
                      <FormLabel className=" text-neutral-800 text-nowrap text-sm">
                        Models:
                      </FormLabel>
                      <HoverCard openDelay={300}>
                        <HoverCardTrigger>
                          <InfoCircledIcon className=" cursor-pointer hover:stroke-black/20"></InfoCircledIcon>
                        </HoverCardTrigger>
                        <HoverCardContent>
                          <p className="text-white text-sm">
                            命令: --v 5.2<br></br>
                            midjourney模型,目前提供v5.2, v6, niji 6 这3个模型,
                            niji 6 用于生成动漫风格图片,默认为
                            v5.2。如果你想使用其他模型,可以自己在prompt中添加命令,详情查看
                            <Link
                              target="_blank"
                              rel="stylesheet"
                              className=" text-blue-500 underline underline-offset-4"
                              href="https://docs.midjourney.com/docs/model-versions"
                            >
                              官方文档
                            </Link>
                          </p>
                        </HoverCardContent>
                      </HoverCard>
                    </div>

                    <div className=" -translate-y-[3px]">
                      <Select
                        onValueChange={(value) => {
                          setModel(value);

                          field.onChange(value);
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className=" bg-gray-100 border-none py-1 px-2 h-8 focus:ring-offset-transparent focus:ring-transparent">
                            <SelectValue placeholder="模型"></SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className=" focus:ring-transparent">
                          <SelectItem value=" --v 5.2">v5.2</SelectItem>
                          <SelectItem value=" --v 6">v6</SelectItem>
                          <SelectItem value=" --niji 6">niji 6</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </FormItem>
                )}
              ></FormField>

              <Separator className=" w-full" />

              <FormField
                control={form.control}
                name="aspectRatio"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center justify-between  w-[200px]">
                    <div className=" flex justify-between items-center w-full">
                      <div className=" flex gap-2 items-center">
                        <FormLabel className="text-neutral-800 text-nowrap text-sm">
                          AspectRatio:
                        </FormLabel>

                        <HoverCard openDelay={300}>
                          <HoverCardTrigger>
                            <InfoCircledIcon className=" cursor-pointer hover:stroke-black/20"></InfoCircledIcon>
                          </HoverCardTrigger>
                          <HoverCardContent>
                            <p className="text-white text-sm">
                              命令: --aspect 或 --ar<br></br>
                              生成图片的宽高比,默认为1:1,如果你想自定义,请选择最后一个选项(限制长宽比在
                              0.5-2 之间)。详情查看
                              <Link
                                target="_blank"
                                rel="stylesheet"
                                className=" text-blue-500 underline underline-offset-4"
                                href="https://docs.midjourney.com/docs/aspect-ratios"
                              >
                                官方文档
                              </Link>
                            </p>
                          </HoverCardContent>
                        </HoverCard>
                      </div>

                      <div className="-translate-y-[3px]">
                        <Select
                          onValueChange={(value) => {
                            setAsRatio(value);
                            field.onChange(value);
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-gray-100 border-none py-1 px-2 h-8 focus:ring-offset-transparent focus:ring-transparent">
                              <SelectValue placeholder="图片比例"></SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value=" --ar 1:1">
                              <div className="flex gap-1 items-center">
                                <div className=" w-4 h-4 border-[1px] rounded-sm border-black"></div>
                                <span>1:1</span>
                              </div>
                            </SelectItem>
                            <SelectItem value=" --ar 4:3">
                              <div className="flex gap-1 items-center">
                                <div className=" w-4 h-[12px] border-[1px] rounded-sm border-black"></div>
                                <span>4:3</span>
                              </div>
                            </SelectItem>
                            <SelectItem value=" --ar 3:2">
                              <div className="flex gap-1 items-center">
                                <div className=" w-4 h-[10.6px] border-[1px] rounded-sm border-black"></div>
                                <span>3:2</span>
                              </div>
                            </SelectItem>
                            <SelectItem value=" --ar 16:9">
                              <div className="flex gap-1 items-center">
                                <div className=" w-4 h-[9px] border-[1px] rounded-sm border-black"></div>
                                <span>16:9</span>
                              </div>
                            </SelectItem>
                            <SelectItem value=" --ar 9:16">
                              <div className="flex gap-1 items-center">
                                <div className=" ml-1 mr-1.5 w-[9px] h-[16px] border-[1px] rounded-sm border-black"></div>
                                <span>9:16</span>
                              </div>
                            </SelectItem>
                            <SelectItem value=" ">
                              <div className="flex gap-1 items-center">
                                <GearIcon></GearIcon>
                                <span className=" text-xs">自定义</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {customAs && (
                      <div className="flex items-center text-xs text-neutral-800 font-medium justify-between">
                        <div className="flex items-center  gap-1 mr-[1.1rem]">
                          <span className=" text-base font-medium">宽</span>
                          <Input
                            type="number"
                            min={1}
                            value={customASW}
                            onChange={(e) => setCustomASW(+e.target.value)}
                            step={1}
                            className=" w-[60px]"
                          ></Input>
                        </div>

                        <span>:</span>

                        <div className="flex items-center  gap-1 ml-[1rem]">
                          <span className=" text-base font-medium">高</span>
                          <Input
                            type="number"
                            min={1}
                            value={customASH}
                            onChange={(e) => setCustomASH(+e.target.value)}
                            step={1}
                            className=" w-[60px]"
                          ></Input>
                        </div>
                      </div>
                    )}
                  </FormItem>
                )}
              ></FormField>

              <Separator className=" w-full" />
              <FormField
                control={form.control}
                name="quality"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between  w-[200px]">
                    <div className=" flex gap-2 items-center">
                      <FormLabel className="text-neutral-800 text-nowrap text-sm">
                        Quality:
                      </FormLabel>

                      <HoverCard openDelay={300}>
                        <HoverCardTrigger>
                          <InfoCircledIcon className=" cursor-pointer hover:stroke-black/20"></InfoCircledIcon>
                        </HoverCardTrigger>
                        <HoverCardContent>
                          <p className="text-white text-sm">
                            命令: --quality 或 --q<br></br>
                            quality参数会更改生成图像所花费的时间。更高质量的设置需要更长的时间来处理和生成更多的细节,值越高也意味着每个作业使用的GPU分钟数越多,质量设置不会影响分辨率,默认为高质量。
                            <Link
                              target="_blank"
                              rel="stylesheet"
                              className=" text-blue-500 underline underline-offset-4"
                              href="https://docs.midjourney.com/docs/quality"
                            >
                              官方文档
                            </Link>
                          </p>
                        </HoverCardContent>
                      </HoverCard>
                    </div>

                    <div className="-translate-y-[3px]">
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-gray-100 border-none py-1 text-xs px-2 h-8 focus:ring-offset-transparent focus:ring-transparent">
                            <SelectValue placeholder="图片质量"></SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value=" --q .25" className=" text-xs">
                            低质量
                          </SelectItem>
                          <SelectItem value=" --q .5" className=" text-xs">
                            中质量
                          </SelectItem>
                          <SelectItem value=" --q 1" className=" text-xs">
                            高质量
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </FormItem>
                )}
              ></FormField>

              <Separator className=" w-full" />

              <FormField
                control={form.control}
                name="stylize"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-4 ">
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2 items-center">
                        <FormLabel className="text-neutral-800 text-nowrap text-sm">
                          Stylize:
                        </FormLabel>
                        <HoverCard openDelay={300}>
                          <HoverCardTrigger>
                            <InfoCircledIcon className=" cursor-pointer hover:stroke-black/20"></InfoCircledIcon>
                          </HoverCardTrigger>
                          <HoverCardContent>
                            <p className="text-white text-sm">
                              命令: --stylize 或 --s<br></br>
                              风格化程度:默认为100, 范围:
                              0-1000,低风格化值生成的图像与prompt非常匹配,但艺术性较差。
                              高风格化值创建的图像非常艺术,但与prompt的联系较少。详情查看
                              <Link
                                target="_blank"
                                rel="stylesheet"
                                className=" text-blue-500 underline underline-offset-4"
                                href="https://docs.midjourney.com/docs/stylize"
                              >
                                官方文档
                              </Link>
                            </p>
                          </HoverCardContent>
                        </HoverCard>
                      </div>

                      <FormControl>
                        <Input
                          className="bg-gray-100 border-none py-1 px-2 h-8 focus-visible:ring-offset-transparent focus-visible:ring-transparent  p-1 rounded-lg w-[60px] text-center"
                          max={1000}
                          min={0}
                          type="number"
                          value={field.value}
                          onChange={(e) => field.onChange(+e.target.value)}
                        ></Input>
                      </FormControl>
                    </div>

                    <div className="-translate-y-[3px]">
                      <FormControl>
                        <Slider
                          defaultValue={[100]}
                          max={1000}
                          value={[field.value]}
                          step={50}
                          onValueChange={(value) => field.onChange(value[0])}
                          className=" w-[200px] cursor-pointer"
                        ></Slider>
                      </FormControl>
                    </div>
                    <FormMessage></FormMessage>
                  </FormItem>
                )}
              ></FormField>

              <Separator className=" w-full" />

              <FormField
                control={form.control}
                name="chaos"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-4 ">
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2 items-center">
                        <FormLabel className="text-neutral-800 text-nowrap text-sm">
                          Chaos:
                        </FormLabel>
                        <HoverCard openDelay={300}>
                          <HoverCardTrigger>
                            <InfoCircledIcon className=" cursor-pointer hover:stroke-black/20"></InfoCircledIcon>
                          </HoverCardTrigger>
                          <HoverCardContent>
                            <p className="text-white text-sm">
                              命令: --chaos 或 --c<br></br>
                              混乱程度: 默认为0, 范围:
                              0-100,高混乱值将产生更多不寻常和意想不到的结果和构图。
                              较低的混乱值具有更可靠、可重复的结果。详情查看
                              <Link
                                target="_blank"
                                rel="stylesheet"
                                className=" text-blue-500 underline underline-offset-4"
                                href="https://docs.midjourney.com/docs/chaos"
                              >
                                官方文档
                              </Link>
                            </p>
                          </HoverCardContent>
                        </HoverCard>
                      </div>

                      <FormControl>
                        <Input
                          className="bg-gray-100 border-none py-1 px-2 h-8 focus-visible:ring-offset-transparent focus-visible:ring-transparent p-1 rounded-lg w-[60px] text-center"
                          max={100}
                          min={0}
                          type="number"
                          value={field.value}
                          onChange={(e) => field.onChange(+e.target.value)}
                        ></Input>
                      </FormControl>
                    </div>

                    <div className="-translate-y-[3px]">
                      <FormControl>
                        <Slider
                          defaultValue={[100]}
                          max={100}
                          value={[field.value]}
                          step={5}
                          onValueChange={(value) => field.onChange(value[0])}
                          className=" w-[200px] cursor-pointer"
                        ></Slider>
                      </FormControl>
                    </div>
                    <FormMessage></FormMessage>
                  </FormItem>
                )}
              ></FormField>

              <Separator className=" w-full" />

              <Separator className=" w-full" />
              <FormField
                control={form.control}
                name="imageWeight"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <div className=" flex gap-2 items-center">
                        <FormLabel className="text-neutral-800 text-nowrap text-sm">
                          Image Weight:
                        </FormLabel>
                        <HoverCard openDelay={300}>
                          <HoverCardTrigger>
                            <InfoCircledIcon className=" cursor-pointer hover:stroke-black/20"></InfoCircledIcon>
                          </HoverCardTrigger>
                          <HoverCardContent>
                            <p className="text-white text-sm">
                              命令: --iw<br></br>
                              范围:v5.2: 0-2, v6和niji 6: 0-3。当使用image
                              prompt时,此项越高,图片对最终结果的影响权重越高,默认为1。
                              <Link
                                target="_blank"
                                rel="stylesheet"
                                className=" text-blue-500 underline underline-offset-4"
                                href="https://docs.midjourney.com/docs/image-prompts"
                              >
                                官方文档
                              </Link>
                            </p>
                          </HoverCardContent>
                        </HoverCard>
                      </div>
                      <FormControl>
                        <Input
                          className="bg-gray-100 border-none py-1 px-2 h-8 focus-visible:ring-offset-transparent focus-visible:ring-transparent  p-1 rounded-lg w-[60px] text-center"
                          max={useDefaultModel ? 2 : 3}
                          min={0}
                          step={0.1}
                          type="number"
                          value={field.value}
                          onChange={(e) => field.onChange(+e.target.value)}
                        ></Input>
                      </FormControl>
                    </div>

                    <div className="-translate-y-[3px]">
                      <FormControl>
                        <Slider
                          defaultValue={[1]}
                          max={useDefaultModel ? 2 : 3}
                          value={[field.value]}
                          step={0.1}
                          onValueChange={(value) => field.onChange(value[0])}
                          className=" w-[200px] cursor-pointer"
                        ></Slider>
                      </FormControl>
                    </div>
                    <FormMessage></FormMessage>
                  </FormItem>
                )}
              ></FormField>
              <Separator className=" w-full" />
              <FormField
                control={form.control}
                name="stop"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <div className=" flex gap-2 items-center">
                        <FormLabel className="text-neutral-800 text-nowrap text-sm">
                          Stop:
                        </FormLabel>
                        <HoverCard openDelay={300}>
                          <HoverCardTrigger>
                            <InfoCircledIcon className=" cursor-pointer hover:stroke-black/20"></InfoCircledIcon>
                          </HoverCardTrigger>
                          <HoverCardContent>
                            <p className="text-white text-sm">
                              命令: --stop<br></br>
                              范围:10-100, 默认为100,
                              调整此项将提前停止图像的生成,以较早的百分比停止作业可能会产生更模糊、不太详细的结果。
                              <Link
                                target="_blank"
                                rel="stylesheet"
                                className=" text-blue-500 underline underline-offset-4"
                                href="https://docs.midjourney.com/docs/stop"
                              >
                                官方文档
                              </Link>
                            </p>
                          </HoverCardContent>
                        </HoverCard>
                      </div>
                      <FormControl>
                        <Input
                          className="bg-gray-100 border-none py-1 px-2 h-8 focus-visible:ring-offset-transparent focus-visible:ring-transparent  p-1 rounded-lg w-[60px] text-center"
                          max={100}
                          min={10}
                          step={1}
                          type="number"
                          value={field.value}
                          onChange={(e) => field.onChange(+e.target.value)}
                        ></Input>
                      </FormControl>
                    </div>
                    <div className="-translate-y-[3px]">
                      <FormControl>
                        <Slider
                          defaultValue={[10]}
                          max={100}
                          value={[field.value]}
                          step={10}
                          onValueChange={(value) => field.onChange(value[0])}
                          className=" w-[200px] cursor-pointer"
                        ></Slider>
                      </FormControl>
                    </div>
                    <FormMessage></FormMessage>
                  </FormItem>
                )}
              ></FormField>
              <Separator className=" w-full" />
              <FormField
                control={form.control}
                name="weird"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <div className=" flex gap-2 items-center">
                        <FormLabel className="text-neutral-800 text-nowrap text-sm">
                          Weird:
                        </FormLabel>
                        <HoverCard openDelay={300}>
                          <HoverCardTrigger>
                            <InfoCircledIcon className=" cursor-pointer hover:stroke-black/20"></InfoCircledIcon>
                          </HoverCardTrigger>
                          <HoverCardContent>
                            <p className="text-white text-sm">
                              命令: --weird 或 --w<br></br>
                              范围:0-3000, 默认为0,
                              抽象程度,此参数为生成的图像引入了古怪和另类的品质,从而产生独特和意想不到的结果。
                              <Link
                                target="_blank"
                                rel="stylesheet"
                                className=" text-blue-500 underline underline-offset-4"
                                href="https://docs.midjourney.com/docs/weird"
                              >
                                官方文档
                              </Link>
                            </p>
                          </HoverCardContent>
                        </HoverCard>
                      </div>
                      <FormControl>
                        <Input
                          className="bg-gray-100 border-none py-1 px-2 h-8 focus-visible:ring-offset-transparent focus-visible:ring-transparent  p-1 rounded-lg w-[60px] text-center"
                          max={3000}
                          min={0}
                          step={10}
                          type="number"
                          value={field.value}
                          onChange={(e) => field.onChange(+e.target.value)}
                        ></Input>
                      </FormControl>
                    </div>

                    <div className="-translate-y-[3px]">
                      <FormControl>
                        <Slider
                          defaultValue={[0]}
                          max={3000}
                          value={[field.value]}
                          step={100}
                          onValueChange={(value) => field.onChange(value[0])}
                          className=" w-[200px] cursor-pointer"
                        ></Slider>
                      </FormControl>
                    </div>
                    <FormMessage></FormMessage>
                  </FormItem>
                )}
              ></FormField>
              <Separator className=" w-full" />
              <FormField
                control={form.control}
                name="seeds"
                render={({ field }) => (
                  <FormItem className="flex flex-col ">
                    <div className=" flex gap-2 items-center">
                      <FormLabel className="text-neutral-800 text-nowrap text-sm">
                        Seeds:
                      </FormLabel>
                      <HoverCard openDelay={300}>
                        <HoverCardTrigger>
                          <InfoCircledIcon className=" cursor-pointer hover:stroke-black/20"></InfoCircledIcon>
                        </HoverCardTrigger>
                        <HoverCardContent>
                          <p className="text-white text-sm">
                            命令: --seed<br></br>
                            范围:0-4294967295,是为每个图像随机生成的,但可以使用
                            --seed
                            参数指定。如果您使用相同的seed和prompt,您最终将获得相似的图像。
                            <Link
                              target="_blank"
                              rel="stylesheet"
                              className=" text-blue-500 underline underline-offset-4"
                              href="https://docs.midjourney.com/docs/seeds"
                            >
                              官方文档
                            </Link>
                          </p>
                        </HoverCardContent>
                      </HoverCard>
                    </div>

                    <div className="-translate-y-[3px]">
                      <FormControl>
                        <Input
                          className="bg-gray-100 border-none w-[200px] focus-visible:ring-offset-transparent focus-visible:ring-transparent"
                          type="number"
                          min={0}
                          max={4294967295}
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(+e.target.value);
                          }}
                        />
                      </FormControl>
                    </div>
                    <FormMessage></FormMessage>
                  </FormItem>
                )}
              ></FormField>
              <Separator className=" w-full" />
              <FormField
                control={form.control}
                name="negativePrompt"
                render={({ field }) => (
                  <FormItem className="flex flex-col ">
                    <div className=" flex gap-2 items-center">
                      <FormLabel className="text-neutral-800 text-nowrap text-sm">
                        Negative Words:
                      </FormLabel>
                      <HoverCard openDelay={300}>
                        <HoverCardTrigger>
                          <InfoCircledIcon className=" cursor-pointer hover:stroke-black/20"></InfoCircledIcon>
                        </HoverCardTrigger>
                        <HoverCardContent>
                          <p className="text-white text-sm">
                            命令: --no<br></br>
                            不想图片中出现的元素(以逗号分开),比如:床,凳子,书桌
                            详情查看
                            <Link
                              target="_blank"
                              rel="stylesheet"
                              className=" text-blue-500 underline underline-offset-4"
                              href="https://docs.midjourney.com/docs/no"
                            >
                              官方文档
                            </Link>
                          </p>
                        </HoverCardContent>
                      </HoverCard>
                    </div>

                    <div className="">
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-gray-100 border-none w-[90%] resize-none focus-visible:ring-transparent focus-visible:ring-offset-transparent "
                          placeholder="不想出现的元素"
                        ></Input>
                      </FormControl>
                    </div>
                  </FormItem>
                )}
              ></FormField>
              <Separator className=" w-full" />

              <div className="flex flex-col gap-2">
                <div className=" flex gap-2 items-center">
                  <p className="text-neutral-800 font-medium text-nowrap text-sm">
                    Image Urls:
                  </p>
                  <HoverCard openDelay={300}>
                    <HoverCardTrigger>
                      <InfoCircledIcon className=" cursor-pointer hover:stroke-black/20"></InfoCircledIcon>
                    </HoverCardTrigger>
                    <HoverCardContent>
                      <p className="text-white text-sm">
                        Image prompt中的image url,以 png, jpg, jpeg, webp 结尾,
                        在prompt的最前面,
                        您可以添加图像作为prompt的一部分来影响作业的构图、风格和颜色。
                      </p>
                    </HoverCardContent>
                  </HoverCard>
                </div>

                <div className="flex gap-2 flex-col">
                  {imgPromptUrls.map((url, index) => (
                    <div
                      key={index}
                      className=" flex gap-2 w-[212.92px] flex-col items-center"
                    >
                      <Input
                        value={url}
                        onBlur={() => handleInputBlur(index, "imageUrls")}
                        onChange={(e) =>
                          handleInputChange(index, e.target.value)
                        }
                        className="bg-gray-100 border-none text-xs placeholder:text-xs resize-none focus-visible:ring-transparent focus-visible:ring-offset-transparent "
                        placeholder="https://example.com/image.png"
                      ></Input>

                      <div className=" self-end flex gap-2">
                        <Button
                          onClick={() => handleAddInput()}
                          disabled={imgPromptUrls.length === 5}
                          type="button"
                          variant="outline"
                          className=" px-1.5 py-0 h-8"
                        >
                          <PlusIcon width={15} height={15}></PlusIcon>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={imgPromptUrls.length === 1}
                          className=" px-1.5 py-0 h-8"
                          onClick={() => handleRemoveInput(index)}
                        >
                          <MinusIcon width={15} height={15}></MinusIcon>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className=" w-full" />

              <div className="flex flex-col gap-2">
                <div className=" flex gap-2 items-center">
                  <p className="text-neutral-800 font-medium text-nowrap text-sm">
                    Style References Image Urls:
                  </p>
                  <HoverCard openDelay={300}>
                    <HoverCardTrigger>
                      <InfoCircledIcon className=" cursor-pointer hover:stroke-black/20"></InfoCircledIcon>
                    </HoverCardTrigger>
                    <HoverCardContent>
                      <p className="text-white text-sm">
                        命令: --sref<br></br>
                        仅适用于v 6, niji 6, 风格参考的image urls,以 png, jpg,
                        jpeg, webp 结尾,
                        在prompt的后面,可以得到与输入的图像非常相似的图像,可以与image
                        prompt搭配使用。
                      </p>
                    </HoverCardContent>
                  </HoverCard>
                </div>

                <Input
                  value={sreftUrl}
                  disabled={useDefaultModel}
                  onBlur={() => handleInputBlur(-1, "srefUrls")}
                  onChange={(e) => setSrefUrl(e.target.value)}
                  className="bg-gray-100 border-none text-xs  placeholder:text-xs resize-none focus-visible:ring-transparent focus-visible:ring-offset-transparent "
                  placeholder="https://example.com/image.png"
                ></Input>
              </div>
              <Separator className=" w-full" />
              <div className="flex flex-col gap-3">
                <div className=" w-full flex gap-[89px] text-black items-center">
                  <Switch
                    id="use-form-data"
                    className=" scale-[0.8]"
                    checked={useStyleRow}
                    onCheckedChange={(value) => setUseStyleRow(value)}
                  ></Switch>
                  <div className="flex gap-2 items-center">
                    <Label
                      htmlFor="use-form-data"
                      className=" text-sm cursor-pointer"
                    >
                      Style Raw
                    </Label>
                    <HoverCard openDelay={300}>
                      <HoverCardTrigger>
                        <InfoCircledIcon className=" cursor-pointer hover:stroke-black/20"></InfoCircledIcon>
                      </HoverCardTrigger>
                      <HoverCardContent>
                        <p className="text-white text-sm">
                          命令: --style row<br></br>
                          此项开启后,图像应用的自动美化较少,这可以在prompt特定样式时实现更准确的匹配。详情查看
                          <Link
                            target="_blank"
                            rel="stylesheet"
                            className=" text-blue-500 underline underline-offset-4"
                            href="https://docs.midjourney.com/docs/style"
                          >
                            官方文档
                          </Link>
                        </p>
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                </div>
                <div className=" w-full flex gap-[131px] text-black items-center">
                  <Switch
                    className=" scale-[0.8]"
                    id="use-tile"
                    checked={useTile}
                    onCheckedChange={(value) => setUseTile(value)}
                  ></Switch>
                  <div className="flex gap-2 items-center">
                    <Label
                      htmlFor="use-tile"
                      className="text-sm cursor-pointer"
                    >
                      Tile
                    </Label>
                    <HoverCard openDelay={300}>
                      <HoverCardTrigger>
                        <InfoCircledIcon className=" cursor-pointer hover:stroke-black/20"></InfoCircledIcon>
                      </HoverCardTrigger>
                      <HoverCardContent>
                        <p className="text-white text-sm">
                          命令:--tile<br></br>
                          此项开启可以生成重复的无缝图案,类似地板砖。详情查看
                          <Link
                            target="_blank"
                            rel="stylesheet"
                            className=" text-blue-500 underline underline-offset-4"
                            href="https://docs.midjourney.com/docs/tile"
                          >
                            官方文档
                          </Link>
                        </p>
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                </div>
                <div className=" w-full flex gap-[87px] text-black items-center">
                  <Switch
                    checked={useTurbo}
                    disabled={useDefaultModel === false}
                    className=" scale-[0.8]"
                    onCheckedChange={(value) => setUseTurbo(value)}
                    id="use-turbo"
                  ></Switch>
                  <div className="flex gap-2 items-center">
                    <Label
                      htmlFor="use-turbo"
                      className="text-sm cursor-pointer"
                    >
                      Turbo模式
                    </Label>
                    <HoverCard openDelay={300}>
                      <HoverCardTrigger>
                        <InfoCircledIcon className=" cursor-pointer hover:stroke-black/20"></InfoCircledIcon>
                      </HoverCardTrigger>
                      <HoverCardContent>
                        <p className="text-white text-sm">
                          仅v5.2可用;
                          此项开启后,文生图,图生文,图生图的速度会更快,但是会消耗更多的GPU算力。turbo比fast快四倍,但消耗的订阅GPU分钟数是fast的两倍。
                          默认fast模式。详情查看
                          <Link
                            target="_blank"
                            rel="stylesheet"
                            className=" text-blue-500 underline underline-offset-4"
                            href="https://docs.midjourney.com/docs/fast-relax"
                          >
                            官方文档
                          </Link>
                        </p>
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                </div>
              </div>
            </div>

            <div className=" bg-gray-100 flex-1 min-w-max w-full h-full flex-center">
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem className="flex flex-col  w-full h-full">
                    <Tabs
                      defaultValue="textToImage"
                      className="flex flex-col h-full w-full items-center justify-between"
                    >
                      <TabsList className=" shadow-md bg-gray-200/20 my-2 p-4 py-6 gap-2 text-gray-600 rounded-md">
                        <TabsTrigger
                          value="textToImage"
                          className=" py-[0.4rem] rounded-md"
                        >
                          文生图
                        </TabsTrigger>
                        <TabsTrigger
                          value="ImageToText"
                          className=" py-[0.4rem] rounded-md"
                        >
                          图生文
                        </TabsTrigger>
                        <TabsTrigger
                          value="ImageToImage"
                          className=" py-[0.4rem] rounded-md"
                        >
                          图生图
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent
                        value="textToImage"
                        className=" h-full p-4 px-8 overflow-y-scroll hide-scrollbar"
                      >
                        <div className=" w-full h-[105%] mb-[8rem] flex-center">
                          <div
                            className={`w-fit h-full ${(imageArr.length === 0 || isInpainting) &&
                              "!flex-center flex-col !justify-between"
                              } grid gap-1 grid-cols-2 items-center justify-center`}
                          >
                            {(imageArr.length === 0 || isInpainting) && (
                              <div className="flex-center mt-[6rem] max-w-[450px] max-h-[450px] aspect-square">
                                {
                                  <img
                                    src={"/pending2.png"}
                                    alt="midjourney image"
                                    className={`rounded-xl max-w-[100%] max-h-[100%] aspect-square ${(isFetching || isInpainting) && "flicker"
                                      }`}
                                  ></img>
                                }
                              </div>
                            )}

                            {imageArr.length === 4 &&
                              isInpainting === false &&
                              imageArr.map((imgUrl, index) => (
                                <div
                                  key={index}
                                  className=" flex-center relative group"
                                >
                                  <div className="  w-[400px] h-[400px] bg-gray-300/40 rounded-md p-2 relative flex-center">
                                    <img
                                      src={imgUrl}
                                      alt="midjourney image"
                                      className={`rounded-xl max-w-[100%] max-h-[100%]`}
                                    ></img>
                                    <button
                                      type="button"
                                      className="absolute min-w-[240px] h-full rounded-xl inset-0 bg-transparent hover:bg-transparent"
                                      onClick={() => {
                                        setSelectedIndex(index);
                                        setOpen(true);
                                      }}
                                    ></button>
                                    <div className=" rounded-md p-1 absolute bg-black/70 transition-all duration-200  opacity-0 right-1 top-1 flex group-hover:opacity-100 flex-col items-center justify-center gap-1">
                                      <TooltipProvider delayDuration={200}>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleDownloadBase64(imgUrl, index)
                                              }
                                              className=" active:translate-y-[1px] rounded-md bg-transparent p-1.5 hover:bg-gray-500/35 transition-all duration-200"
                                            >
                                              <DownloadIcon
                                                width={20}
                                                height={20}
                                                color="white"
                                              ></DownloadIcon>
                                            </button>
                                          </TooltipTrigger>
                                          <TooltipContent side="right">
                                            <p className=" bg-black/70 py-1.5 px-2.5 text-white rounded-md">
                                              下载
                                            </p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>

                                      <TooltipProvider delayDuration={200}>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setSelectedIndex(index);
                                                setOpen(true);
                                              }}
                                              className="active:translate-y-[1px] rounded-md bg-transparent p-1.5 hover:bg-gray-500/35 transition-all duration-200"
                                            >
                                              <EnterFullScreenIcon
                                                width={20}
                                                height={20}
                                                color="white"
                                              ></EnterFullScreenIcon>
                                            </button>
                                          </TooltipTrigger>
                                          <TooltipContent side="right">
                                            <p className=" bg-black/70 py-1.5 px-2.5 text-white rounded-md">
                                              放大
                                            </p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>

                                      <Separator className=" bg-gray-500/75"></Separator>

                                      <TooltipProvider delayDuration={200}>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                debounce(() =>
                                                  handleVaryStrong(
                                                    taskId,
                                                    index + 1 + ""
                                                  ),
                                                  1000
                                                )();
                                              }}
                                              className="active:translate-y-[1px] rounded-md bg-transparent p-1.5 hover:bg-gray-500/35 transition-all duration-200"
                                            >
                                              <MagicWandIcon
                                                width={20}
                                                height={20}
                                                color="white"
                                              ></MagicWandIcon>
                                            </button>
                                          </TooltipTrigger>
                                          <TooltipContent side="right">
                                            <p className=" bg-black/70 py-1.5 px-2.5 text-white rounded-md">
                                              Vary(strong)
                                            </p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>

                                      <TooltipProvider delayDuration={200}>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                debounce(() =>
                                                  handleVarySubtle(
                                                    taskId,
                                                    index + 1 + ""
                                                  ),
                                                  1000
                                                )();
                                              }}
                                              className="active:translate-y-[1px] rounded-md bg-transparent p-1.5 hover:bg-gray-500/35 transition-all duration-200"
                                            >
                                              <MagicWandIcon
                                                width={15}
                                                height={15}
                                                color="white"
                                              ></MagicWandIcon>
                                            </button>
                                          </TooltipTrigger>
                                          <TooltipContent side="right">
                                            <p className=" bg-black/70 py-1.5 px-2.5 text-white rounded-md">
                                              Vary(subtle)
                                            </p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>

                                      <Separator className=" bg-gray-500/75"></Separator>

                                      <TooltipProvider delayDuration={200}>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setVaryRegionOpen(true);
                                                setSelectedIndex(index);
                                              }}
                                              className="active:translate-y-[1px] rounded-md bg-transparent p-1.5 hover:bg-gray-500/35 transition-all duration-200"
                                            >
                                              <Pencil2Icon
                                                width={20}
                                                height={20}
                                                color="white"
                                              ></Pencil2Icon>
                                            </button>
                                          </TooltipTrigger>
                                          <TooltipContent side="right">
                                            <p className=" bg-black/70 py-1.5 px-2.5 text-white rounded-md">
                                              Vary(Region)
                                            </p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </div>
                                  </div>

                                  <ImageFullView
                                    open={open}
                                    setOpen={setOpen}
                                    tempFormValue={tempFormValue}
                                    parentimageArr={imageArr}
                                    selectedIndex={selectedIndex || 0}
                                    parentTaskId={taskId}
                                    setOriginTaskId={setTaskId}
                                    parentSeed={seed || ""}
                                    finalPrompt={finalPrompt || ""}
                                    setParentImgArr={setImageArr}
                                    setParentSeed={setSeed}
                                    useStyleRaw={useStyleRow}
                                    useTile={useTile}
                                    customASH={customASH}
                                    customAS={customAs}
                                    customASW={customASW}
                                    useDefaultModel={useDefaultModel}
                                    email={email}
                                  ></ImageFullView>

                                  <VaryRegion
                                    open={varyRegionOpen}
                                    originTaskId={taskId}
                                    setOriginTaskId={setTaskId}
                                    setParentSeed={setSeed}
                                    parentPrompt={finalPrompt || ""}
                                    setOpen={setVaryRegionOpen}
                                    parentimageArr={imageArr}
                                    setParentImageArr={setImageArr}
                                    selectedIndex={selectedIndex || 0}
                                    email={email}
                                  ></VaryRegion>
                                </div>
                              ))}

                            <div className="flex flex-col items-center absolute bottom-4 left-[27.5%] w-[820px] shadow-md rounded-xl p-1 col-span-2  flex-center bg-white">
                              <div className="flex w-full flex-center p-2 bg-white rounded-md">
                                <HoverCard openDelay={300}>
                                  <HoverCardTrigger className=" ml-2 mb-5">
                                    <InfoCircledIcon className=" cursor-pointer hover:stroke-black/20"></InfoCircledIcon>
                                  </HoverCardTrigger>
                                  <HoverCardContent>
                                    <p className="text-white text-sm">
                                      1.暂时不支持中译英功能,请输入英文。
                                      <br></br>
                                      2.为了避免模型版本和命令参数冲突引发错误,请不要输入命令和图片地址,会被屏蔽。
                                      <br></br>
                                      3.请勿输入敏感内容,会被屏蔽。<br></br>
                                      4.左边的参数都是midjourney的默认值。
                                    </p>
                                  </HoverCardContent>
                                </HoverCard>
                                <FormControl>
                                  <Textarea
                                    className=" hide-scrollbar resize-none  bg-transparent border-none p-[1.5rem] focus-visible:ring-transparent focus-visible:ring-offset-transparent"
                                    placeholder="使用英文短语描述你的想象, 使用逗号分隔"
                                    {...field}
                                  ></Textarea>
                                </FormControl>
                                <div className="flex gap-2 items-center self-end">
                                  <Popover>
                                    <PopoverTrigger className=" bg-white hover:bg-gray-100 transition-all duration-200 active:translate-y-[1px] rounded-md border-slate-200 border py-2 px-[8px]">
                                      <HoverCard openDelay={300}>
                                        <HoverCardTrigger className=" flex items-center">
                                          <TagsIcon
                                            width={20}
                                            height={20}
                                          ></TagsIcon>
                                          <span className={`rounded-full w-[24px] h-[24px] p-1 aspect-square bg-gray-100 text-xs hidden ${stylesList.length > 0 && '!block ml-1'}`}>{stylesList.length > 0 ? stylesList.length : ''}</span>
                                        </HoverCardTrigger>
                                        <HoverCardContent className=" w-fit">
                                          <p className="text-white text-sm">
                                            添加艺术风格
                                          </p>
                                        </HoverCardContent>
                                      </HoverCard>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[30rem] overflow-y-scroll p-2 flex flex-wrap gap-2 hide-scrollbar h-[10rem] bg-white">
                                      {styleTags.map((tag) => (
                                        <div key={tag.value} className="flex items-center">
                                          <Button
                                            type='button'
                                            variant='outline'
                                            onClick={() => {
                                              if (stylesList.includes(tag.value)) return;
                                              setStylesList([...stylesList, tag.value])
                                            }
                                            }
                                            className={`cursor-pointer w-fit h-auto p-2 rounded-full  text-xs font-medium ${stylesList.includes(tag.value) && 'bg-gray-100'}`}
                                          >
                                            <span>{tag.label}</span>
                                          </Button>
                                          {styleInList(tag.value) && (
                                            <X
                                              width={12}
                                              height={12}
                                              onClick={() => {
                                                setStylesList([...stylesList.filter(item => item !== tag.value)])
                                              }
                                              }
                                              className=" rounded-full cursor-pointer bg-gray-100 hover:bg-gray-200 transition-all duration-200"
                                            ></X>
                                          )}
                                        </div>
                                      ))}
                                      <Link
                                        target="_blank"
                                        className=" underline underline-offset-2 text-xs ml-2 mt-2 text-blue-500"
                                        href="https://midlibrary.io/styles"
                                      >
                                        更多艺术风格...
                                      </Link>
                                    </PopoverContent>
                                  </Popover>

                                  <HoverCard openDelay={300}>
                                    <HoverCardTrigger
                                      onClick={() => {
                                        const randomPrompt =
                                          getRandomPrompt(randomPrompts);
                                        form.setValue("prompt", randomPrompt);
                                      }}
                                      className="bg-white cursor-pointer active:translate-y-[1px] hover:bg-gray-100 transition-all duration-200 rounded-md border-slate-200 border py-2 px-[8px]">

                                      <Lightbulb
                                        width={20}
                                        height={20}
                                      ></Lightbulb>

                                    </HoverCardTrigger>
                                    <HoverCardContent className=" w-fit">
                                      <p className="text-white text-sm">
                                        生成随机prompt
                                      </p>
                                    </HoverCardContent>
                                  </HoverCard>
                                  <Button
                                    type="submit"
                                    size="lg"
                                    className="w-fit button-85 active:translate-y-[1px] transition-all duration-200 ml-2 self-end text-lg"
                                    disabled={
                                      isFetching ||
                                      isInpainting ||
                                      field.value === ""
                                    }
                                  >
                                    {isInpainting || isFetching ? (
                                      <span className="flicker">生成中...</span>
                                    ) : (
                                      "生成"
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent
                        value="ImageToText"
                        className=" w-full h-full p-4"
                      >
                        <div className=" w-full h-full flex flex-col items-center justify-center bordern">
                          <div className="w-full h-full rounded-md flex ">
                            <div className=" w-full h-full rounded-md gap-4 p-6 flex flex-col items-center justify-center">
                              {generatePrompts &&
                                generatePrompts.length === 4 &&
                                generatePrompts.map((prompt, index) => (
                                  <div
                                    className=" flex gap-2 border-2 border-gray-500 rounded w-full h-full"
                                    key={index}
                                  >
                                    <div className="leading-6 h-[145px] overflow-y-scroll hide-scrollbar w-[40rem] px-4 text-sm  font-medium text-gray-600 bg-white/80  p-2 rounded-md">
                                      <div className="flex">
                                        <span className=" mr-2 break-words whitespace-nowrap mt-1 text-md text-black font-semibold">
                                          Prompt {index + 1} :
                                        </span>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          className="flex-center h-8 w-8 p-0"
                                          onClick={() =>
                                            handleCopy(generatePrompts[index])
                                          }
                                        >
                                          <CopyIcon
                                            height={12}
                                            width={12}
                                          ></CopyIcon>
                                        </Button>
                                      </div>
                                      {prompt}
                                    </div>
                                  </div>
                                ))}
                            </div>
                            <div className=" w-full h-full flex-center">
                              <div className=" flex flex-col gap-4 items-center">
                                <div className="flex gap-1 items-center self-start -mb-3 text-zinc-900 text-[1rem] font-medium">
                                  本地上传 :
                                  <HoverCard openDelay={300}>
                                    <HoverCardTrigger>
                                      <InfoCircledIcon className=" cursor-pointer hover:stroke-black/20"></InfoCircledIcon>
                                    </HoverCardTrigger>
                                    <HoverCardContent>
                                      <p className="text-white text-sm">
                                        上传您本地的图片文件,上传后会自动触发生成按钮,并返回您上传图片的在线地址在输入框中。
                                        下面的图片是您本地上传的图片或是您输入的在线图片地址的图片。
                                      </p>
                                    </HoverCardContent>
                                  </HoverCard>
                                </div>
                                <div className=" w-[450px] h-[450px] bg-white rounded-md flex-center">
                                  <img
                                    src={
                                      uploadImg !== ""
                                        ? uploadImg
                                        : describeImageUrl
                                          ? describeImageUrl
                                          : "/pending2.png"
                                    }
                                    className=" rounded-md max-w-[100%] max-h-[100%]"
                                    alt="describe image"
                                  ></img>

                                </div>

                                <Input
                                  type="file"
                                  placeholder="Upload Image"
                                  accept="image/*"
                                  className="cursor-pointer border-gray-600 border-2 bg-white/55 "
                                  disabled={isDescribe}
                                  onChange={(e) => {
                                    handleSelectImagUrl(e);
                                  }}
                                ></Input>
                                <Button
                                  type="button"
                                  size="lg"
                                  className="w-full flex gap-2 button-85 text-lg"
                                  disabled={
                                    isDescribe || isUploading || selectImageFile === undefined
                                  }
                                  onClick={() => {
                                    debounce(() => handleUploadImage(), 1000)();
                                  }}
                                >
                                  <span className="max-w-[200px] truncate">{selectImageFile?.name}</span>

                                  <UploadCloudIcon></UploadCloudIcon>
                                  {isUploading ? (
                                    <>
                                      <span className="flicker">上传中...</span>
                                    </>
                                  ) : (
                                    "上传"
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>

                          <p className=" self-start -mb-3 text-[1rem] font-medium text-zinc-900">
                            在线图片地址上传 :
                          </p>
                          <div className=" w-full flex rounded-md p-2 gap-2 flex-center bg-gray-200 mx-4 !mt-4">
                            <div className="flex w-full flex-center">
                              <Input
                                value={describeImageUrl}
                                onChange={(e) =>
                                  setDescribeImageUrl(e.target.value)
                                }
                                onFocus={() => setSelectImageFile(undefined)}
                                className=" bg-transparent border-none p-[1.5rem] focus-visible:ring-transparent focus-visible:ring-offset-transparent"
                                placeholder="在线图片地址,png, jpg, jpeg后缀结尾,如:https://example.com/image.jpg,不支持webp,如果想描述midjourney官网的图片,请下载后再上传)"
                              ></Input>

                              <Button
                                type="button"
                                size="lg"
                                className="w-fit button-85 ml-2  text-lg"
                                disabled={isDescribe || isUploading || describeImageUrl == ""}
                                onClick={async () => {
                                  setUploadImg("");
                                  debounce(() =>
                                    handleDescribe(describeImageUrl),
                                    1000
                                  )();
                                }}
                              >
                                {isDescribe ? (
                                  <>
                                    <span className="flicker">生成中...</span>
                                  </>
                                ) : (
                                  "生成"
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent
                        value="ImageToImage"
                        className="w-full h-full p-4"
                      >
                        <div className=" w-full h-full  p-2 rounded-md">
                          <div className="flex flex-col items-center w-full h-full gap-4">
                            <div className="relative w-[480px] h-[480px] border-dashed border-2 border-gray-800 flex flex-wrap gap-1 flex-center">
                              {blendOrgins.map((image, index) =>
                                index !== 4 ? (
                                  <div className="p-[0.6rem] relative rounded-md group w-[220px] h-[220px] mb-2 flex-center border-[1px] border-black ">
                                    <img
                                      src={image.src}
                                      alt={image.name}
                                      className=" max-w-[100%] max-h-[100%]  rounded-md"
                                    />
                                    <X
                                      onClick={() => {
                                        setBlendImages((pre) =>
                                          pre.filter((file, i) => i !== index)
                                        );
                                        setBlendOrgins((pre) =>
                                          pre.filter(
                                            (old) => old.src !== image.src
                                          )
                                        );
                                      }}
                                      className=" cursor-pointer h-4 w-4 opacity-0 absolute right-1 top-1 group-hover:opacity-100 transition-all duration-200"
                                    ></X>
                                  </div>
                                ) : (
                                  <div className="p-[0.6rem] absolute group rounded-md border-[1px] border-black translate-x-[50%] translate-y-[50%] top-0 right-[50%]  w-[220px] h-[220px] mb-2 flex-center">
                                    <img
                                      src={image.src}
                                      alt={image.name}
                                      className=" max-w-[100%] max-h-[100%]  rounded-md"
                                    />
                                    <X
                                      onClick={() => {
                                        setBlendImages((pre) =>
                                          pre.filter((file, i) => i !== index)
                                        );
                                        setBlendOrgins((pre) =>
                                          pre.filter(
                                            (old) => old.src !== image.src
                                          )
                                        );
                                      }}
                                      className=" cursor-pointer h-4 w-4 opacity-0 absolute right-1 top-1 group-hover:opacity-100 transition-all duration-200"
                                    ></X>
                                  </div>
                                )
                              )}
                            </div>

                            <div className="  max-w-[480px] rounded-md  h-fit mb-10 flex-center flex-col p-4 px-6">
                              <div className="mb-4 self-start flex gap-2 items-center">
                                <p className="text-md flex gap-2 justify-center items-center font-medium">
                                  dimension:
                                  <HoverCard openDelay={300}>
                                    <HoverCardTrigger>
                                      <InfoCircledIcon className=" cursor-pointer hover:stroke-black/20"></InfoCircledIcon>
                                    </HoverCardTrigger>
                                    <HoverCardContent>
                                      <p className="text-white text-sm">
                                        blend图片的宽高比,默认为square(1:1)
                                        <Link
                                          target="_blank"
                                          rel="stylesheet"
                                          className=" text-blue-500 underline underline-offset-4"
                                          href="https://docs.midjourney.com/docs/blend-1"
                                        >
                                          官方文档
                                        </Link>
                                      </p>
                                    </HoverCardContent>
                                  </HoverCard>
                                </p>
                                <Select
                                  onValueChange={(value) => {
                                    setDimension(value);
                                  }}
                                  defaultValue={"square"}
                                >
                                  <SelectTrigger className="bg-gray-100 border border-gray-800 py-1 px-2 h-8 focus:ring-offset-transparent focus:ring-transparent">
                                    <SelectValue placeholder="dimension"></SelectValue>
                                  </SelectTrigger>

                                  <SelectContent className=" focus:ring-transparent">
                                    <SelectItem value="square">
                                      square(1:1)
                                    </SelectItem>
                                    <SelectItem value="portrait">
                                      portrait(2:3)
                                    </SelectItem>
                                    <SelectItem value="landscape">
                                      landscape(3:2)
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <FileUploader
                                types={fileTypes}
                                maxSize={32}
                                disabled={blendOrgins.length >= 5}
                                handleChange={(file: File) => {
                                  setBlendImages([...blendImages, file]);
                                }}
                              >
                                <div className=" flex-center cursor-pointer rounded-md border-dashed border-2 border-blue-500 w-[300px] h-[120px]">
                                  <UploadCloudIcon stroke="rgb(37, 99, 235)"></UploadCloudIcon>
                                  <div className=" ml-2">
                                    <p
                                      className={`${blendOrgins.length >= 5 &&
                                        `text-gray-700`
                                        } text-lg font-medium text-blue-700 hover:underline-offset-4 hover:underline under`}
                                    >
                                      在此处上传或拖拽文件
                                    </p>
                                    <p className=" text-sm text-gray-700">
                                      文件类型:png, jpg, jpeg, webp
                                    </p>
                                    <p className=" text-sm text-gray-700">
                                      文件数量:2到5个
                                    </p>
                                  </div>
                                </div>
                              </FileUploader>

                              <Button
                                type="button"
                                size="lg"
                                className="w-full mt-2 flex gap-2 button-85 text-lg"
                                disabled={isBlending || canBlend === false}
                                onClick={() => {
                                  debounce(() => handleBlend(), 1000)();
                                }}
                              >
                                {isBlending ? (
                                  <span className="flicker">生成中...</span>
                                ) : (
                                  "确定"
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </FormItem>
                )}
              ></FormField>
            </div>
            <div
              className={`hide-scrollbar p-2 px-4 w-[20rem] h-full flex flex-col overflow-y-scroll`}
            >
              <HistoryImage></HistoryImage>
            </div>
          </div>
        </form >
      </Form >
    </>
  );
};
