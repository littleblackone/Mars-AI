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
import { debounce, generateFinalPrompt } from "@/lib/utils";
import axios from "axios";
import Image from "next/image";
import { ImageData } from "@/app/interface/ImageData";
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
import { CheckIcon } from "lucide-react";
import { Separator } from "../ui/separator";

export const ImageForm = () => {
  //fetch data
  const [imageDatas, setImageDatas] = useState<ImageData | null>();
  //temp data
  const [isFetching, setIsFetching] = useState(false);
  const [imageArr, setImageArr] = useState<string[]>([]);

  const handleGenerateImage = debounce(async (prompt: string) => {
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
          setImageDatas(taskResult.data);
          console.log(imageDatas?.task_progress);

          if (taskResult.data.task_progress === 100) {
            clearInterval(intervalId);
            setImageDatas(taskResult.data);
            setImageArr(taskResult.data.image_urls);
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

  const onSubmit = (values: z.infer<typeof ImageValidation>) => {
    setImageDatas(null);
    setImageArr([]);
    const finalPrompt = generateFinalPrompt(values);
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
                    模型:
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

            <Separator className=" w-[75%]" />

            <FormField
              control={form.control}
              name="aspectRatio"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between  w-[200px]">
                  <FormLabel className="text-white text-nowrap text-base">
                    图片比例:
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
                    添加艺术风格:
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
                              <span>风格列表</span>
                            </>
                          )}
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
                    否定词:
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
                      艺术程度:
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
                      混乱程度:
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

          <div className="hide-scrollbar bg-white/15 overflow-scroll rounded-xl p-8 flex-1 w-full min-w-[560px]  h-full  flex-center">
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem className="flex flex-col  w-full h-full">
                  <div
                    className={`w-full h-full gap-4 grid-cols-2 ${
                      imageArr.length === 0 && "!flex-center"
                    } grid grid-rows-[repeat(auto,minmax(min-content,1fr))] items-center justify-center`}
                  >
                    <div className="min-w-[240px] flex-center overflow-hidden w-fit h-full aspect-square">
                      {imageArr.length === 0 && (
                        <img
                          src={"/pending2.png"}
                          alt="midjourney image"
                          className={`rounded-xl w-[65%] h-[65%] ${
                            isFetching && "flicker"
                          }`}
                        ></img>
                      )}
                    </div>
                    {imageArr.length === 4 &&
                      imageArr.map(
                        (imgUrl) =>
                          imgUrl && (
                            <div className=" flex-center overflow-hidden">
                              <img
                                src={imgUrl}
                                alt="midjourney image"
                                className={`rounded-xl min-w-[240px] w-[70%] h-[70%] aspect-square`}
                              ></img>
                            </div>
                          )
                      )}
                  </div>

                  <div className=" flex gap-4 mx-4 !mt-auto !mb-2 flex-col flex-center">
                    <FormControl>
                      <Textarea
                        className=" mt-6 bg-white/60 border-none focus-visible:ring-transparent focus-visible:ring-offset-transparent"
                        placeholder="让你的想象变成事实......"
                        {...field}
                      ></Textarea>
                    </FormControl>
                    <FormMessage></FormMessage>
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full button-85 mb-4 text-lg"
                      disabled={isFetching}
                    >
                      {isFetching ? "生成中...  " : "生成"}
                      {isFetching ? (
                        <span className="flicker">
                          {imageDatas?.task_progress}%
                        </span>
                      ) : (
                        ""
                      )}
                    </Button>
                  </div>
                </FormItem>
              )}
            ></FormField>
          </div>
          <div className=" w-[20rem] h-full flex-shrink-0 "></div>
        </div>
      </form>
    </Form>
  );
};
