"use client";

import { Button } from "@/components/ui/button";
import { useBlendImages } from "@/lib/store/ImagesList/useBlendImages";
import { useExpandImages } from "@/lib/store/ImagesList/useExpandImages";
import { useInpaintImages } from "@/lib/store/ImagesList/useInpaintImages";
import { useOriginImage } from "@/lib/store/ImagesList/useOriginImage";
import { useUpscaleImage } from "@/lib/store/ImagesList/useUpscaleImage";
import { useVaryImage } from "@/lib/store/ImagesList/useVaryImage";
import { useZoomImages } from "@/lib/store/ImagesList/useZoomImages";
import { extractOptions, handleCopy, handleDownloadBase64 } from "@/lib/utils";
import { CopyIcon, DownloadIcon, TrashIcon } from "@radix-ui/react-icons";
import { X } from "lucide-react";
import { Badge } from "../ui/badge";
import { useEffect, useState } from "react";
import { Options } from "@/lib/interface/ImageData";

export default function FullViewImg({
  open,
  index,
  imgListName,
  imgUrl,
  setOpen,
}: {
  open: boolean;
  index: number;
  imgListName: string;
  imgUrl: string;
  setOpen: (bool: boolean) => void;
}) {
  const deleteOriginImgs = useOriginImage((state) => state.deleteImage);
  const deleteVaryImgs = useVaryImage((state) => state.deleteImage);
  const deleteUpscaleImgs = useUpscaleImage((state) => state.deleteImage);
  const deleteZoomImgs = useZoomImages((state) => state.deleteImage);
  const deleteExpandImgs = useExpandImages((state) => state.deleteImage);
  const deleteBlendImgs = useBlendImages((state) => state.deleteImage);
  const deleteInpaintImgs = useInpaintImages((state) => state.deleteImage);

  const originImgs = useOriginImage((state) => state.images);
  const varyImgs = useVaryImage((state) => state.images);
  const upscaleImgs = useUpscaleImage((state) => state.images);
  const zoomImgs = useZoomImages((state) => state.images);
  const expandImgs = useExpandImages((state) => state.images);
  const inpaintImgs = useInpaintImages((state) => state.images);

  const originImgPrompts = useOriginImage((state) => state.prompts);
  const varyImgPrompts = useVaryImage((state) => state.prompts);
  const upscaleImgPrompts = useUpscaleImage((state) => state.prompts);
  const zoomImgPrompts = useZoomImages((state) => state.prompts);
  const expandImgPrompts = useExpandImages((state) => state.prompts);
  const inpaintImgPrompts = useInpaintImages((state) => state.prompts);

  const [prompt, setPrompt] = useState("");
  const [option, setOption] = useState<Options>();

  interface PromptAndImgObj {
    [key: string]: string[];
  }

  interface DeleteMethods {
    [key: string]: (index: number) => void;
  }
  const ImgList: PromptAndImgObj = {
    originImageList: originImgs,
    varyImageList: varyImgs,
    upscaleImageList: upscaleImgs,
    zoomImageList: zoomImgs,
    expandImageList: expandImgs,
    blendImageList: inpaintImgs,
  };

  const deleteMethods: DeleteMethods = {
    originImageList: deleteOriginImgs,
    varyImageList: deleteVaryImgs,
    upscaleImageList: deleteUpscaleImgs,
    zoomImageList: deleteZoomImgs,
    expandImageList: deleteExpandImgs,
    blendImageList: deleteBlendImgs,
    inpaintImageList: deleteInpaintImgs,
  };

  const PromptList: PromptAndImgObj = {
    originImageList: originImgPrompts,
    varyImageList: varyImgPrompts,
    upscaleImageList: upscaleImgPrompts,
    zoomImageList: zoomImgPrompts,
    expandImageList: expandImgPrompts,
    inpaintImageList: inpaintImgPrompts,
  };

  const handlePrompt = () => {
    if (imgListName !== 'upscaleImageList') {
      if (PromptList[imgListName]) {
        const promptList = PromptList[imgListName];
        const divNum = Math.ceil((index + 1) / 4);
        return promptList[divNum - 1];
      }
    } else {
      if (PromptList[imgListName]) {
        const promptList = PromptList[imgListName];
        return promptList[index];
      }
    }

  };

  const handleDelete = () => {
    // 根据 imgListName 获取对应的删除方法并调用
    if (imgListName && deleteMethods[imgListName]) {
      deleteMethods[imgListName](index !== null ? +index : 0);
    }
  };

  useEffect(() => {
    const prompt = handlePrompt();
    setPrompt(prompt || "");

    if (prompt !== "") {
      const option = extractOptions(prompt || "");
      setOption(option);
    }
  }, [open]);

  return (
    <div
      className={`w-screen p-10  h-screen  transition-all z-50 duration-300 bg-white absolute hidden opacity-0 ${open && "!flex !items-center !justify-between opacity-100"
        }`}
    >
      <div className="h-full relative w-[80vw] flex-center">
        <img
          src={imgUrl as string}
          alt={`${imgListName}[${index}] image`}
          className=" w-full h-full object-contain"
        ></img>
      </div>
      <Button
        type="button"
        variant="ghost"
        className="top-1 absolute right-1 px-[8px] py-[1px]"
        onClick={() => setOpen(false)}
      >
        <X width={20} height={20} className=" cursor-pointer"></X>
      </Button>
      <div className=" w-[25rem] ml-2 h-full rounded-sm flex p-4 flex-col bg-gray-100  gap-4  items-center">
        <div className="flex gap-4 self-start items-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              handleDownloadBase64(
                imgUrl as string,
                index !== null ? +index : 0
              );
            }}
          >
            <DownloadIcon
              width={20}
              height={20}
              className=" cursor-pointer "
            ></DownloadIcon>
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              setOpen(false);
              handleDelete();
            }}
          >
            <TrashIcon
              width={20}
              height={20}
              className=" cursor-pointer "
            ></TrashIcon>
          </Button>
        </div>
        {imgListName !== 'blendImageList' &&
          <>
            <div className="flex flex-col gap-2  rounded-sm">
              <div className="flex gap-2 items-center ">
                <span className=" font-medium text-[18px]">Prompt :</span>
                <Button
                  variant="outline"
                  className=" cursor-pointer !px-[12px]"
                  type="button"
                  onClick={() => {
                    handleCopy(prompt);
                  }}
                >
                  <CopyIcon width={15} height={15}></CopyIcon>
                </Button>
              </div>
              <p className=" text-[15px] line-clamp-[15] text-neutral-700">
                {prompt}
              </p>
            </div>
            <div className=" w-full h-full ">
              <span className="font-medium text-[18px]">Command List:</span>
              <div className=" flex gap-4 flex-wrap mt-4 h-fit w-full overflow-y-scroll hide-scrollbar">
                {option?.AspectRatio && (
                  <Badge className=" bg-white/50 text-base h-[50px]    shadow cursor-pointer hover:bg-gray-300/45 transition-all duration-200">
                    <span className=" text-gray-500">ar</span>
                    <span className="ml-1 text-neutral-950">
                      {option?.AspectRatio}
                    </span>
                  </Badge>
                )}

                {option?.Version && (
                  <Badge className=" bg-white/50 shadow text-base h-[50px]    cursor-pointer hover:bg-gray-300/45 transition-all duration-200">
                    <span className=" text-gray-500">model</span>
                    <span className="ml-1 text-neutral-950">{option?.Version}</span>
                  </Badge>
                )}

                {option?.Stylize && (
                  <Badge className=" bg-white/50 shadow text-base h-[50px]    cursor-pointer hover:bg-gray-300/45 transition-all duration-200">
                    <span className=" text-gray-500">stylize</span>
                    <span className="ml-1 text-neutral-950">{option?.Stylize}</span>
                  </Badge>
                )}

                {option?.Seed && (
                  <Badge className=" bg-white/50 shadow text-base h-[50px]    cursor-pointer hover:bg-gray-300/45 transition-all duration-200">
                    <span className=" text-gray-500">seed</span>
                    <span className="ml-1 text-neutral-950">{option?.Seed}</span>
                  </Badge>
                )}

                {option?.Chaos && (
                  <Badge className=" bg-white/50 shadow text-base h-[50px]     cursor-pointer hover:bg-gray-300/45 transition-all duration-200">
                    <span className=" text-gray-500">chaos</span>
                    <span className="ml-1 text-neutral-950">{option?.Chaos}</span>
                  </Badge>
                )}

                {option?.ImageWeight && (
                  <Badge className=" bg-white/50 shadow text-base h-[50px]    cursor-pointer hover:bg-gray-300/45 transition-all duration-200">
                    <span className=" text-gray-500">iw</span>
                    <span className="ml-1 text-neutral-950">
                      {option?.ImageWeight}
                    </span>
                  </Badge>
                )}

                {option?.Quality && (
                  <Badge className=" bg-white/50 shadow text-base h-[50px]    cursor-pointer hover:bg-gray-300/45 transition-all duration-200">
                    <span className=" text-gray-500">quality</span>
                    <span className="ml-1 text-neutral-950">{option?.Quality}</span>
                  </Badge>
                )}

                {option?.Stop && (
                  <Badge className=" bg-white/50 shadow text-base h-[50px]    cursor-pointer hover:bg-gray-300/45 transition-all duration-200">
                    <span className=" text-gray-500">stop</span>
                    <span className="ml-1 text-neutral-950">{option?.Stop}</span>
                  </Badge>
                )}

                {option?.Style && (
                  <Badge className=" bg-white/50 shadow text-base h-[50px]    cursor-pointer hover:bg-gray-300/45 transition-all duration-200">
                    <span className=" text-gray-500">style</span>
                    <span className="ml-1 text-neutral-950">{option?.Style}</span>
                  </Badge>
                )}

                <Badge
                  className={`bg-white/50 ${option?.Tile ? "flex-center" : "hidden"
                    } shadow text-base h-[50px] cursor-pointer hover:bg-gray-300/45 transition-all  duration-200 `}
                >
                  <span className=" text-gray-500">
                    {option?.Tile ? "tile" : ""}
                  </span>
                </Badge>
                {option?.Weird && (
                  <Badge className=" bg-white/50 shadow text-base  h-[50px]   cursor-pointer hover:bg-gray-300/45 transition-all duration-200">
                    <span className=" text-gray-500">weird</span>
                    <span className="ml-1 text-neutral-950">{option?.Weird}</span>
                  </Badge>
                )}
              </div>
            </div>
          </>
        }
      </div>
    </div>
  );
}
