"use client";
import { useEffect, useState } from "react";
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
  SelectItem,
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
import { CheckIcon, DownloadIcon } from "lucide-react";
import { Separator } from "../ui/separator";

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

  const setOriginImages = useOriginImage((state) => state.setImages);
  const setVaryImages = useVaryImage((state) => state.setImages);

  const testOriginImageList = [
    "https://cdn.midjourney.com/ffd8ffcd-3abf-4349-831b-71a79b682d6f/0_0.webp",
    "https://cdn.midjourney.com/ffd8ffcd-3abf-4349-831b-71a79b682d6f/0_1.webp",
    "https://cdn.midjourney.com/ffd8ffcd-3abf-4349-831b-71a79b682d6f/0_2.webp",
    "https://cdn.midjourney.com/ffd8ffcd-3abf-4349-831b-71a79b682d6f/0_3.webp",
  ];
  // const testOriginImageList = [
  //   "https://cdn.midjourney.com/25f43b70-1a37-4ab7-bea2-6e65ae903fb1/0_0.webp",
  //   "https://cdn.midjourney.com/25f43b70-1a37-4ab7-bea2-6e65ae903fb1/0_1.webp",
  //   "https://cdn.midjourney.com/25f43b70-1a37-4ab7-bea2-6e65ae903fb1/0_2.webp",
  //   "https://cdn.midjourney.com/25f43b70-1a37-4ab7-bea2-6e65ae903fb1/0_3.webp",
  // ];
  // const testOriginImageList = [
  //   "https://cdn.midjourney.com/ca9a11c6-fca4-4a73-80c7-241cdc22eff1/0_0.webp",
  //   "https://cdn.midjourney.com/ca9a11c6-fca4-4a73-80c7-241cdc22eff1/0_0.webp",
  //   "https://cdn.midjourney.com/ca9a11c6-fca4-4a73-80c7-241cdc22eff1/0_0.webp",
  //   "https://cdn.midjourney.com/ca9a11c6-fca4-4a73-80c7-241cdc22eff1/0_0.webp",
  // ];

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
          const prompts = taskResult.data.task_result.message;
          const promptStringArray = convertStringToArray(prompts);

          setGeneratePrompts(promptStringArray);
          clearInterval(intervalId);
          setIsFetching(false);
        }
      }, 1000);
    } catch (error) {
      toast.error("请求失败，请查看图片地址格式是否正确");
      setIsFetching(false);
      console.error("Error fetching seed:", error);
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
    // handleGenerateImage(finalPrompt);
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
                    defaultValue="ImageToText"
                    className="flex flex-col flex-center"
                  >
                    <TabsList className=" shadow-md bg-white/40 my-2 p-4 py-6 gap-2 text-gray-600 rounded-md">
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
                      className=" w-[50%] h-full"
                    >
                      <div
                        className={`w-full h-full gap-4 grid-cols-2 ${
                          imageArr.length === 0 && ""
                        } grid  items-center justify-center ${
                          isASLessOne && `!flex`
                        }`}
                      >
                        {/* {imageArr.length === 0 && (
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
                    )} */}

                        {testOriginImageList.map((imgUrl, index) => (
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
                            ></ImageFullView>

                            <div className=" rounded-md p-1 absolute bg-black/70 transition-all duration-200  opacity-0  right-1 top-1 flex group-hover:opacity-100 flex-col items-center justify-center gap-1">
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
                    <TabsContent
                      value="ImageToText"
                      className=" w-[60%] h-full"
                    >
                      <div className=" w-full h-full flex flex-col items-center justify-center">
                        <div className=" w-full h-full bg-white/35 rounded-md gap-4 p-6 flex flex-col items-center justify-between">
                          {generatePrompts &&
                            generatePrompts.length === 4 &&
                            generatePrompts.map((prompt, index) => (
                              <div className=" flex gap-2 w-full">
                                <div className="leading-6 w-full px-4 text-sm divx-4 font-medium text-gray-600 bg-white/30  h-[136px] overflow-scroll hide-scrollbar p-2 rounded-md">
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
                        <div className=" w-full flex rounded-md p-1  gap-2 flex-center bg-white/60 mx-4 !mt-8">
                          <div className="flex w-full flex-center">
                            <Input
                              onChange={(e) =>
                                setDescribeImageUrl(e.target.value)
                              }
                              className=" bg-transparent border-none p-[1.5rem] focus-visible:ring-transparent focus-visible:ring-offset-transparent"
                              placeholder="在线图片地址(格式后缀结尾,如:https://example.com/image.jpg)"
                            ></Input>

                            <Button
                              type="button"
                              size="lg"
                              className="w-fit button-85 ml-2  text-lg"
                              disabled={isFetching}
                              onClick={() => {
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
                    <TabsContent value="ImageToImage">
                      <div></div>
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
