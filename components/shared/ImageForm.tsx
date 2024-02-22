"use client";
import { ChangeEvent, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageValidation } from "../../lib/validations";
import {
  CopyIcon,
  EnterFullScreenIcon,
  MagicWandIcon,
  TrashIcon,
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  convertStringToArray,
  debounce,
  generateFinalPrompt,
  handleCopy,
  handleDownload,
  parseAspectRatio,
} from "@/lib/utils";
import axios from "axios";
import {
  TaskResult,
  ImageFormData,
  FetchImageData,
} from "@/app/interface/ImageData";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { styles } from "@/lib/constant";
import { Slider } from "../ui/slider";
import { Input } from "../ui/input";
import { CheckIcon, DownloadIcon, UploadCloudIcon } from "lucide-react";
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

export const ImageForm = () => {
  const [imageDatas, setImageDatas] = useState<TaskResult | null>();
  const [fetchTime, setFetchTime] = useState<number>(0);
  const [isFetching, setIsFetching] = useState(false);
  const [imageArr, setImageArr] = useState<string[]>([]);
  const [taskId, setTaskId] = useState<string>("");
  const [seed, setSeed] = useState<string>();
  const [tempFormValue, setTempFormValue] = useState<ImageFormData>();
  const [finalPrompt, setFinalPrompt] = useState<string>();
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [aspectRatio, setAspectRatio] = useState("");
  const [isASLessOne, setIsASLessOne] = useState<boolean>(false);
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
  const [blendImg, setBlendImg] = useState("");

  const fileTypes = ["png", "jpg", "jpeg", "webp"];

  let uploadImages: string[] = [];

  const IMGBB_KEY = "bf349c2c6056943bee6bc4a507958c22";

  const setOriginImages = useOriginImage((state) => state.setImages);
  const setVaryImages = useVaryImage((state) => state.setImages);

  const testOriginImageList = [
    "https://cdn.midjourney.com/ffd8ffcd-3abf-4349-831b-71a79b682d6f/0_0.webp",
    "https://cdn.midjourney.com/ffd8ffcd-3abf-4349-831b-71a79b682d6f/0_1.webp",
    "https://cdn.midjourney.com/ffd8ffcd-3abf-4349-831b-71a79b682d6f/0_2.webp",
    "https://cdn.midjourney.com/ffd8ffcd-3abf-4349-831b-71a79b682d6f/0_3.webp",
  ];

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
      console.log(results);

      results.map((res) => {
        uploadImages.push(res.data.url);
        console.log("uploadImages", uploadImages);
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
      });

      console.log(response.data);

      const newTaskId = response.data.task_id;

      const intervalId = setInterval(async () => {
        const taskResult: FetchImageData = await axios.post("/api/fetchImage", {
          taskId: newTaskId,
        });

        setImageDatas(taskResult.data.task_result);
        if (taskResult.data.status === "finished") {
          clearInterval(intervalId);
          uploadImages = [];
          setBlendImg(taskResult.data.task_result.image_url);
          setIsBlending(false);
          toast.success("blend成功");
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
      setIsFetching(true);
      const response = await axios.post("/api/describe", { imageUrl });

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
          setIsFetching(false);
        }
      }, 1000);
    } catch (error) {
      toast.error("请求失败，请查看图片地址格式是否正确");
      setIsFetching(false);
      console.error("Error handle describe:", error);
    }
  };

  const handleGetSeed = async (taskId: string) => {
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

  const handleVaryStrong = async (originTaskId: string, index: string) => {
    try {
      setImageArr([]);
      setImageDatas(null);
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

          setImageDatas(taskResult.data.task_result);

          setFetchTime((prev) => prev + 2);

          if (taskResult.data.status === "finished") {
            clearInterval(intervalId);
            setImageArr(taskResult.data.task_result.image_urls);
            setVaryImages(taskResult.data.task_result.image_urls);
            setTaskId(taskResult.data.task_id);
            await handleGetSeed(taskResult.data.task_id);
            setIsFetching(false);
          }
        } catch (error) {
          console.error("Error fetching image:", error);
        }
      }, 2000);
    } catch (error) {
      console.error("Error vary(strong) image:", error);
    }
  };

  const handleVarySubtle = async (originTaskId: string, index: string) => {
    try {
      setImageArr([]);
      setFetchTime(0);
      setImageDatas(null);
      setIsFetching(true);

      let varySubId: string;
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
          if (!isFirstIntervalCompleted) return;

          const taskResult: FetchImageData = await axios.post(
            "/api/fetchImage",
            {
              taskId: varySubId,
            }
          );

          setImageDatas(taskResult.data.task_result);

          setFetchTime((prev) => prev + 2);

          if (taskResult.data.status === "finished") {
            clearInterval(intervalId);
            setImageArr(taskResult.data.task_result.image_urls);
            setVaryImages(taskResult.data.task_result.image_urls);
            setTaskId(taskResult.data.task_id);
            await handleGetSeed(taskResult.data.task_id);
            setIsFetching(false);
          }
        } catch (error) {
          console.error("Error fetch image:", error);
        }
      }, 2000);
    } catch (error) {
      console.error("Error vary(subtle) image:", error);
    }
  };

  const handleGenerateImage = debounce(async (prompt: string) => {
    try {
      setIsFetching(true);
      const response = await axios.post("/api/imagine", { prompt });
      const taskId = response.data.task_id;
      setTaskId(taskId);

      const intervalId = setInterval(async () => {
        try {
          const taskResult = await axios.post("/api/fetchImage", { taskId });

          setImageDatas(taskResult.data.task_result);

          setFetchTime((prev) => prev + 2);

          if (fetchTime >= 120) {
            clearInterval(intervalId);
            setIsFetching(false);
            toast.error("请求超时，请重试");
            console.log("请求超时，请重试");
          }

          if (taskResult.data.status === "finished") {
            clearInterval(intervalId);
            setImageArr(taskResult.data.task_result.image_urls);
            setOriginImages(taskResult.data.task_result.image_urls);
            await handleGetSeed(taskId);
            setIsFetching(false);
          }
        } catch (error) {
          console.error("Error fetching image:", error);
          setIsFetching(false);
        }
      }, 2000);
    } catch (error) {
      console.error("Error sending prompt:", error);
      setIsFetching(false);
    }
  }, 1000);

  const form = useForm<z.infer<typeof ImageValidation>>({
    resolver: zodResolver(ImageValidation),
    defaultValues: {
      prompt: "",
      negativePrompt: "",
      seeds: 0,
      stylize: 100,
      chaos: 0,
      aspectRatio: " --ar 1:1",
      model: " --v 5.2",
      artStyles: "",
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
    if (imageDatas?.task_progress === 100) {
      form.resetField("prompt");
    }
  }, [imageDatas]);

  useEffect(() => {
    if (aspectRatio !== "") {
      const { lessThanOne } = parseAspectRatio(aspectRatio);
      console.log("lessThanOne", lessThanOne);
      if (lessThanOne) {
        setIsASLessOne(true);
      } else {
        setIsASLessOne(false);
      }
    }
  }, [aspectRatio]);

  const onSubmit = (values: z.infer<typeof ImageValidation>) => {
    setImageDatas(null);
    setImageArr([]);
    setFetchTime(0);
    setTempFormValue(values);
    setAspectRatio(values.aspectRatio || "");
    const finalPrompt = generateFinalPrompt(values);
    setFinalPrompt(finalPrompt);
    handleGenerateImage(finalPrompt);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className=" w-full">
        <div className=" flex items-center flex-1  w-full h-[80vh] hide-scroll">
          <div className=" px-6 py-2 flex-shrink-0  w-[20rem] h-full flex flex-col justify-between items-start">
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between  w-[200px]">
                  <FormLabel className="text-white text-nowrap text-base">
                    Models:
                  </FormLabel>
                  <div className=" -translate-y-[3px]">
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-white/60 border-none py-1 px-2 h-8 focus:ring-offset-transparent focus:ring-transparent">
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

            <Separator className=" w-[75%]" />

            <FormField
              control={form.control}
              name="aspectRatio"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between  w-[200px]">
                  <FormLabel className="text-white text-nowrap text-base">
                    AspectRatio:
                  </FormLabel>
                  <div className="-translate-y-[3px]">
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-white/60 border-none py-1 px-2 h-8 focus:ring-offset-transparent focus:ring-transparent">
                          <SelectValue placeholder="图片比例"></SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value=" --ar 1:1">1:1</SelectItem>
                        <SelectItem value=" --ar 4:3">4:3</SelectItem>
                        <SelectItem value=" --ar 3:2">3:2</SelectItem>
                        <SelectItem value=" --ar 16:9">16:9</SelectItem>
                        <SelectItem value=" --ar 9:16">9:16</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </FormItem>
              )}
            ></FormField>

            <Separator className=" w-[75%]" />

            <FormField
              control={form.control}
              name="artStyles"
              render={({ field }) => (
                <FormItem className=" flex flex-col w-[200px] ">
                  <FormLabel className="text-white text-nowrap text-base">
                    Add styles:
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className="bg-white/60 border-none w-fit justify-center"
                        >
                          {field.value ? (
                            styles.find((style) => style.label === field.value)
                              ?.label
                          ) : (
                            <>
                              <span>style list</span>
                            </>
                          )}
                          <span>
                            {styles.find((style) => style.label === field.value)
                              ?.label === "无" && "艺术风格"}
                          </span>
                        </Button>
                      </FormControl>
                    </PopoverTrigger>

                    <PopoverContent className="p-0" side="right" align="start">
                      <Command>
                        <CommandInput placeholder="探索艺术风格..."></CommandInput>
                        <CommandList>
                          <CommandEmpty>没有找到相关的艺术风格</CommandEmpty>
                          <CommandGroup>
                            {styles.map((style) => (
                              <CommandItem
                                key={style.value}
                                value={style.label}
                                onSelect={() => {
                                  form.setValue("artStyles", style.label);
                                }}
                              >
                                {style.label}
                                <CheckIcon
                                  className={` ml-auto h-4 w-4 ${
                                    style.label === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  }`}
                                ></CheckIcon>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )}
            ></FormField>

            <Separator className=" w-[75%]" />

            <FormField
              control={form.control}
              name="negativePrompt"
              render={({ field }) => (
                <FormItem className="flex flex-col ">
                  <FormLabel className="text-white text-nowrap text-base">
                    Negative Words:
                  </FormLabel>
                  <div className="-translate-y-[3px]">
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-white/60 border-none w-[90%] resize-none focus-visible:ring-transparent focus-visible:ring-offset-transparent "
                        placeholder="不想出现的元素"
                      ></Input>
                    </FormControl>
                  </div>
                </FormItem>
              )}
            ></FormField>

            <Separator className=" w-[75%]" />

            <FormField
              control={form.control}
              name="stylize"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-4 ">
                  <div className="flex justify-between items-center">
                    <FormLabel className="text-white text-nowrap text-base">
                      Stylize:
                    </FormLabel>

                    <FormControl>
                      <Input
                        className="bg-white/60 border-none py-1 px-2 h-8 focus-visible:ring-offset-transparent focus-visible:ring-transparent  p-1 rounded-lg w-[60px] text-center"
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
                        className=" w-[200px]"
                      ></Slider>
                    </FormControl>
                  </div>
                  <FormMessage></FormMessage>
                </FormItem>
              )}
            ></FormField>

            <Separator className=" w-[75%]" />

            <FormField
              control={form.control}
              name="chaos"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-4 ">
                  <div className="flex justify-between items-center">
                    <FormLabel className="text-white text-nowrap text-base">
                      Chaos:
                    </FormLabel>

                    <FormControl>
                      <Input
                        className="bg-white/60 border-none py-1 px-2 h-8 focus-visible:ring-offset-transparent focus-visible:ring-transparent p-1 rounded-lg w-[60px] text-center"
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
                        className=" w-[200px]"
                      ></Slider>
                    </FormControl>
                  </div>
                  <FormMessage></FormMessage>
                </FormItem>
              )}
            ></FormField>

            <Separator className=" w-[75%]" />

            <FormField
              control={form.control}
              name="seeds"
              render={({ field }) => (
                <FormItem className="flex flex-col ">
                  <FormLabel className="text-white text-nowrap text-base">
                    seeds:
                  </FormLabel>
                  <div className="-translate-y-[3px]">
                    <FormControl>
                      <Input
                        className="bg-white/60 border-none w-[200px] focus-visible:ring-offset-transparent focus-visible:ring-transparent"
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
          </div>

          <div className="styled-scrollbar bg-white/15 overflow-scroll rounded-xl p-8 flex-1 w-full min-w-[560px]  h-full  flex-center">
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem className="flex flex-col  w-full h-full">
                  <Tabs
                    defaultValue="textToImage"
                    className="flex flex-col h-full w-full items-center justify-between"
                  >
                    <TabsList className=" shadow-md bg-white/40 my-2 mt-6 p-4 py-6 gap-2 text-gray-600 rounded-md">
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
                      className=" w-[65%] h-full"
                    >
                      <div
                        className={`w-full h-full gap-4 grid-cols-2 ${
                          imageArr.length === 0 && "flex-center"
                        } grid  items-center justify-center ${
                          isASLessOne && `!flex`
                        }`}
                      >
                        {imageArr.length === 0 && (
                          <div className="min-w-[240px] flex-center overflow-hidden w-fit h-full aspect-square">
                            {
                              <img
                                src={"/pending2.png"}
                                alt="midjourney image"
                                className={`rounded-xl w-[65%]  aspect-square ${
                                  isFetching && "flicker"
                                }`}
                              ></img>
                            }
                          </div>
                        )}

                        {imageArr.length === 4 &&
                          imageArr.map((imgUrl, index) => (
                            <div
                              key={index}
                              className=" flex-center relative  group"
                            >
                              <div className="  min-w-[240px] max-w-[300px] w-full  relative">
                                <img
                                  src={imgUrl}
                                  alt="midjourney image"
                                  className={`rounded-xl min-w-[240px] max-w-[300px] w-full h-full`}
                                ></img>
                                <button
                                  type="button"
                                  className="absolute min-w-[240px] h-full rounded-xl inset-0 bg-transparent hover:bg-transparent"
                                  onClick={() => {
                                    setSelectedIndex(index);
                                    setOpen(true);
                                  }}
                                ></button>
                              </div>

                              <ImageFullView
                                open={open}
                                setOpen={setOpen}
                                tempFormValue={tempFormValue}
                                parentimageArr={imageArr}
                                selectedIndex={selectedIndex || 0}
                                parentTaskId={taskId}
                                parentSeed={seed || ""}
                                finalPrompt={finalPrompt || ""}
                                setParentImgArr={setImageArr}
                              ></ImageFullView>

                              <div className=" rounded-md p-1 absolute bg-black/70 transition-all duration-200  opacity-0  -right-2 top-1 flex group-hover:opacity-100 flex-col items-center justify-center gap-1">
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
                                        className="active:translate-y-[1px] rounded-md hover:stroke-red-500 bg-transparent p-1.5 hover:bg-gray-500/35 transition-all duration-200"
                                      >
                                        <TrashIcon
                                          width={20}
                                          height={20}
                                          color="white"
                                        ></TrashIcon>
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="right">
                                      <p className=" bg-black/70 py-1.5 px-2.5 text-white rounded-md">
                                        删除
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            </div>
                          ))}
                      </div>
                      <div className="flex rounded-md p-1  gap-2 flex-center bg-white/60 mx-4 !mt-4">
                        <div className="flex w-full flex-center">
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
                            disabled={isFetching}
                          >
                            {isFetching ? (
                              <>
                                <span className="flicker">
                                  {imageDatas && imageDatas.task_progress >= 0
                                    ? imageDatas?.task_progress + "%"
                                    : "0%"}
                                </span>
                              </>
                            ) : (
                              "生成"
                            )}
                          </Button>
                        </div>
                      </div>
                      <FormMessage className="ml-4"></FormMessage>
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
                        <div className=" w-full flex rounded-md p-1  gap-2 flex-center bg-white/60 mx-4 !mt-4">
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
                              disabled={isFetching || describeImageUrl == ""}
                              onClick={() => {
                                setUploadImg("");
                                handleDescribe(describeImageUrl);
                              }}
                            >
                              {isFetching ? (
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
                          <div className=" w-[500px] h-[500px] flex-center">
                            <img
                              src={blendImg !== "" ? blendImg : "/pending2.png"}
                              alt="blend image"
                              className={`rounded-md max-w-[100%] max-h-[100%] ${
                                isBlending && "flicker"
                              }`}
                            />
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
                                <SelectTrigger className="bg-white/60 border-none py-1 px-2 h-8 focus:ring-offset-transparent focus:ring-transparent">
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
                            <div className=" mt-4 relative flex flex-wrap w-full flex-center">
                              {blendOrgins.map((image, index) =>
                                index !== 4 ? (
                                  <div className=" w-[120px] h-[120px] mb-2 flex-center">
                                    <img
                                      src={image.src}
                                      alt="blend origin"
                                      className=" max-w-[100%] max-h-[100%]  rounded-md"
                                    />
                                  </div>
                                ) : (
                                  <div className=" absolute translate-x-[50%] translate-y-[50%] top-0 right-[50%]  w-[120px] h-[120px] mb-2 flex-center">
                                    <img
                                      src={image.src}
                                      alt="blend origin"
                                      className=" max-w-[100%] max-h-[100%]  rounded-md"
                                    />
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
                                <>
                                  <span className="flicker">
                                    {imageDatas && imageDatas.task_progress >= 0
                                      ? imageDatas?.task_progress + "%"
                                      : "0%"}
                                  </span>
                                </>
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
        </div>
      </form>
    </Form>
  );
};
