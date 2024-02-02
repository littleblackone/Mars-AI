"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageValidation } from "../../lib/validations";
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
import { debounce, generateRandomInteger } from "@/lib/utils";
import axios from "axios";
import Image from "next/image";
import {
  ImageData,
  ImageFormData,
  StyleStatus,
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
import { Textarea } from "../ui/textarea";
import { Slider } from "../ui/slider";
import { Input } from "../ui/input";

export const ImageForm = () => {
  //form data
  const [aspectRatio, setAspectRatio] = useState(" --ar 1:1");
  const [model, setModel] = useState(" --v 5.2");
  const [artStyles, setArtStyles] = useState<string | null>(null);
  const [negativePrompt, setNegativePrompt] = useState("");
  const [seeds, setSeeds] = useState();
  const [speed, setSpeed] = useState(" --fast");
  const [stylize, setStylize] = useState(100);
  const [chaos, setChaos] = useState(0);
  const [prompt, setPrompt] = useState("");
  const [imageNum, setImageNum] = useState("1");
  //fetch data
  const [imageDatas, setImageDatas] = useState<ImageData>();
  //temp data
  const [isFetching, setIsFetching] = useState(false);
  const [tempStylize, setTempStylize] = useState([100]);
  const [tempchaos, setTempChaos] = useState([0]);
  const [tempStyle, setTempStyle] = useState("");

  const [open, setOpen] = useState(false);

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(event.target.value);
  };

  const handleGenerateImage = debounce(async (values: ImageFormData) => {
    try {
      setIsFetching(true);
      const response = await axios.post("/api/imagine", { prompt });
      const taskId = response.data.task_id;

      const intervalId = setInterval(async () => {
        try {
          const taskResult: { data: ImageData } = await axios.post(
            "/api/fetchImage",
            { taskId }
          );

          if (taskResult.data.task_progress === 100) {
            clearInterval(intervalId);
            setImageDatas(taskResult.data);
            setIsFetching(false);
          }
        } catch (error) {
          console.error("Error fetching image:", error);
          setIsFetching(false);
        }
      }, 3000);
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
      speed: " --fast",
      stylize: 100,
      chaos: 0,
      aspectRatio: " --ar 1:1",
      model: " --v 5.2",
      numberOfImage: "1",
      artStyles: "",
    },
  });

  const onSubmit = (values: z.infer<typeof ImageValidation>) => {
    // handleGenerateImage(values);
    console.log(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className=" w-full">
        <div className=" flex items-center flex-1  w-full h-[80vh] hide-scroll">
          <div className=" px-6 py-2 flex-shrink-0 bg-white/15 w-[20rem] h-full flex flex-col justify-between items-start">
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between  w-[200px]">
                  <FormLabel className=" text-nowrap text-base">
                    模型:
                  </FormLabel>
                  <div className=" -translate-y-[3px]">
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="">
                          <SelectValue placeholder="模型"></SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value=" --v 1">v1</SelectItem>
                        <SelectItem value=" --v 2">v2</SelectItem>
                        <SelectItem value=" --v 3">v3</SelectItem>
                        <SelectItem value=" --v 4">v4</SelectItem>
                        <SelectItem value=" --v 5">v5</SelectItem>
                        <SelectItem value=" --v 5.1">v5.1</SelectItem>
                        <SelectItem value=" --v 5.2">v5.2</SelectItem>
                        <SelectItem value=" --v 6">v6</SelectItem>
                        <SelectItem value=" --niji 4">Niji 4</SelectItem>
                        <SelectItem value=" --niji 5">Niji 5</SelectItem>
                        <SelectItem value=" --niji 6">Niji 6</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </FormItem>
              )}
            ></FormField>
            <FormField
              control={form.control}
              name="speed"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between  w-[200px]">
                  <FormLabel className=" text-nowrap text-base">
                    绘图速度:
                  </FormLabel>
                  <div className="-translate-y-[3px]">
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="">
                          <SelectValue placeholder="绘图速度"></SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value=" --fast">快速</SelectItem>
                        <SelectItem value=" --turbo">涡轮</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </FormItem>
              )}
            ></FormField>
            <FormField
              control={form.control}
              name="aspectRatio"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between  w-[200px]">
                  <FormLabel className=" text-nowrap text-base">
                    图片比例:
                  </FormLabel>
                  <div className="-translate-y-[3px]">
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="">
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
            <FormField
              control={form.control}
              name="numberOfImage"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between  w-[200px]">
                  <FormLabel className=" text-nowrap text-base">
                    图片数量:
                  </FormLabel>
                  <div className="-translate-y-[3px]">
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="">
                          <SelectValue placeholder=""></SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </FormItem>
              )}
            ></FormField>

            <FormField
              control={form.control}
              name="artStyles"
              render={({ field }) => (
                <FormItem className=" flex flex-col w-[200px] ">
                  <FormLabel className=" text-nowrap text-base">
                    添加艺术风格:
                  </FormLabel>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className=" justify-center">
                        {tempStyle ? (
                          <span>{tempStyle}</span>
                        ) : (
                          <>
                            <span>风格列表</span>
                          </>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <FormControl>
                      <PopoverContent
                        className="p-0"
                        side="right"
                        align="start"
                      >
                        <Command
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <CommandInput placeholder="探索艺术风格..."></CommandInput>
                          <CommandList>
                            <CommandEmpty>没有找到相关的艺术风格</CommandEmpty>
                            <CommandGroup>
                              {styles.map((style) => (
                                <CommandItem
                                  key={style.value}
                                  value={style.label}
                                  onSelect={(value) => {
                                    setTempStyle(value);
                                    setOpen(false);
                                  }}
                                >
                                  {style.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </FormControl>
                  </Popover>
                </FormItem>
              )}
            ></FormField>

            <FormField
              control={form.control}
              name="negativePrompt"
              render={({ field }) => (
                <FormItem className="flex flex-col ">
                  <FormLabel className=" text-nowrap text-base">
                    否定词:
                  </FormLabel>
                  <div className="-translate-y-[3px]">
                    <FormControl>
                      <Textarea
                        {...field}
                        className=" resize-none"
                        placeholder="请输入你不想图片中出现的元素"
                      ></Textarea>
                    </FormControl>
                  </div>
                </FormItem>
              )}
            ></FormField>

            <FormField
              control={form.control}
              name="stylize"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-4 ">
                  <div className="flex justify-between items-center">
                    <FormLabel className=" text-nowrap text-base">
                      艺术程度:
                    </FormLabel>

                    <FormControl>
                      <Input
                        className="  bg-white/50 p-1 rounded-lg w-[60px] text-center"
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

            <FormField
              control={form.control}
              name="chaos"
              render={({ field }) => (
                <FormItem className="flex flex-col gap-4 ">
                  <div className="flex justify-between items-center">
                    <FormLabel className=" text-nowrap text-base">
                      混乱程度:
                    </FormLabel>

                    <FormControl>
                      <Input
                        className="  bg-white/50 p-1 rounded-lg w-[60px] text-center"
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

            <FormField
              control={form.control}
              name="seeds"
              render={({ field }) => (
                <FormItem className="flex flex-col ">
                  <FormLabel className=" text-nowrap text-base">
                    seeds:
                  </FormLabel>
                  <div className="-translate-y-[3px]">
                    <FormControl>
                      <Input
                        className="w-[200px]"
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

          <div className=" flex-1 w-full  bg-white/25 overflow-hidden h-full flex-center">
            {/* <Image
              src={
                imageDatas?.task_progress === 100
                  ? imageDatas.image_url
                  : "/loading.jpg"
              }
              width={320}
              height={320}
              alt="midjourney image"
            ></Image> */}
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem className="flex flex-col ">
                  <Image
                    src={"/loading.jpg"}
                    width={320}
                    height={320}
                    alt="midjourney image"
                  ></Image>
                  <FormControl>
                    <Input
                      className=""
                      placeholder="让你的想象变成事实......"
                      {...field}
                    ></Input>
                  </FormControl>
                  <FormMessage></FormMessage>
                  <Button type="submit" size="lg" disabled={isFetching}>
                    生成
                  </Button>
                </FormItem>
              )}
            ></FormField>
          </div>
          <div className=" w-[20rem] h-full flex-shrink-0 bg-slate-400"></div>
        </div>
      </form>
    </Form>
  );
};
