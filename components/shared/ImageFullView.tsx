import { Dialog, DialogContent } from "@/components/ui/dialog";

import { CopyIcon, MagicWandIcon } from "@radix-ui/react-icons";
import { Button } from "../ui/button";
import { FullViewData, ImageData } from "@/app/interface/ImageData";
import { Badge } from "../ui/badge";
import { debounce, extractArAndModel, handleDownload } from "@/lib/utils";
import { toast } from "sonner";
import UpscaleSvg from "@/components/shared/UpscaleSvg";
import { DownloadIcon } from "lucide-react";
import axios from "axios";
import { useState } from "react";

export function ImageFullView({
  index,
  parentTaskId,
  tempFormValue,
  parentSeed,
  finalPrompt,
  open,
  setOpen,
  ParentimageArr,
}: FullViewData) {
  const [isFetching, setIsFetching] = useState(false);
  const [imageDatas, setImageDatas] = useState<ImageData | null>();
  const [imageArr, setImageArr] = useState<string[]>([]);
  const [upscale2x, setUpscale2x] = useState(false);
  const [upscale4x, setUpscale4x] = useState(false);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const negativeWords = tempFormValue?.negativePrompt?.split(" ");
  let imgIndexList = [0, 1, 2, 3];

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("prompt已复制到剪贴板");
    } catch (error) {
      console.error("Failed to copy: ", error);
    }
  };
  const testImageArr = [
    "https://cdn.midjourney.com/cb51a757-acb6-44dd-b8f6-ce0c9dfa1df3/0_0.webp",
    "https://cdn.midjourney.com/cb51a757-acb6-44dd-b8f6-ce0c9dfa1df3/0_1.webp",
    "https://cdn.midjourney.com/cb51a757-acb6-44dd-b8f6-ce0c9dfa1df3/0_2.webp",
    "https://cdn.midjourney.com/cb51a757-acb6-44dd-b8f6-ce0c9dfa1df3/0_3.webp",
  ];

  const handleUpscaleImage = debounce(async () => {
    try {
      setIsFetching(true);
      //单独找到index那张图
      const response = await axios.post("/api/upscale", {
        originTaskId: parentTaskId,
        index,
      });
      const taskId = response.data.task_id;

      //对那张图进行放大
      const responseNew = await axios.post("/api/upscale", {
        originTaskId: taskId,
        index: upscale2x ? "2x" : "4x",
      });

      const intervalId = setInterval(async () => {
        try {
          const taskResult: { data: ImageData } = await axios.post(
            "/api/fetchImage",
            { taskId: responseNew.data.task_id }
          );

          setImageDatas(taskResult.data);

          if (taskResult.data.task_progress === 100) {
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className=" !h-[800px]  min-w-[1260px]">
        <div className="flex w-full h-full">
          <div className=" relative flex-1 w-full h-full flex-center bg-gray-300/25 rounded-l-md">
            <button
              type="button"
              onClick={() => handleDownload(ParentimageArr[index], index)}
              className=" absolute right-2 top-2 active:translate-y-[1px] rounded-md bg-white p-1.5 hover:bg-gray-300/25 transition-all duration-200"
            >
              <DownloadIcon width={20} height={20} color="black"></DownloadIcon>
            </button>
            <div
              className={` w-[80%] h-full relative ${isFetching && "hidden"}`}
            >
              <img
                src={testImageArr[mainImageIndex]}
                className="w-full h-full"
                alt="full view img"
              ></img>
              <div className=" absolute right-2 bottom-2 w-fit h-fit">
                <div className=" flex gap-1">
                  <img
                    src={testImageArr[0]}
                    className={`w-[5rem] border-2 border-transparent   h-full hover:scale-105 transition-all duration-300 cursor-pointer ${
                      imgIndexList[0] === mainImageIndex &&
                      "border-2 border-green-500"
                    }`}
                    alt="full view img"
                    onClick={() => setMainImageIndex(imgIndexList[0])}
                  ></img>
                  <img
                    src={testImageArr[1]}
                    className={`w-[5rem] border-2 border-transparent   h-full hover:scale-105 transition-all duration-300 cursor-pointer ${
                      imgIndexList[1] === mainImageIndex &&
                      "border-2 border-green-500"
                    }`}
                    alt="full view img"
                    onClick={() => setMainImageIndex(imgIndexList[1])}
                  ></img>
                  <img
                    src={testImageArr[2]}
                    className={`w-[5rem] border-2 border-transparent  h-full hover:scale-105 transition-all duration-300 cursor-pointer ${
                      imgIndexList[2] === mainImageIndex &&
                      "border-2 border-green-500"
                    }`}
                    alt="full view img"
                    onClick={() => setMainImageIndex(imgIndexList[2])}
                  ></img>
                  <img
                    src={testImageArr[3]}
                    className={`w-[5rem] border-2 border-transparent  h-full hover:scale-105 transition-all duration-300 cursor-pointer ${
                      imgIndexList[3] === mainImageIndex &&
                      "border-2 border-green-500"
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
                isFetching && "flicker block"
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
                  <span className="ml-1 text-gray-800">
                    {tempFormValue?.seeds || parentSeed}
                  </span>
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
                  // handleUpscaleImage();
                }}
              >
                <UpscaleSvg></UpscaleSvg>
                <span className="ml-1 text-sm">Upscale(2x)</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="px-2"
                disabled={isFetching}
                onClick={() => {
                  setUpscale4x(true);
                  // handleUpscaleImage();
                }}
              >
                <UpscaleSvg></UpscaleSvg>
                <span className="ml-1 text-sm">Upscale(4x)</span>
              </Button>
            </div>
            <div className="flex w-full justify-between h-fit bg-white p-4 mt-4 rounded-md">
              <Button type="button" variant="outline" className="px-2">
                <MagicWandIcon
                  width={20}
                  height={20}
                  color="black"
                ></MagicWandIcon>
                <span className="ml-1 text-sm">Vary(subtle)</span>
              </Button>
              <Button type="button" variant="outline" className="px-2">
                <MagicWandIcon
                  width={20}
                  height={20}
                  color="black"
                ></MagicWandIcon>
                <span className="ml-1 text-sm">Vary(strong)</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
