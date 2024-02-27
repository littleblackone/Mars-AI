"use client";
import { ChangeEvent, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageValidation } from "../../lib/validations";
import {
  ArrowLeftIcon,
  CodeIcon,
  CopyIcon,
  EnterFullScreenIcon,
  InfoCircledIcon,
  MagicWandIcon,
  Pencil2Icon,
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
  handleCopy,
  handleDownload,
  handleGetSeed,
} from "@/lib/utils";
import axios from "axios";
import {
  TaskResult,
  ImageFormData,
  FetchImageData,
} from "@/lib/interface/ImageData";

import { Button } from "../ui/button";

import { Slider } from "../ui/slider";
import { Input } from "../ui/input";
import { DownloadIcon, UploadCloudIcon, X } from "lucide-react";
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
import { useOriginImage } from "@/lib/store/useOriginImage";
import { useVaryImage } from "@/lib/store/useVaryImage";
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
import { useBlendImages } from "@/lib/store/useBlendImages";

export const ImageForm = () => {
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
  const [blendImgs, setBlendImgs] = useState<string[]>([]);
  const [useFormData, setUseFormData] = useState(true);
  const [useTurbo, setUseTurbo] = useState(false);
  const [useStyleRow, setUseStyleRow] = useState(false);

  const [isDescribe, setIsDescribe] = useState(false);

  const [manualPrompt, setManualPrompt] = useState("");

  const fileTypes = ["png", "jpg", "jpeg", "webp"];

  let uploadImages: string[] = [];

  const IMGBB_KEY = "bf349c2c6056943bee6bc4a507958c22";

  const setOriginImages = useOriginImage((state) => state.setImages);
  const setVaryImages = useVaryImage((state) => state.setImages);
  const setHistoryBlendImgs = useBlendImages((state) => state.setImages);

  const isInpainting = useIsInpainting((state) => state.isInpainting);

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
      setIsFetching(true);
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
      setIsFetching(false);
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
      setIsBlending(true);
      await handleUploadImages(blendImages);

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

        if (taskResult.data.status === "finished") {
          clearInterval(intervalId);
          uploadImages = [];
          const bast64ImgArr = await cropImageIntoFour(
            taskResult.data.task_result.image_url
          );

          setImageArr(bast64ImgArr);
          setBlendImgs(bast64ImgArr);
          setHistoryBlendImgs(bast64ImgArr);
          setIsBlending(false);
          toast.success("blend成功! 如需对blend图片进行操作,请到文生图区域。", {
            duration: 4000,
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
      setIsDescribe(true);
      const response = await axios.post("/api/describe", {
        imageUrl,
        useTurbo,
      });

      const newTaskId = response.data.task_id;

      const intervalId = setInterval(async () => {
        const taskResult: FetchImageData = await axios.post("/api/fetchImage", {
          taskId: newTaskId,
        });

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
      setImageArr([]);

      setFetchTime(0);
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

          setFetchTime((prev) => prev + 2);

          if (taskResult.data.status === "finished") {
            clearInterval(intervalId);

            const bast64ImgArr = await cropImageIntoFour(
              taskResult.data.task_result.image_url
            );

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
      setImageArr([]);
      setFetchTime(0);

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

          setFetchTime((prev) => prev + 2);

          if (taskResult.data.status === "finished") {
            clearInterval(intervalId);
            const bast64ImgArr = await cropImageIntoFour(
              taskResult.data.task_result.image_url
            );

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

  const handleGenerateImage = debounce(async (prompt: string) => {
    try {
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

          setFetchTime((prev) => prev + 2);

          if (fetchTime >= 120) {
            clearInterval(intervalId);
            setIsFetching(false);
            toast.error("请求超时，请重试");
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

            setImageArr(bast64ImgArr);
            setOriginImages(bast64ImgArr);

            await handleGetSeed(taskId, setSeed);
            setIsFetching(false);
          }
        } catch (error) {
          console.error("Error fetching image:", error);
          setIsFetching(false);
        }
      }, 1000);
    } catch (error) {
      toast.error(
        "请求失败,请检查prompt格式或查看midjourney服务器状态并过一段时间重试",
        { duration: 5000 }
      );
      setIsFetching(false);
      console.error("Error sending prompt:", error);
    }
  }, 1000);

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
    },
  });

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

  const onSubmit = (values: z.infer<typeof ImageValidation>) => {
    setImageArr([]);
    setFetchTime(0);
    setManualPrompt(values.prompt);

    if (useFormData) {
      setTempFormValue(values);
      const finalPrompt = generateFinalPrompt(values, useStyleRow);
      setFinalPrompt(finalPrompt);
      handleGenerateImage(finalPrompt);
    } else {
      setTempFormValue(undefined);
      handleGenerateImage(values.prompt);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className=" w-full h-full">
        <div className=" h-[5vh] w-full bg-white border-b flex p-2 px-[1.4rem] items-center">
          <Link
            href="/"
            className=" w-fit active:translate-y-[1px] h-[30px] bg-gray-100 rounded-md hover:bg-gray-200 transition-all duration-200 p-2 flex-center"
          >
            <ArrowLeftIcon width={20} height={20}></ArrowLeftIcon>
            <span>返回</span>
          </Link>
        </div>
        <div className=" flex items-center flex-1  w-full h-[95vh]">
          <div className="  flex-shrink-0 w-fit px-6 py-4 h-full flex flex-col gap-6 items-start">
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
                      onValueChange={field.onChange}
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
                <FormItem className="flex items-center justify-between  w-[200px]">
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
                          生成图片的宽高比,默认为1:1,如果你想自定义,请选择最后一个选项,然后在prompt中使用命令。详情查看
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
                      onValueChange={field.onChange}
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
                            <CodeIcon></CodeIcon>
                            <span className=" text-xs">命令</span>
                          </div>
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

                  <div className="-translate-y-[3px]">
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

            <FormField
              control={form.control}
              name="seeds"
              render={({ field }) => (
                <FormItem className="flex flex-col ">
                  <div className=" flex gap-2 items-center">
                    <FormLabel className="text-neutral-800 text-nowrap text-sm">
                      seeds:
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
            <div className="flex flex-col gap-3">
              <div className=" w-full flex gap-[89px] text-black items-center">
                <Switch
                  id="use-form-data"
                  className=" scale-[0.8]"
                  checked={useStyleRow}
                  onCheckedChange={(value) => setUseStyleRow(value)}
                ></Switch>
                <div className="flex gap-2 items-center">
                  <Label htmlFor="use-form-data" className=" text-sm">
                    style raw
                  </Label>
                  <HoverCard openDelay={300}>
                    <HoverCardTrigger>
                      <InfoCircledIcon className=" cursor-pointer hover:stroke-black/20"></InfoCircledIcon>
                    </HoverCardTrigger>
                    <HoverCardContent>
                      <p className="text-white text-sm">
                        命令: --style row<br></br>
                        仅v5.2,v6,niji6可用;
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
              <div className=" w-full flex gap-[63.5px] text-black items-center">
                <Switch
                  className=" scale-[0.8]"
                  id="use-form-data"
                  checked={useFormData}
                  onCheckedChange={(value) => setUseFormData(value)}
                ></Switch>
                <div className="flex gap-2 items-center">
                  <Label htmlFor="use-form-data" className="text-sm">
                    使用表格数据
                  </Label>
                  <HoverCard openDelay={300}>
                    <HoverCardTrigger>
                      <InfoCircledIcon className=" cursor-pointer hover:stroke-black/20"></InfoCircledIcon>
                    </HoverCardTrigger>
                    <HoverCardContent>
                      <p className="text-white text-sm">
                        此项开启后,表格中的数据会作为命令自动填写到prompt中,如果您想使用自己的prompt,可以关闭。
                        如果表格中的数据和prompt中的数据有冲突,那么表格中的数据会覆盖prompt中的数据。
                      </p>
                    </HoverCardContent>
                  </HoverCard>
                </div>
              </div>
              <div className=" w-full flex gap-[88px] text-black items-center">
                <Switch
                  checked={useTurbo}
                  className=" scale-[0.8]"
                  onCheckedChange={(value) => setUseTurbo(value)}
                  id="use-turbo"
                ></Switch>
                <div className="flex gap-2 items-center">
                  <Label htmlFor="use-turbo" className="text-sm">
                    turbo模式
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

          <div className=" bg-gray-100  flex-1 w-full h-full flex-center">
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
                      className=" w-full h-full p-4 px-8 overflow-y-scroll hide-scrollbar"
                    >
                      <div
                        className={`w-full h-full ${
                          (imageArr.length === 0 || isInpainting) &&
                          "!flex-center flex-col !justify-between"
                        } grid items-center justify-center`}
                      >
                        {(imageArr.length === 0 || isInpainting) && (
                          <div className="flex-center mt-[6rem] max-w-[450px] max-h-[450px] aspect-square">
                            {
                              <img
                                src={"/pending2.png"}
                                alt="midjourney image"
                                className={`rounded-xl max-w-[100%] max-h-[100%] aspect-square ${
                                  (isFetching || isInpainting) && "flicker"
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
                              <div className="  w-[400px] h-[400px] bg-white/20 rounded-md p-2 relative flex-center">
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
                                            handleDownload(imgUrl, index)
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
                                        <p className=" bg-black/70 py-1.5 px-2.5 text-black rounded-md">
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
                                          onClick={() => setOpen(true)}
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
                                        <p className=" bg-black/70 py-1.5 px-2.5 text-black rounded-md">
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
                                            handleVaryStrong(
                                              taskId,
                                              index + 1 + ""
                                            );
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
                                        <p className=" bg-black/70 py-1.5 px-2.5 text-black rounded-md">
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
                                            handleVarySubtle(
                                              taskId,
                                              index + 1 + ""
                                            );
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
                                        <p className=" bg-black/70 py-1.5 px-2.5 text-black rounded-md">
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
                                        <p className=" bg-black/70 py-1.5 px-2.5 text-black rounded-md">
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
                                manualPrompt={manualPrompt}
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
                              ></VaryRegion>
                            </div>
                          ))}
                        <FormMessage className="ml-4"></FormMessage>
                        <div className="flex rounded-md w-full p-1 col-span-2 gap-2 flex-center bg-gray-100 mx-4 !mt-4">
                          <div className="flex w-full flex-center p-2 bg-gray-200 rounded-md">
                            <FormControl>
                              <Input
                                className="bg-transparent border-none p-[1.5rem] focus-visible:ring-transparent focus-visible:ring-offset-transparent"
                                placeholder="让你的想象变成事实......"
                                {...field}
                              ></Input>
                            </FormControl>
                            <Button
                              type="submit"
                              size="lg"
                              className="w-fit button-85 ml-2  text-lg"
                              disabled={isFetching || isInpainting}
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
                    </TabsContent>
                    <TabsContent value="ImageToText" className=" w-full h-full">
                      <div className=" w-full h-full flex flex-col items-center justify-center bordern">
                        <div className="w-full h-full rounded-md flex bg-white/35">
                          <div className=" w-full h-full rounded-md gap-4 p-6 flex flex-col items-center justify-center">
                            {generatePrompts &&
                              generatePrompts.length === 4 &&
                              generatePrompts.map((prompt, index) => (
                                <div
                                  className=" flex gap-2 w-full h-full"
                                  key={index}
                                >
                                  <div className="leading-6 h-[120px] overflow-y-scroll hide-scrollbar w-full  px-4 text-sm  font-medium text-gray-600 bg-white/30  p-2 rounded-md">
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
                              <div className=" w-[350px] h-[350px] flex-center">
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
                                className="cursor-pointer bg-white/55 border-none"
                                disabled={isFetching}
                                onChange={(e) => {
                                  handleSelectImagUrl(e);
                                }}
                              ></Input>
                              <Button
                                type="button"
                                size="lg"
                                className="w-full flex gap-2 button-85 text-lg"
                                disabled={
                                  isFetching || selectImageFile == undefined
                                }
                                onClick={() => {
                                  handleUploadImage();
                                }}
                              >
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
                        <div className=" w-full flex rounded-md p-1  gap-2 flex-center bg-gray-100 mx-4 !mt-4">
                          <div className="flex w-full flex-center">
                            <Input
                              value={describeImageUrl}
                              onChange={(e) =>
                                setDescribeImageUrl(e.target.value)
                              }
                              className=" bg-transparent border-none p-[1.5rem] focus-visible:ring-transparent focus-visible:ring-offset-transparent"
                              placeholder="在线图片地址(格式后缀结尾,如:https://example.com/image.jpg,不支持webp,如果想描述midjourney官网的图片,请下载后再上传)"
                            ></Input>

                            <Button
                              type="button"
                              size="lg"
                              className="w-fit button-85 ml-2  text-lg"
                              disabled={isDescribe || describeImageUrl == ""}
                              onClick={() => {
                                setUploadImg("");
                                handleDescribe(describeImageUrl);
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
                      className=" w-[90%] h-full"
                    >
                      <div className=" w-full h-full bg-white/35 p-2 rounded-md">
                        <div className="flex-center w-full h-full gap-4">
                          <div
                            className={` w-[500px] h-[500px] grid grid-cols-2 gap-2 ${
                              blendImgs.length === 0 && `!flex-center`
                            } `}
                          >
                            {blendImgs.length === 0 && (
                              <img
                                src={"/pending2.png"}
                                alt="blend image"
                                className={`rounded-md max-w-[100%] max-h-[100%] ${
                                  isBlending && "flicker"
                                }`}
                              />
                            )}
                            {blendImgs.length === 4 &&
                              blendImgs.map((img) => (
                                <div className=" w-[220px] h-[220px] flex-center">
                                  <img
                                    src={img}
                                    alt="blend image"
                                    className={`rounded-md hover:scale-105 transition-all duration-200 max-w-[100%] max-h-[100%] ${
                                      isBlending && "flicker"
                                    }`}
                                  />
                                </div>
                              ))}
                          </div>

                          <div className=" max-w-[350px] rounded-md h-full flex-center flex-col p-4 px-6 ">
                            <div className="mb-4 self-start flex gap-2 items-center">
                              <p className="text-md font-medium">dimension:</p>
                              <Select
                                onValueChange={(value) => {
                                  setDimension(value);
                                }}
                                defaultValue={"square"}
                              >
                                <SelectTrigger className="bg-gray-100 border-none py-1 px-2 h-8 focus:ring-offset-transparent focus:ring-transparent">
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
                                    className={`${
                                      blendOrgins.length >= 5 && `text-gray-700`
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
                            <div className=" mt-4 relative flex flex-wrap gap-1 w-full flex-center">
                              {blendOrgins.map((image, index) =>
                                index !== 4 ? (
                                  <div className="p-[0.6rem] relative rounded-md group w-[130px] h-[130px] mb-2 flex-center border-[1px] border-black ">
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
                                  <div className="p-[0.6rem] absolute group rounded-md border-[1px] border-black translate-x-[50%] translate-y-[50%] top-0 right-[50%]  w-[130px] h-[130px] mb-2 flex-center">
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
                            <Button
                              type="button"
                              size="lg"
                              className="w-full  flex gap-2 button-85 text-lg"
                              disabled={isBlending || canBlend === false}
                              onClick={() => {
                                handleBlend();
                              }}
                            >
                              {isBlending ? (
                                <span className="flicker">生成中</span>
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
      </form>
    </Form>
  );
};
