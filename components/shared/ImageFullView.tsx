import { Dialog, DialogContent } from "@/components/ui/dialog";

import {
  CopyIcon,
  PinTopIcon,
  GearIcon,
  PinBottomIcon,
  PinRightIcon,
  PinLeftIcon,
  MoveIcon,
} from "@radix-ui/react-icons";
import { Button } from "../ui/button";
import {
  FetchImageData,
  FullViewData,
  TaskResult,
} from "@/app/interface/ImageData";
import { Badge } from "../ui/badge";
import {
  debounce,
  extractArAndModel,
  handleDownload,
  parseAspectRatio,
} from "@/lib/utils";
import { toast } from "sonner";
import UpscaleSvg from "@/components/shared/UpscaleSvg";
import { DownloadIcon, ZoomIn } from "lucide-react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useUpscaleImage } from "@/lib/store/useUpscaleImage";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { PopoverClose } from "@radix-ui/react-popover";
import { useZoomImages } from "@/lib/store/useZoomImages";
import { useExpandImages } from "@/lib/store/useExpandImages";
import { after } from "node:test";

export function ImageFullView({
  selectedIndex,
  parentTaskId,
  tempFormValue,
  parentSeed,
  finalPrompt,
  open,
  setOpen,
  parentimageArr,
}: FullViewData) {
  const [isFetching, setIsFetching] = useState(false);

  const [isDisabledUpscale, setIsDisabledUpscale] = useState(false);
  const [isDisabledZoom, setIsDisabledZoom] = useState(false);
  const [isDisabledExpandLeftAndRight, setIsDisabledExpandLeftAndRight] =
    useState(false);
  const [isDisabledExpandUpAndDown, setIsDisabledExpandUpAndDown] =
    useState(false);

  const [isUpscaling, setIsUpscaling] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);

  const [isUpscaled, setIsUpscaled] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const [isExpandUp, setIsExpandUp] = useState(false);
  const [isExpandDown, setIsExpandDown] = useState(false);
  const [isExpandLeft, setIsExpandLeft] = useState(false);
  const [isExpandRight, setIsExpandRight] = useState(false);

  const [imageDatas, setImageDatas] = useState<TaskResult | null>();
  const [imageUrl, setImageUrl] = useState<string>("");
  const [upscale2x, setUpscale2x] = useState<boolean>(false);
  const [upscale4x, setUpscale4x] = useState<boolean>(false);
  const [upscaleSub, setUpscaleSub] = useState<boolean>(false);
  const [upscaleCreative, setUpscaleCreative] = useState<boolean>(false);

  const [mainImageIndex, setMainImageIndex] = useState<number | undefined>(
    undefined
  );
  const [expandDirction, setExpandDirction] = useState<string>("");
  const [zoomValue, setZoomValue] = useState<string>("");

  const [isASGreaterThanOne, setIsASGreaterThanOne] = useState<boolean>(false);
  const [isASEQOne, setIsASEQOne] = useState<boolean>(false);
  const [isASLessOne, setIsASLessOne] = useState<boolean>(false);

  const negativeWords = tempFormValue?.negativePrompt?.split(" ");
  tempFormValue?.model;
  let imgIndexList = [0, 1, 2, 3];

  const setUpscaleImages = useUpscaleImage((state) => state.setImages);
  const setZoomImages = useZoomImages((state) => state.setImages);
  const setExpandImages = useExpandImages((state) => state.setImages);

  const model = tempFormValue?.model?.split(" --")[1];
  const aspectRatio = tempFormValue?.aspectRatio;

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("prompt已复制到剪贴板");
    } catch (error) {
      console.error("Failed to copy: ", error);
    }
  };
  const handleZoom = debounce(async (zoomValue: string) => {
    try {
      setIsZooming(true);
      setImageDatas(null);
      let zoomId: string;
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
            const responseNew = await axios.post("/api/outPaint", {
              originTaskId: taskId,
              zoomRatio: zoomValue,
            });
            zoomId = responseNew.data.task_id;
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
              taskId: zoomId,
            }
          );

          setImageDatas(taskResult.data.task_result);

          if (taskResult.data.status === "finished") {
            clearInterval(intervalId);
            setZoomImages(taskResult.data.task_result.image_url);
            setImageDatas(taskResult.data.task_result);
            setIsZooming(false);
            setIsZoomed(true);
          }
        } catch (error) {
          console.error("Error fetching image:", error);
        }
      }, 2000);
    } catch (error) {
      console.error("Error sending prompt:", error);
    }
  }, 1000);

  const handleExpand = debounce(async (expandValue: string) => {
    try {
      setIsExpanding(true);
      setImageDatas(null);
      let expandId: string;
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
            const responseNew = await axios.post("/api/pan", {
              originTaskId: taskId,
              direction: expandValue,
            });
            expandId = responseNew.data.task_id;
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
              taskId: expandId,
            }
          );

          setImageDatas(taskResult.data.task_result);

          if (taskResult.data.status === "finished") {
            clearInterval(intervalId);
            setExpandImages(taskResult.data.task_result.image_url);
            setImageDatas(taskResult.data.task_result);
            setIsExpanding(false);
            setIsExpanded(true);
          }
        } catch (error) {
          console.error("Error fetching image:", error);
        }
      }, 2000);
    } catch (error) {
      console.error("Error sending prompt:", error);
    }
  }, 1000);

  const handleUpscaleImage = debounce(async () => {
    try {
      setIsUpscaling(true);
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

          const index =
            model === "v 5.2"
              ? upscale2x
                ? "2x"
                : "4x"
              : upscaleSub
              ? "subtle"
              : "creative";

          if (taskResult.data.status === "finished") {
            clearInterval(upscaleIntervalId);
            isFirstIntervalCompleted = true;
            const responseNew = await axios.post("/api/upscale", {
              originTaskId: taskId,
              index,
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
            clearInterval(intervalId);
            setUpscaleImages(taskResult.data.task_result.image_url);
            setImageDatas(taskResult.data.task_result);
            setIsUpscaling(false);
            setIsUpscaled(true);
          }
        } catch (error) {
          console.error("Error fetching image:", error);
        }
      }, 2000);
    } catch (error) {
      console.error("Error sending prompt:", error);
    }
  }, 1000);

  useEffect(() => {
    if (tempFormValue) {
      const { greaterThanOne, equalToOne, lessThanOne } = parseAspectRatio(
        aspectRatio || ""
      );
      setIsASEQOne(equalToOne);
      setIsASGreaterThanOne(greaterThanOne);
      setIsASLessOne(lessThanOne);
    }
  }, [tempFormValue, isASEQOne, isASGreaterThanOne, isASLessOne]);
  
  useEffect(() => {
    if (imageDatas?.image_url) {
      setImageUrl(imageDatas?.image_url);
    }
  }, [imageDatas, imageUrl]);

  useEffect(() => {
    setIsFetching(isUpscaling || isZooming || isExpanding);
    setIsDisabledUpscale(isFetching || isExpanded);
    setIsDisabledZoom(isFetching || isUpscaled);
    setIsDisabledExpandLeftAndRight(
      isDisabledZoom || isExpandUp || isExpandDown
    );
    setIsDisabledExpandUpAndDown(
      isDisabledZoom || isExpandLeft || isExpandRight
    );
  }, [
    isUpscaling,
    isZooming,
    isExpanding,
    isExpanded,
    isUpscaled,
    isExpandDown,
    isExpandLeft,
    isExpandRight,
    isExpandUp,
    isFetching,
    isDisabledZoom,
  ]);

  useEffect(() => {
    if (expandDirction !== "") {
      handleExpand(expandDirction);
    }
  }, [expandDirction]);

  useEffect(() => {
    if (upscale2x || upscale4x || upscaleCreative || upscaleSub) {
      handleUpscaleImage();
    }
  }, [upscale2x, upscale4x, upscaleSub, upscaleCreative]);

  useEffect(() => {
    if (isUpscaling === false) {
      setUpscale2x(false);
      setUpscale4x(false);
      setUpscaleCreative(false);
      setUpscaleSub(false);
    }
  }, [isUpscaling]);

  const initializeValue = () => {
    setMainImageIndex(undefined);
    setImageUrl("");
    setExpandDirction("");
    setImageDatas(null);

    setIsUpscaled(false);
    setIsExpanded(false);
    setIsZoomed(false);

    setIsExpandDown(false);
    setIsExpandUp(false);
    setIsExpandRight(false);
    setIsExpandLeft(false);

    setUpscale2x(false);
    setUpscale4x(false);
    setUpscaleCreative(false);
    setUpscaleSub(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (open === false) {
          initializeValue();
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
              disabled={isUpscaling || isZooming || isExpanding}
              variant="outline"
              className="absolute px-2.5 right-2 top-2 active:translate-y-[1px] rounded-md"
              onClick={() => {
                handleDownload(
                  imageUrl !== ""
                    ? imageUrl
                    : parentimageArr[
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
                (isUpscaling || isZooming || isExpanding) && "flicker"
              } absolute p-2.5 right-0 top-10`}
            >
              {imageDatas
                ? imageDatas?.task_progress >= 0 &&
                  imageDatas?.task_progress + "%"
                : ""}
            </span>
            <div
              className={`  h-auto relative ${isFetching && "hidden"} ${
                isASEQOne && `w-[80%]`
              } ${isASLessOne && `w-[45%]`} ${isASGreaterThanOne && `w-[80%]`}`}
            >
              <img
                src={
                  imageUrl !== ""
                    ? imageUrl
                    : parentimageArr[
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
                  (isFetching || imageUrl !== "") && "hidden"
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
              <p className=" text-sm text-gray-600 leading-5 line-clamp-3">
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
            <div className="flex flex-col gap-2 w-full justify-between h-fit bg-white p-4 mt-4 rounded-md">
              <Button
                type="button"
                variant="outline"
                className="px-2"
                disabled={isDisabledUpscale}
                onClick={() => {
                  if (model == "v 5.2") {
                    setUpscale2x(true);
                  } else {
                    setUpscaleSub(true);
                  }
                }}
              >
                {isUpscaling ? (
                  <>
                    <img src="/Spin.svg" alt="spin" width={20} height={20} />
                    <span className="flicker ">Upscaling...&nbsp;</span>
                  </>
                ) : (
                  <>
                    <UpscaleSvg></UpscaleSvg>
                    <span className="ml-1 text-sm">
                      {model === "v 5.2" ? `Upscale(2x)` : `Upscale(subtle)`}
                    </span>
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="px-2"
                disabled={isDisabledUpscale}
                onClick={() => {
                  if (model == "v 5.2") {
                    setUpscale4x(true);
                  } else {
                    setUpscaleCreative(true);
                  }
                }}
              >
                {isUpscaling ? (
                  <>
                    <img src="/Spin.svg" alt="spin" width={20} height={20} />
                    <span className="flicker ">Upscaling...&nbsp;</span>
                  </>
                ) : (
                  <>
                    <UpscaleSvg></UpscaleSvg>
                    <span className="ml-1 text-sm">
                      {model === "v 5.2" ? `Upscale(4x)` : `Upscale(creative)`}
                    </span>
                  </>
                )}
              </Button>
            </div>

            <div className="flex flex-col gap-2 w-full justify-between h-fit bg-white p-4 mt-4 rounded-md">
              <Button
                type="button"
                variant="outline"
                className="px-2"
                disabled={isDisabledZoom}
                onClick={() => {
                  handleZoom("1.5");
                }}
              >
                {isZooming ? (
                  <>
                    <img src="/Spin.svg" alt="spin" width={20} height={20} />
                    <span className="flicker ">Zooming...&nbsp;</span>
                  </>
                ) : (
                  <>
                    <ZoomIn className=" scale-75"></ZoomIn>
                    <span className="ml-1 text-sm">Zoom out(1.5x)</span>
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="px-2"
                disabled={isDisabledZoom}
                onClick={() => {
                  handleZoom("2");
                }}
              >
                {isZooming ? (
                  <>
                    <img src="/Spin.svg" alt="spin" width={20} height={20} />
                    <span className="flicker ">Zooming...&nbsp;</span>
                  </>
                ) : (
                  <>
                    <ZoomIn className=" scale-90"></ZoomIn>
                    <span className="ml-1 text-sm">Zoom out(2x)</span>
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                className={`px-2 hidden ${isZoomed && "block"}`}
                disabled={isDisabledZoom}
                onClick={() => {
                  handleZoom("1");
                }}
              >
                {isZooming ? (
                  <>
                    <img src="/Spin.svg" alt="spin" width={20} height={20} />
                    <span className="flicker ">Zooming...&nbsp;</span>
                  </>
                ) : (
                  <>
                    <MoveIcon className=" scale-90"></MoveIcon>
                    <span className="ml-1 text-sm">Make Square</span>
                  </>
                )}
              </Button>

              <Popover>
                <PopoverTrigger>
                  <Button
                    type="button"
                    variant="outline"
                    className="px-2 w-full"
                    disabled={isDisabledZoom}
                  >
                    {isZooming ? (
                      <>
                        <GearIcon className="gear-icon"></GearIcon>
                        <span className="flicker ">Zooming...&nbsp;</span>
                      </>
                    ) : (
                      <>
                        <GearIcon></GearIcon>
                        <span className="ml-1 text-sm">Custom Zoom</span>
                      </>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className=" w-72 flex flex-col gap-2">
                  <Label htmlFor="ZoomValue">{`Zoom Value (1,2]`}</Label>
                  <Input
                    type="number"
                    min={1.01}
                    max={2}
                    step={0.01}
                    onChange={(e) => setZoomValue(e.target.value + "")}
                    className="focus-visible:ring-transparent focus-visible:ring-offset-transparent"
                  />
                  <PopoverClose
                    onClick={() => {
                      handleZoom(zoomValue);
                    }}
                    className=" p-2  rounded-md bg-black/80 text-white transition-all
                   duration-200 hover:bg-black/70"
                  >
                    确定
                  </PopoverClose>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-col gap-2 w-full  h-fit bg-white p-4 mt-4 rounded-md">
              <Button
                type="button"
                variant="outline"
                className="px-2"
                disabled={isDisabledExpandUpAndDown}
                onClick={() => {
                  setExpandDirction("up");
                  setIsExpandUp(true);
                  setIsASLessOne(true);
                  setIsASEQOne(false);
                  setIsASGreaterThanOne(false);
                }}
              >
                {isExpanding ? (
                  <>
                    <img src="/Spin.svg" alt="spin" width={20} height={20} />
                    <span className="flicker ">Expanding...&nbsp;</span>
                  </>
                ) : (
                  <>
                    <span className="ml-1 text-sm">Expand</span>
                    <PinTopIcon className=" scale-125 ml-2"></PinTopIcon>
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="px-2"
                disabled={isDisabledExpandUpAndDown}
                onClick={() => {
                  setExpandDirction("down");
                  setIsExpandDown(true);
                  setIsASLessOne(true);
                  setIsASEQOne(false);
                  setIsASGreaterThanOne(false);
                }}
              >
                {isExpanding ? (
                  <>
                    <img src="/Spin.svg" alt="spin" width={20} height={20} />
                    <span className="flicker ">Expanding...&nbsp;</span>
                  </>
                ) : (
                  <>
                    <span className="ml-1 text-sm">Expand</span>
                    <PinBottomIcon className=" scale-125 ml-2"></PinBottomIcon>
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="px-2"
                disabled={isDisabledExpandLeftAndRight}
                onClick={() => {
                  setExpandDirction("right");
                  setIsExpandRight(true);
                  setIsASGreaterThanOne(true);
                  setIsASEQOne(false);
                  setIsASLessOne(false);
                }}
              >
                {isExpanding ? (
                  <>
                    <img src="/Spin.svg" alt="spin" width={20} height={20} />
                    <span className="flicker ">Expanding...&nbsp;</span>
                  </>
                ) : (
                  <>
                    <span className="ml-1 text-sm">Expand</span>
                    <PinRightIcon className=" scale-125 ml-2"></PinRightIcon>
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="px-2"
                disabled={isDisabledExpandLeftAndRight}
                onClick={() => {
                  setExpandDirction("left");
                  setIsExpandLeft(true);
                  setIsASGreaterThanOne(true);
                  setIsASEQOne(false);
                  setIsASLessOne(false);
                }}
              >
                {isExpanding ? (
                  <>
                    <img src="/Spin.svg" alt="spin" width={20} height={20} />
                    <span className="flicker ">Expanding...&nbsp;</span>
                  </>
                ) : (
                  <>
                    <span className="ml-1 text-sm">Expand</span>
                    <PinLeftIcon className=" scale-125 ml-2"></PinLeftIcon>
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
