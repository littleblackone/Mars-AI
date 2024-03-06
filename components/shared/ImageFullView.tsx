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
} from "@/lib/interface/ImageData";
import { Badge } from "../ui/badge";
import {
  cropImageIntoFour,
  debounce,
  extractArAndModel,
  getUserCredits,
  handleCopy,
  handleDownloadBase64,
  handleGetSeed,
  handleIw,
  handleQuality,
  imageUrlToBase64,
  updateUserCredits,
} from "@/lib/utils";
import UpscaleSvg from "@/components/shared/UpscaleSvg";
import { DownloadIcon, LoaderIcon, X, ZoomIn } from "lucide-react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useUpscaleImage } from "@/lib/store/ImagesList/useUpscaleImage";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { PopoverClose } from "@radix-ui/react-popover";
import { useZoomImages } from "@/lib/store/ImagesList/useZoomImages";
import { useExpandImages } from "@/lib/store/ImagesList/useExpandImages";
import { useIsUpscaled } from "@/lib/store/useIsUpscaled";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import { useCredits } from "@/lib/store/useCredits";

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
  useStyleRaw,
  useTile,
  customAS,
  customASW,
  customASH,
  useDefaultModel,
  email
}: FullViewData) {
  const [fetchTime, setFetchTime] = useState<number>(0);
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
  const setUpscalePrompt = useUpscaleImage((state) => state.setPrompts);
  const setZoomImages = useZoomImages((state) => state.setImages);
  const setZoomPrompt = useZoomImages((state) => state.setPrompts);
  const setExpandImages = useExpandImages((state) => state.setImages);
  const setExpandPrompt = useExpandImages((state) => state.setPrompts);

  const isUpscaled = useIsUpscaled((state) => state.isUpscaled);

  const model = tempFormValue?.model?.split(" --")[1];

  const formAS = extractArAndModel(tempFormValue?.aspectRatio || "");
  const formModel = extractArAndModel(tempFormValue?.model || "");
  const customAspectRatio = `${customASW}:${customASH}`

  const handledIw = handleIw(tempFormValue?.imageWeight || 1);
  const handledQ = handleQuality(tempFormValue?.quality || " --q 1");
  const setCredits = useCredits(state => state.setCredits)
  const handleZoom = async (zoomValue: string) => {
    try {
      if (useDefaultModel) {
        const infinityai_user_credits = await getUserCredits(email)
        setCredits(infinityai_user_credits)
        if (infinityai_user_credits - 11 < 0) {
          toast.warning("积分余额不足")
          return;
        }
        await updateUserCredits(infinityai_user_credits - 11, email)
        setCredits(infinityai_user_credits - 11)
      } else {
        const infinityai_user_credits = await getUserCredits(email)
        setCredits(infinityai_user_credits)
        if (infinityai_user_credits - 16 < 0) {
          toast.warning("积分余额不足")
          return;
        }
        await updateUserCredits(infinityai_user_credits - 16, email)
        setCredits(infinityai_user_credits - 16)
      }
      setIsZooming(true);
      setFetchTime(0)
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

          setFetchTime((prev) => prev + 1);

          if (fetchTime >= 180) {
            clearInterval(intervalId);
            setIsZooming(false);
            toast.error("请求超时,请查看midjourney服务器状态后重试");
          }

          if (taskResult.data.status === "finished") {
            clearInterval(intervalId);
            setOriginTaskId(taskResult.data.task_id);
            const bast64ImgArr = await cropImageIntoFour(
              taskResult.data.task_result.image_url
            );
            const prompt = taskResult.data.meta.task_param.prompt;
            setZoomPrompt(prompt);
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
  }

  const handleExpand = async (expandValue: string) => {
    try {

      if (useDefaultModel) {
        const infinityai_user_credits = await getUserCredits(email)
        setCredits(infinityai_user_credits)
        if (infinityai_user_credits - 11 < 0) {
          toast.warning("积分余额不足")
          return;
        }
        await updateUserCredits(infinityai_user_credits - 11, email)
        setCredits(infinityai_user_credits - 11)
      } else {
        const infinityai_user_credits = await getUserCredits(email)
        if (infinityai_user_credits - 16 < 0) {
          toast.warning("积分余额不足")
          return;
        }
        await updateUserCredits(infinityai_user_credits - 16, email)
        setCredits(infinityai_user_credits - 16)
      }
      setIsExpanding(true);
      setFetchTime(0);
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

          setFetchTime((prev) => prev + 1);

          if (fetchTime >= 180) {
            clearInterval(intervalId);
            setIsExpanding(false);
            toast.error("请求超时,请查看midjourney服务器状态后重试");
          }

          if (taskResult.data.status === "finished") {
            clearInterval(intervalId);
            setOriginTaskId(taskResult.data.task_id);
            const bast64ImgArr = await cropImageIntoFour(
              taskResult.data.task_result.image_url
            );
            const prompt = taskResult.data.meta.task_param.prompt;
            setExpandPrompt(prompt);
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
  }
  const handleUpscaleImage = async () => {
    try {

      const infinityai_user_credits = await getUserCredits(email)
      setCredits(infinityai_user_credits)
      if (infinityai_user_credits - 1 < 0) {
        toast.warning("积分余额不足")
        return;
      }
      await updateUserCredits(infinityai_user_credits - 1, email)
      setCredits(infinityai_user_credits - 1)

      setIsUpscaling(true);
      setFetchTime(0)
      let upscaleId: string = '';
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
          if (isFirstIntervalCompleted === false || upscaleId === '') return;

          const taskResult: FetchImageData = await axios.post(
            "/api/fetchImage",
            {
              taskId: upscaleId,
            }
          );
          setFetchTime((prev) => prev + 1);

          if (fetchTime >= 240) {
            clearInterval(intervalId);
            setIsUpscaling(false);
            toast.error("请求超时,请查看midjourney服务器状态后重试");
          }
          if (taskResult.data.status === "finished") {
            clearInterval(intervalId);
            const prompt = taskResult.data.meta.task_param.prompt;
            setUpscalePrompt(prompt);
            const upscaledBase64 = await imageUrlToBase64(taskResult.data.task_result.image_url)
            toast.success('Upscale成功, 请在历史图片区域查看', { duration: 3500 })
            setUpscaleImages(upscaledBase64);
            setIsUpscaling(false);
          }
        } catch (error) {
          console.error("Error fetching image:", error);
        }
      }, 1000);
    } catch (error) {
      console.error("Error sending prompt:", error);
    }
  }

  const handleUpscale2xOrSub = async () => {

    if (model == "v 5.2") {
      const infinityai_user_credits = await getUserCredits(email)
      if (infinityai_user_credits - 15 < 0) {
        toast.warning("积分余额不足")
        return;
      }
      await updateUserCredits(infinityai_user_credits - 15, email)

      setUpscale2x(true);
    } else {
      const infinityai_user_credits = await getUserCredits(email)
      if (infinityai_user_credits - 12 < 0) {
        toast.warning("积分余额不足")
        return;
      }
      await updateUserCredits(infinityai_user_credits - 12, email)

      setUpscaleSub(true);
    }
  }

  const handleUpscale4xOrCreative = async () => {

    if (model == "v 5.2") {
      const infinityai_user_credits = await getUserCredits(email)
      if (infinityai_user_credits - 30 < 0) {
        toast.warning("积分余额不足")
        return;
      }
      await updateUserCredits(infinityai_user_credits - 30, email)


      setUpscale4x(true);
    } else {
      const infinityai_user_credits = await getUserCredits(email)
      if (infinityai_user_credits - 12 < 0) {
        toast.warning("积分余额不足")
        return;
      }
      await updateUserCredits(infinityai_user_credits - 12, email)

      setUpscaleCreative(true);
    }
  }

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
          <div className=" relative flex-1 w-full h-full flex-center dark:bg-[#131d33] bg-gray-300/25 rounded-l-md">
            <Button
              type="button"
              disabled={isFetching}
              variant="outline"
              className="absolute px-2.5 dark:bg-[#364e83] right-2 top-2 active:translate-y-[1px] rounded-md"
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
              <DownloadIcon width={20} height={20} className=" dark:text-white"></DownloadIcon>
            </Button>

            <div
              className={` w-[712px] h-[712px] flex-center ${isFetching && "hidden"
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
                className={` max-w-[100%] max-h-[100%] ${isFetching && "hidden"
                  }`}
                alt="full view img"
              ></img>
              <div
                className={` absolute right-2 bottom-2 w-fit h-fit ${isFetching && "hidden"
                  }`}
              >
                <div className=" flex gap-1">
                  <img
                    src={parentimageArr[0]}
                    className={`w-[5rem] border-2 border-transparent h-full hover:scale-105 transition-all duration-300 cursor-pointer ${imgIndexList[0] ===
                      (mainImageIndex !== undefined
                        ? mainImageIndex
                        : selectedIndex) && "border-2 !border-green-500"
                      }`}
                    alt="full view img"
                    onClick={() => setMainImageIndex(imgIndexList[0])}
                  ></img>
                  <img
                    src={parentimageArr[1]}
                    className={`w-[5rem] border-2 border-transparent   h-full hover:scale-105 transition-all duration-300 cursor-pointer ${imgIndexList[1] ===
                      (mainImageIndex !== undefined
                        ? mainImageIndex
                        : selectedIndex) && "border-2 !border-green-500"
                      }`}
                    alt="full view img"
                    onClick={() => setMainImageIndex(imgIndexList[1])}
                  ></img>
                  <img
                    src={parentimageArr[2]}
                    className={`w-[5rem] border-2 border-transparent  h-full hover:scale-105 transition-all duration-300 cursor-pointer ${imgIndexList[2] ===
                      (mainImageIndex !== undefined
                        ? mainImageIndex
                        : selectedIndex) && "border-2 !border-green-500"
                      }`}
                    alt="full view img"
                    onClick={() => setMainImageIndex(imgIndexList[2])}
                  ></img>
                  <img
                    src={parentimageArr[3]}
                    className={`w-[5rem] border-2 border-transparent  h-full hover:scale-105 transition-all duration-300 cursor-pointer ${imgIndexList[3] ===
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
                className={`hidden w-full h-full aspect-square ${isFetching && "flicker !block"
                  }`}
              ></img>
            </div>
          </div>
          <div className=" max-w-[20rem] flex p-2 flex-col dark:bg-[#192746] h-full bg-gray-400/25 rounded-r-md">
            <div className=" bg-white p-4 mt-4 dark:bg-[#263861] rounded-md flex flex-col">
              <div className="flex gap-2  items-center">
                <p className=" text-lg dark:text-white">Prompt</p>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-center h-8  w-8 dark:bg-[#364e83] p-0"
                  onClick={() => handleCopy(finalPrompt)}
                >
                  <CopyIcon height={12} width={12} className="dark:text-white"></CopyIcon>
                </Button>
              </div>
              <p className=" text-sm text-gray-600 dark:text-gray-200 leading-5 line-clamp-4">
                {tempFormValue?.prompt}
              </p>

              <div className="flex gap-2 flex-wrap mt-2 h-[52px] overflow-y-scroll hide-scrollbar">
                <Badge className=" bg-gray-300/25 dark:bg-[#3558a3] hover:dark:bg-[#2e4d91] cursor-pointer hover:bg-gray-300/45 transition-all duration-200">
                  <span className=" text-gray-500 dark:text-gray-300">ar</span>
                  <span className="ml-1 text-gray-800 dark:text-gray-100">{customAS ? customAspectRatio : formAS}</span>
                </Badge>

                <Badge className=" bg-gray-300/25 dark:bg-[#3558a3] hover:dark:bg-[#2e4d91] cursor-pointer hover:bg-gray-300/45 transition-all duration-200">
                  <span className=" text-gray-500 dark:text-gray-300">model</span>
                  <span className="ml-1 text-gray-800 dark:text-gray-100">{formModel}</span>
                </Badge>

                <Badge className=" bg-gray-300/25 dark:bg-[#3558a3] hover:dark:bg-[#2e4d91] cursor-pointer hover:bg-gray-300/45 transition-all duration-200">
                  <span className=" text-gray-500 dark:text-gray-300">stylize</span>
                  <span className="ml-1 text-gray-800 dark:text-gray-100">
                    {tempFormValue?.stylize}
                  </span>
                </Badge>

                <Badge className=" bg-gray-300/25 dark:bg-[#3558a3] hover:dark:bg-[#2e4d91] cursor-pointer hover:bg-gray-300/45 transition-all duration-200">
                  <span className=" text-gray-500 dark:text-gray-300">seed</span>
                  <span className="ml-1 text-gray-800 dark:text-gray-100">{parentSeed}</span>
                </Badge>

                <Badge className=" bg-gray-300/25 dark:bg-[#3558a3] hover:dark:bg-[#2e4d91] cursor-pointer hover:bg-gray-300/45 transition-all duration-200">
                  <span className=" text-gray-500 dark:text-gray-300">chaos</span>
                  <span className="ml-1 text-gray-800 dark:text-gray-100">
                    {(tempFormValue?.chaos || tempFormValue?.chaos === 0) &&
                      tempFormValue?.chaos}
                  </span>
                </Badge>

                <Badge className=" bg-gray-300/25 dark:bg-[#3558a3] hover:dark:bg-[#2e4d91] cursor-pointer hover:bg-gray-300/45 transition-all duration-200">
                  <span className=" text-gray-500 dark:text-gray-300">iw</span>
                  <span className="ml-1 text-gray-800 dark:text-gray-100">{handledIw}</span>
                </Badge>

                <Badge className=" bg-gray-300/25 dark:bg-[#3558a3] hover:dark:bg-[#2e4d91] cursor-pointer hover:bg-gray-300/45 transition-all duration-200">
                  <span className=" text-gray-500 dark:text-gray-300">quality</span>
                  <span className="ml-1 text-gray-800 dark:text-gray-100">{handledQ}</span>
                </Badge>

                <Badge className=" bg-gray-300/25 dark:bg-[#3558a3] hover:dark:bg-[#2e4d91] cursor-pointer hover:bg-gray-300/45 transition-all duration-200">
                  <span className=" text-gray-500 dark:text-gray-300">stop</span>
                  <span className="ml-1 text-gray-800 dark:text-gray-100">
                    {tempFormValue?.stop}
                  </span>
                </Badge>

                <Badge className={`${useStyleRaw ? '!block' : ''} hidden bg-gray-300/25 dark:bg-[#3558a3] hover:dark:bg-[#2e4d91] cursor-pointer hover:bg-gray-300/45 transition-all duration-200`}>
                  <span className=" text-gray-500 dark:text-gray-300">style</span>
                  <span className="ml-1 text-gray-800 dark:text-gray-100">
                    {useStyleRaw ? "raw" : ""}
                  </span>
                </Badge>

                <Badge
                  className={`bg-gray-300/25 dark:bg-[#3558a3] hover:dark:bg-[#2e4d91] cursor-pointer hover:bg-gray-300/45 transition-all hidden duration-200 ${useTile && "block"
                    }`}
                >
                  <span className=" text-gray-500 dark:text-gray-300">
                    {useTile ? "tile" : ""}
                  </span>
                </Badge>

                <Badge className=" bg-gray-300/25 dark:bg-[#3558a3] hover:dark:bg-[#2e4d91] cursor-pointer hover:bg-gray-300/45 transition-all duration-200">
                  <span className=" text-gray-500 dark:text-gray-300">weird</span>
                  <span className="ml-1 text-gray-800 dark:text-gray-100">
                    {tempFormValue?.weird}
                  </span>
                </Badge>
              </div>
            </div>
            <div
              className={`flex flex-col dark:bg-[#263861] gap-2 w-full justify-between h-fit bg-white p-4 mt-4 rounded-md `}
            >
              <Button
                type="button"
                variant="outline"
                className="px-2 dark:bg-[#3558a3] dark:text-white hover:dark:bg-[#2e4d91]"
                disabled={isFetching}
                onClick={async () => {
                  debounce(() => handleUpscale2xOrSub(), 1000)()
                }
                }
              >
                {isUpscaling ? (
                  <>
                    <LoaderIcon width={15} height={15} className=" animate-spin mr-1"></LoaderIcon>
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
                className="px-2 dark:bg-[#3558a3] hover:dark:bg-[#2e4d91] dark:text-white"
                disabled={isFetching}
                onClick={async () => {
                  debounce(() => handleUpscale4xOrCreative(), 1000)()
                }}
              >
                {isUpscaling ? (
                  <>
                    <LoaderIcon width={15} height={15} className=" animate-spin mr-1"></LoaderIcon>
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

            <div className="flex dark:bg-[#263861] flex-col gap-2 w-full justify-between h-fit bg-white p-4 mt-4 rounded-md">
              <Button
                type="button"
                variant="outline"
                className="px-2 dark:bg-[#3558a3] hover:dark:bg-[#2e4d91] dark:text-white"
                disabled={isFetching || isUpscaled}
                onClick={() => {
                  debounce(() => handleZoom("1.5"), 1000)();
                }}
              >
                {isZooming ? (
                  <>
                    <LoaderIcon width={15} height={15} className=" animate-spin mr-1"></LoaderIcon>
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
                className="px-2 dark:bg-[#3558a3] hover:dark:bg-[#2e4d91] dark:text-white"
                disabled={isFetching || isUpscaled}
                onClick={() => {
                  debounce(() => handleZoom("2"), 1000)();
                }}
              >
                {isZooming ? (
                  <>
                    <LoaderIcon width={15} height={15} className=" animate-spin mr-1"></LoaderIcon>
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
                className={`px-2 flex dark:bg-[#3558a3] hover:dark:bg-[#2e4d91] dark:text-white`}
                disabled={isFetching || isUpscaled}
                onClick={() => {
                  debounce(() => handleZoom("1"), 1000)();
                }}
              >
                {isZooming ? (
                  <>
                    <LoaderIcon width={15} height={15} className=" animate-spin mr-1"></LoaderIcon>
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
                    className="px-2 w-full dark:bg-[#3558a3] hover:dark:bg-[#2e4d91] dark:text-white"
                    disabled={isFetching || isUpscaled}
                  >
                    {isZooming ? (
                      <>
                        <GearIcon className="gear-icon mr-1"></GearIcon>
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
                      debounce(() => handleZoom(zoomValue), 1000)();
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
              className={`grid dark:bg-[#263861] grid-cols-2 gap-2 w-full  h-fit bg-white p-4 mt-4 rounded-md `}
            >
              <Button
                type="button"
                variant="outline"
                className="px-2 dark:bg-[#3558a3] hover:dark:bg-[#2e4d91] dark:text-white"
                disabled={isFetching || isUpscaled}
                onClick={() => {
                  setExpandDirction("up");
                }}
              >
                {isExpanding ? (
                  <>
                    <LoaderIcon width={15} height={15} className=" animate-spin mr-1"></LoaderIcon>
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
                className="px-2 dark:bg-[#3558a3] hover:dark:bg-[#2e4d91] dark:text-white"
                disabled={isFetching || isUpscaled}
                onClick={() => {
                  setExpandDirction("down");
                }}
              >
                {isExpanding ? (
                  <>
                    <LoaderIcon width={15} height={15} className=" animate-spin mr-1"></LoaderIcon>
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
                className="px-2 dark:bg-[#3558a3] hover:dark:bg-[#2e4d91] dark:text-white"
                disabled={isFetching || isUpscaled}
                onClick={() => {
                  setExpandDirction("right");
                }}
              >
                {isExpanding ? (
                  <>
                    <LoaderIcon width={15} height={15} className=" animate-spin mr-1"></LoaderIcon>
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
                className="px-2 dark:bg-[#3558a3] hover:dark:bg-[#2e4d91] dark:text-white"
                disabled={isFetching || isUpscaled}
                onClick={() => {
                  setExpandDirction("left");
                }}
              >
                {isExpanding ? (
                  <>
                    <LoaderIcon width={15} height={15} className=" animate-spin mr-1"></LoaderIcon>
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
          <X className="h-5 w-5 dark:text-white" />
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
