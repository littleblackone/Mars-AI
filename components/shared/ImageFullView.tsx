import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";

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
  Options,
  TaskResult,
} from "@/lib/interface/ImageData";
import { Badge } from "../ui/badge";
import {
  cropImageIntoFour,
  debounce,
  extractArAndModel,
  extractOptions,
  handleCopy,
  handleDownloadBase64,
  handleGetSeed,
} from "@/lib/utils";

import UpscaleSvg from "@/components/shared/UpscaleSvg";
import { DownloadIcon, X, ZoomIn } from "lucide-react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useUpscaleImage } from "@/lib/store/useUpscaleImage";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { PopoverClose } from "@radix-ui/react-popover";
import { useZoomImages } from "@/lib/store/useZoomImages";
import { useExpandImages } from "@/lib/store/useExpandImages";
import { useIsUpscaled } from "@/lib/store/useIsUpscaled";

export function ImageFullView({
  selectedIndex,
  parentTaskId,
  tempFormValue,
  parentSeed,
  finalPrompt,
  open,
  setOpen,
  parentimageArr,
  setParentImgArr,
  setParentSeed,
  setOriginTaskId,
  manualPrompt,
}: FullViewData) {
  const [isFetching, setIsFetching] = useState(false);

  const [isUpscaling, setIsUpscaling] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);

  const [upscale2x, setUpscale2x] = useState<boolean>(false);
  const [upscale4x, setUpscale4x] = useState<boolean>(false);
  const [upscaleSub, setUpscaleSub] = useState<boolean>(false);
  const [upscaleCreative, setUpscaleCreative] = useState<boolean>(false);

  const [mainImageIndex, setMainImageIndex] = useState<number | undefined>(
    undefined
  );
  const [expandDirction, setExpandDirction] = useState<string>("");
  const [zoomValue, setZoomValue] = useState<string>("");

  let imgIndexList = [0, 1, 2, 3];

  const setUpscaleImages = useUpscaleImage((state) => state.setImages);
  const setZoomImages = useZoomImages((state) => state.setImages);
  const setExpandImages = useExpandImages((state) => state.setImages);

  const isUpscaled = useIsUpscaled((state) => state.isUpscaled);
  const setIsUpscaled = useIsUpscaled((state) => state.setIsUpscaled);

  const model = tempFormValue?.model?.split(" --")[1];
  const option: Options = extractOptions(manualPrompt);
  const formAS = extractArAndModel(tempFormValue?.aspectRatio || "");
  const formModel = extractArAndModel(tempFormValue?.model || "");

  // parentimageArr = [
  //   "https://cdn.midjourney.com/ffd8ffcd-3abf-4349-831b-71a79b682d6f/0_0.webp",
  //   "https://cdn.midjourney.com/ffd8ffcd-3abf-4349-831b-71a79b682d6f/0_1.webp",
  //   "https://cdn.midjourney.com/ffd8ffcd-3abf-4349-831b-71a79b682d6f/0_2.webp",
  //   "https://cdn.midjourney.com/ffd8ffcd-3abf-4349-831b-71a79b682d6f/0_3.webp",
  // ];

  const handleZoom = debounce(async (zoomValue: string) => {
    try {
      setIsZooming(true);

      let zoomId: string = "";
      let isFirstIntervalCompleted: boolean = false;

      const response = await axios.post("/api/upscale", {
        originTaskId: parentTaskId,
        index: mainImageIndex
          ? mainImageIndex + 1 + ""
          : selectedIndex + 1 + "",
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
          if (isFirstIntervalCompleted === false || zoomId === "") return;

          const taskResult: FetchImageData = await axios.post(
            "/api/fetchImage",
            {
              taskId: zoomId,
            }
          );

          if (taskResult.data.status === "finished") {
            clearInterval(intervalId);
            setOriginTaskId(taskResult.data.task_id);
            const bast64ImgArr = await cropImageIntoFour(
              taskResult.data.task_result.image_url
            );

            setParentImgArr(bast64ImgArr);
            setZoomImages(bast64ImgArr);

            await handleGetSeed(zoomId, setParentSeed);

            setIsZooming(false);
          }
        } catch (error) {
          console.error("Error fetching image:", error);
        }
      }, 1000);
    } catch (error) {
      console.error("Error sending prompt:", error);
    }
  }, 1000);

  const handleExpand = debounce(async (expandValue: string) => {
    try {
      setIsExpanding(true);

      let expandId: string = "";
      let isFirstIntervalCompleted: boolean = false;

      const response = await axios.post("/api/upscale", {
        originTaskId: parentTaskId,
        index: mainImageIndex
          ? mainImageIndex + 1 + ""
          : selectedIndex + 1 + "",
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
          if (isFirstIntervalCompleted === false || expandId === "") return;

          const taskResult: FetchImageData = await axios.post(
            "/api/fetchImage",
            {
              taskId: expandId,
            }
          );

          if (taskResult.data.status === "finished") {
            clearInterval(intervalId);
            setOriginTaskId(taskResult.data.task_id);
            const bast64ImgArr = await cropImageIntoFour(
              taskResult.data.task_result.image_url
            );

            setParentImgArr(bast64ImgArr);
            setExpandImages(bast64ImgArr);

            await handleGetSeed(expandId, setParentSeed);

            setIsExpanding(false);
          }
        } catch (error) {
          console.error("Error fetching image:", error);
        }
      }, 1000);
    } catch (error) {
      console.error("Error sending prompt:", error);
    }
  }, 1000);

  const handleUpscaleImage = debounce(async () => {
    try {
      setIsUpscaling(true);

      let upscaleId: string;
      let isFirstIntervalCompleted: boolean = false;

      const response = await axios.post("/api/upscale", {
        originTaskId: parentTaskId,
        index: mainImageIndex
          ? mainImageIndex + 1 + ""
          : selectedIndex + 1 + "",
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
          if (isFirstIntervalCompleted === false) return;

          const taskResult: FetchImageData = await axios.post(
            "/api/fetchImage",
            {
              taskId: upscaleId,
            }
          );

          if (taskResult.data.status === "finished") {
            clearInterval(intervalId);
            setIsUpscaled(true);
            setUpscaleImages(taskResult.data.task_result.image_url);

            setIsUpscaling(false);
          }
        } catch (error) {
          console.error("Error fetching image:", error);
        }
      }, 1000);
    } catch (error) {
      console.error("Error sending prompt:", error);
    }
  }, 1000);

  useEffect(() => {
    setIsFetching(isUpscaling || isZooming || isExpanding);
  }, [isUpscaling, isZooming, isExpanding]);

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

    setExpandDirction("");

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

        setOpen(open);
      }}
    >
      <DialogContent
        onPointerDownOutside={(e) => {
          if (isFetching) {
            e.preventDefault();
          }
        }}
        className=" !h-[800px]  min-w-[1260px]"
      >
        <div className="flex w-full h-full">
          <div className=" relative flex-1 w-full h-full flex-center bg-gray-300/25 rounded-l-md">
            <Button
              type="button"
              disabled={isFetching}
              variant="outline"
              className="absolute px-2.5 right-2 top-2 active:translate-y-[1px] rounded-md"
              onClick={() => {
                handleDownloadBase64(
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

            <div
              className={` w-[712px] h-[712px] flex-center ${
                isFetching && "hidden"
              }`}
            >
              <img
                src={
                  parentimageArr[
                    mainImageIndex !== undefined
                      ? mainImageIndex
                      : selectedIndex
                  ]
                }
                className={` max-w-[100%] max-h-[100%] ${
                  isFetching && "hidden"
                }`}
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
              <img
                src={"/pending2.png"}
                alt="midjourney image"
                className={`hidden w-full h-full aspect-square ${
                  isFetching && "flicker !block"
                }`}
              ></img>
            </div>
          </div>
          <div className=" max-w-[20rem] flex p-2 flex-col  h-full bg-gray-400/25 rounded-r-md">
            <div className=" bg-white p-4 mt-4 rounded-md flex flex-col">
              <div className="flex gap-2  items-center">
                <p className=" text-lg">Prompt</p>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-center h-8 w-8 p-0"
                  onClick={() =>
                    handleCopy(finalPrompt !== "" ? finalPrompt : manualPrompt)
                  }
                >
                  <CopyIcon height={12} width={12}></CopyIcon>
                </Button>
              </div>
              <p className=" text-sm text-gray-600 leading-5 line-clamp-4">
                {tempFormValue?.prompt || manualPrompt}
              </p>

              <div className="flex gap-2 flex-wrap mt-2 h-[52px] overflow-y-scroll hide-scrollbar">
                <Badge className=" bg-gray-300/25 cursor-pointer hover:bg-gray-300/45 transition-all duration-200">
                  <span className=" text-gray-500">ar</span>
                  <span className="ml-1 text-gray-800">
                    {formAS !== "" ? formAS : option.AspectRatio}
                  </span>
                </Badge>

                <Badge className=" bg-gray-300/25 cursor-pointer hover:bg-gray-300/45 transition-all duration-200">
                  <span className=" text-gray-500">model</span>
                  <span className="ml-1 text-gray-800">
                    {formModel !== "" ? formModel : option.Version}
                  </span>
                </Badge>

                <Badge className=" bg-gray-300/25 cursor-pointer hover:bg-gray-300/45 transition-all duration-200">
                  <span className=" text-gray-500">stylize</span>
                  <span className="ml-1 text-gray-800">
                    {tempFormValue?.stylize || option.Stylize}
                  </span>
                </Badge>

                <Badge className=" bg-gray-300/25 cursor-pointer hover:bg-gray-300/45 transition-all duration-200">
                  <span className=" text-gray-500">seed</span>
                  <span className="ml-1 text-gray-800">{parentSeed}</span>
                </Badge>

                <Badge className=" bg-gray-300/25 cursor-pointer hover:bg-gray-300/45 transition-all duration-200">
                  <span className=" text-gray-500">chaos</span>
                  <span className="ml-1 text-gray-800">
                    {tempFormValue?.chaos || tempFormValue?.chaos === 0
                      ? tempFormValue?.chaos
                      : option.Chaos}
                  </span>
                </Badge>

                {option.ImageWeight !== "" && (
                  <Badge className=" bg-gray-300/25 cursor-pointer hover:bg-gray-300/45 transition-all duration-200">
                    <span className=" text-gray-500">iw</span>
                    <span className="ml-1 text-gray-800">
                      {option.ImageWeight}
                    </span>
                  </Badge>
                )}

                {option.Quality != "" && (
                  <Badge className=" bg-gray-300/25 cursor-pointer hover:bg-gray-300/45 transition-all duration-200">
                    <span className=" text-gray-500">quality</span>
                    <span className="ml-1 text-gray-800">{option.Quality}</span>
                  </Badge>
                )}

                {option.Stop !== "" && (
                  <Badge className=" bg-gray-300/25 cursor-pointer hover:bg-gray-300/45 transition-all duration-200">
                    <span className=" text-gray-500">stop</span>
                    <span className="ml-1 text-gray-800">{option.Stop}</span>
                  </Badge>
                )}

                {option.Style !== "" && (
                  <Badge className=" bg-gray-300/25 cursor-pointer hover:bg-gray-300/45 transition-all duration-200">
                    <span className=" text-gray-500">style </span>
                    <span className="ml-1 text-gray-800">{option.Style}</span>
                  </Badge>
                )}

                {option.Tile && (
                  <Badge className=" bg-gray-300/25 cursor-pointer hover:bg-gray-300/45 transition-all duration-200">
                    <span className=" text-gray-500">
                      {option.Tile ? "tile" : ""}
                    </span>
                  </Badge>
                )}

                {option.Weird !== "" && (
                  <Badge className=" bg-gray-300/25 cursor-pointer hover:bg-gray-300/45 transition-all duration-200">
                    <span className=" text-gray-500">weird </span>
                    <span className="ml-1 text-gray-800">{option.Weird}</span>
                  </Badge>
                )}
              </div>
            </div>
            <div
              className={`flex flex-col gap-2 w-full justify-between h-fit bg-white p-4 mt-4 rounded-md `}
            >
              <Button
                type="button"
                variant="outline"
                className="px-2"
                disabled={isFetching}
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
                disabled={isFetching}
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
                disabled={isFetching || isUpscaled}
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
                disabled={isFetching || isUpscaled}
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
                className={`px-2 flex`}
                disabled={isFetching || isUpscaled}
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
                    disabled={isFetching || isUpscaled}
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

            <div
              className={`grid grid-cols-2 gap-2 w-full  h-fit bg-white p-4 mt-4 rounded-md `}
            >
              <Button
                type="button"
                variant="outline"
                className="px-2"
                disabled={isFetching || isUpscaled}
                onClick={() => {
                  setExpandDirction("up");
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
                disabled={isFetching || isUpscaled}
                onClick={() => {
                  setExpandDirction("down");
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
                disabled={isFetching || isUpscaled}
                onClick={() => {
                  setExpandDirction("right");
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
                disabled={isFetching || isUpscaled}
                onClick={() => {
                  setExpandDirction("left");
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
        <DialogClose
          disabled={isFetching}
          className="absolute right-2 top-2 rounded-sm opacity-70  transition-opacity hover:opacity-100  disabled:pointer-events-none "
        >
          <X className="h-5 w-5" />
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
