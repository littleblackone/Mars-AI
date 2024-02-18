import { Dialog, DialogContent } from "@/components/ui/dialog";

import { CopyIcon, MagicWandIcon } from "@radix-ui/react-icons";
import { Button } from "../ui/button";
import {
  FetchImageData,
  FullViewData,
  TaskResult,
} from "@/app/interface/ImageData";
import { Badge } from "../ui/badge";
import { debounce, extractArAndModel, handleDownload } from "@/lib/utils";
import { toast } from "sonner";
import UpscaleSvg from "@/components/shared/UpscaleSvg";
import { DownloadIcon } from "lucide-react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useUpscaleImage } from "@/lib/store/useUpscaleImage";

export function ImageFullView({
  selectedIndex,
  parentTaskId,
  tempFormValue,
  parentSeed,
  finalPrompt,
  open,
  setOpen,
  parentimageArr,
  setParentImageArr,
}: FullViewData) {
  const [isFetching, setIsFetching] = useState(false);

  const [imageDatas, setImageDatas] = useState<TaskResult | null>();
  const [imageUrl, setImageUrl] = useState<string>();
  const [upscale2x, setUpscale2x] = useState<boolean>(false);
  const [upscale4x, setUpscale4x] = useState<boolean>(false);
  const [mainImageIndex, setMainImageIndex] = useState<number | undefined>(
    undefined
  );

  const negativeWords = tempFormValue?.negativePrompt?.split(" ");
  let imgIndexList = [0, 1, 2, 3];

  const upscaleImageList = [
    "https://cdn.midjourney.com/4098da5a-9af2-4a11-86ab-202931d8c31b/0_0.webp",
    "https://cdn.midjourney.com/4098da5a-9af2-4a11-86ab-202931d8c31b/0_1.webp",
  ];

  const setImages = useUpscaleImage((state) => state.setImages);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("prompt已复制到剪贴板");
    } catch (error) {
      console.error("Failed to copy: ", error);
    }
  };

  const handleUpscaleImage = debounce(async () => {
    try {
      setIsFetching(true);
      setImageDatas(null);
      let upscaleId: string;
      let isFirstIntervalCompleted: boolean = false;

      const response = await axios.post("/api/upscale", {
        originTaskId: parentTaskId,
        index: selectedIndex + 1 + "",
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
            const responseNew = await axios.post("/api/upscale", {
              originTaskId: taskId,
              index: upscale2x ? "2x" : "4x",
            });
            upscaleId = responseNew.data.task_id;
          }
        } catch (error) {
          console.error("Error ", error);
        }
      }, 1000);

      const intervalId = setInterval(async () => {
        try {
          if (!isFirstIntervalCompleted) return;

          const taskResult: FetchImageData = await axios.post(
            "/api/fetchImage",
            {
              taskId: upscaleId,
            }
          );

          setImageDatas(taskResult.data.task_result);

          if (taskResult.data.status === "finished") {
            setImageUrl(taskResult.data.task_result.image_url);

            parentimageArr[
              mainImageIndex !== undefined ? mainImageIndex : selectedIndex
            ] = taskResult.data.task_result.image_url || "";

            setParentImageArr(parentimageArr);

            clearInterval(intervalId);
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

  useEffect(() => {
    if (upscale2x || upscale4x) {
      // handleUpscaleImage();
      setImages(upscaleImageList[0]);
    }
  }, [upscale2x, upscale4x]);

  useEffect(() => {
    if (isFetching === false) {
      setUpscale2x(false);
      setUpscale4x(false);
    }
  }, [isFetching]);

  useEffect(() => {
    if (imageDatas?.task_progress === 100) {
      setImageDatas(null);
      toast.success("Upscale图片成功");
    }
  }, [imageDatas]);

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (open === false) {
          setMainImageIndex(undefined);
          setUpscale2x(false);
          setUpscale4x(false);
        }
        if (isFetching) {
          setOpen(true);
        } else {
          setOpen(open);
        }
      }}
    >
      <DialogContent className=" !h-[800px]  min-w-[1260px]">
        <div className="flex w-full h-full">
          <div className=" relative flex-1 w-full h-full flex-center bg-gray-300/25 rounded-l-md">
            <Button
              type="button"
              disabled={isFetching}
              variant="outline"
              className="absolute px-2.5 right-2 top-2 active:translate-y-[1px] rounded-md"
              onClick={() => {
                handleDownload(
                  parentimageArr[
                    mainImageIndex !== undefined
                      ? mainImageIndex
                      : selectedIndex
                  ],
                  mainImageIndex !== undefined ? mainImageIndex : selectedIndex
                );
              }}
            >
              <DownloadIcon width={20} height={20} color="black"></DownloadIcon>
            </Button>
            <span
              className={`${
                isFetching && "flicker"
              } absolute p-2.5 right-0 top-10`}
            >
              {imageDatas
                ? imageDatas?.task_progress >= 0 &&
                  imageDatas?.task_progress + "%"
                : ""}
            </span>
            <div
              className={` w-[80%] h-full relative ${isFetching && "hidden"}`}
            >
              <img
                src={
                  parentimageArr[
                    mainImageIndex !== undefined
                      ? mainImageIndex
                      : selectedIndex
                  ]
                }
                className={`w-full h-full ${isFetching && "hidden"}`}
                alt="full view img"
              ></img>
              <div
                className={` absolute right-2 bottom-2 w-fit h-fit ${
                  isFetching && "hidden"
                }`}
              >
                <div className=" flex gap-1">
                  <img
                    src={parentimageArr[0]}
                    className={`w-[5rem] border-2 border-transparent h-full hover:scale-105 transition-all duration-300 cursor-pointer ${
                      imgIndexList[0] ===
                        (mainImageIndex !== undefined
                          ? mainImageIndex
                          : selectedIndex) && "border-2 !border-green-500"
                    }`}
                    alt="full view img"
                    onClick={() => setMainImageIndex(imgIndexList[0])}
                  ></img>
                  <img
                    src={parentimageArr[1]}
                    className={`w-[5rem] border-2 border-transparent   h-full hover:scale-105 transition-all duration-300 cursor-pointer ${
                      imgIndexList[1] ===
                        (mainImageIndex !== undefined
                          ? mainImageIndex
                          : selectedIndex) && "border-2 !border-green-500"
                    }`}
                    alt="full view img"
                    onClick={() => setMainImageIndex(imgIndexList[1])}
                  ></img>
                  <img
                    src={parentimageArr[2]}
                    className={`w-[5rem] border-2 border-transparent  h-full hover:scale-105 transition-all duration-300 cursor-pointer ${
                      imgIndexList[2] ===
                        (mainImageIndex !== undefined
                          ? mainImageIndex
                          : selectedIndex) && "border-2 !border-green-500"
                    }`}
                    alt="full view img"
                    onClick={() => setMainImageIndex(imgIndexList[2])}
                  ></img>
                  <img
                    src={parentimageArr[3]}
                    className={`w-[5rem] border-2 border-transparent  h-full hover:scale-105 transition-all duration-300 cursor-pointer ${
                      imgIndexList[3] ===
                        (mainImageIndex !== undefined
                          ? mainImageIndex
                          : selectedIndex) && "border-2 !border-green-500"
                    }`}
                    alt="full view img"
                    onClick={() => setMainImageIndex(imgIndexList[3])}
                  ></img>
                </div>
              </div>
            </div>
            <img
              src={"/pending2.png"}
              alt="midjourney image"
              className={`hidden w-[75%] h-full aspect-square ${
                isFetching && "flicker !block"
              }`}
            ></img>
          </div>
          <div className=" max-w-[20rem] flex p-2 flex-col  h-full bg-gray-400/25 rounded-r-md">
            <div className=" bg-white p-4 mt-4 rounded-md flex flex-col">
              <div className="flex gap-2  items-center">
                <p className=" text-lg">Prompt</p>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-center h-8 w-8 p-0"
                  onClick={() => handleCopy(finalPrompt)}
                >
                  <CopyIcon height={12} width={12}></CopyIcon>
                </Button>
              </div>
              <p className=" text-sm text-gray-600 leading-5 line-clamp-5">
                {tempFormValue?.prompt}
              </p>

              <div className="flex gap-2 flex-wrap mt-2">
                <Badge className=" bg-gray-300/25 cursor-pointer hover:bg-gray-300/45 transition-all duration-200">
                  <span className=" text-gray-500">ar</span>
                  <span className="ml-1 text-gray-800">
                    {extractArAndModel(tempFormValue?.aspectRatio || "")}
                  </span>
                </Badge>

                <Badge className=" bg-gray-300/25 cursor-pointer hover:bg-gray-300/45 transition-all duration-200">
                  <span className=" text-gray-500">model</span>
                  <span className="ml-1 text-gray-800">
                    {extractArAndModel(tempFormValue?.model || "")}
                  </span>
                </Badge>

                <Badge className=" bg-gray-300/25 cursor-pointer hover:bg-gray-300/45 transition-all duration-200">
                  <span className=" text-gray-500">stylize</span>
                  <span className="ml-1 text-gray-800">
                    {tempFormValue?.stylize}
                  </span>
                </Badge>

                <Badge className=" bg-gray-300/25 cursor-pointer hover:bg-gray-300/45 transition-all duration-200">
                  <span className=" text-gray-500">seed</span>
                  <span className="ml-1 text-gray-800">{parentSeed}</span>
                </Badge>

                <Badge className=" bg-gray-300/25 cursor-pointer hover:bg-gray-300/45 transition-all duration-200">
                  <span className=" text-gray-500">chaos</span>
                  <span className="ml-1 text-gray-800">
                    {tempFormValue?.chaos}
                  </span>
                </Badge>
                {tempFormValue?.negativePrompt &&
                  negativeWords?.map((word) => (
                    <Badge className=" bg-gray-300/25 cursor-pointer hover:bg-gray-300/45 transition-all duration-200">
                      <span className=" text-gray-500">no</span>
                      <span className="ml-1 text-gray-800">{word}</span>
                    </Badge>
                  ))}
              </div>
            </div>
            <div className="flex w-full justify-between h-fit bg-white p-4 mt-4 rounded-md">
              <Button
                type="button"
                variant="outline"
                className="px-2"
                disabled={isFetching}
                onClick={() => {
                  setUpscale2x(true);
                }}
              >
                {isFetching ? (
                  <>
                    <img src="/Spin.svg" alt="spin" width={20} height={20} />
                    <span className="flicker ">Upscaling...&nbsp;</span>
                  </>
                ) : (
                  <>
                    <UpscaleSvg></UpscaleSvg>
                    <span className="ml-1 text-sm">Upscale(2x)</span>
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="px-2"
                disabled={isFetching}
                onClick={() => {
                  setUpscale4x(true);
                }}
              >
                {isFetching ? (
                  <>
                    <img src="/Spin.svg" alt="spin" width={20} height={20} />
                    <span className="flicker ">Upscaling...&nbsp;</span>
                  </>
                ) : (
                  <>
                    <UpscaleSvg></UpscaleSvg>
                    <span className="ml-1 text-sm">Upscale(4x)</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
