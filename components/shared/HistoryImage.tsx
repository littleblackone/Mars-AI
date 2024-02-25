"use client";

import { useOriginImage } from "@/lib/store/useOriginImage";
import { useUpscaleImage } from "@/lib/store/useUpscaleImage";
import { useVaryImage } from "@/lib/store/useVaryImage";
import { useEffect, useState } from "react";

import { useOpenHistory } from "@/lib/store/useOpenHistory";
import { useZoomImages } from "@/lib/store/useZoomImages";
import { useExpandImages } from "@/lib/store/useExpandImages";
import { useBlendImages } from "@/lib/store/useBlendImages";
import { TrashIcon } from "@radix-ui/react-icons";
import { useInpaintImages } from "@/lib/store/useInpaintImages";

export default function HistoryImage() {
  const originImageList = useOriginImage((state) => state.images);
  const deleteOriginImgs = useOriginImage((state) => state.deleteImage);

  const varyImageList = useVaryImage((state) => state.images);
  const deleteVaryImgs = useVaryImage((state) => state.deleteImage);

  const upscaleImageList = useUpscaleImage((state) => state.images);
  const deleteUpscaleImgs = useUpscaleImage((state) => state.deleteImage);

  const zoomImageList = useZoomImages((state) => state.images);
  const deleteZoomImgs = useZoomImages((state) => state.deleteImage);

  const expandImageList = useExpandImages((state) => state.images);
  const deleteExpandImgs = useExpandImages((state) => state.deleteImage);

  const blendImageList = useBlendImages((state) => state.images);
  const deleteBlendImgs = useBlendImages((state) => state.deleteImage);

  const inpaintImageList = useInpaintImages((state) => state.images);
  const deleteInpaintImgs = useInpaintImages((state) => state.deleteImage);

  const [isOpenHistoryArea, setIsOpenHistoryArea] = useState(false);

  const open = useOpenHistory((state) => state.open);

  useEffect(() => {
    setIsOpenHistoryArea(
      originImageList.length > 0 ||
        varyImageList.length > 0 ||
        upscaleImageList.length > 0 ||
        zoomImageList.length > 0 ||
        expandImageList.length > 0 ||
        blendImageList.length > 0
    );
  }, [
    originImageList,
    varyImageList,
    upscaleImageList,
    zoomImageList,
    expandImageList,
    blendImageList,
  ]);

  // const originImageList = [
  //   "https://cdn.midjourney.com/ffd8ffcd-3abf-4349-831b-71a79b682d6f/0_0.webp",
  //   "https://cdn.midjourney.com/ffd8ffcd-3abf-4349-831b-71a79b682d6f/0_1.webp",
  //   "https://cdn.midjourney.com/ffd8ffcd-3abf-4349-831b-71a79b682d6f/0_2.webp",
  //   "https://cdn.midjourney.com/ffd8ffcd-3abf-4349-831b-71a79b682d6f/0_3.webp",
  // ];
  // const varyImageList = [
  //   "https://cdn.midjourney.com/79cc2747-00c6-41bb-9e2b-d4f87223dac5/0_0.webp",
  //   "https://cdn.midjourney.com/79cc2747-00c6-41bb-9e2b-d4f87223dac5/0_1.webp",
  //   "https://cdn.midjourney.com/79cc2747-00c6-41bb-9e2b-d4f87223dac5/0_2.webp",
  //   "https://cdn.midjourney.com/79cc2747-00c6-41bb-9e2b-d4f87223dac5/0_3.webp",
  // ];
  // const upscaleImageList = [
  //   "https://cdn.midjourney.com/4098da5a-9af2-4a11-86ab-202931d8c31b/0_0.webp",
  //   "https://cdn.midjourney.com/4098da5a-9af2-4a11-86ab-202931d8c31b/0_1.webp",
  // ];

  return (
    <div
      className={` ml-[15px] relative hide-scrollbar py-2 px-4 w-0 max-h-[735px] transition-all duration-700 ease-in-out flex flex-col overflow-y-scroll ${
        isOpenHistoryArea && open && `!w-[20rem]`
      }`}
    >
      <span
        className={`self-start mb-2 text-white/70 hidden ${
          originImageList.length > 0 && open && "!block"
        }`}
      >
        Origin Images
      </span>
      <div className=" columns-2 ">
        {originImageList.map((imgUrl, index) => {
          return (
            <div className=" w-full h-full rounded-md flex-center relative mb-2 ">
              <img
                src={imgUrl}
                key={imgUrl}
                alt="midjourney image"
                className={`rounded-md w-[100px] h-auto cursor-pointer hover:scale-105 transition-all duration-200`}
              ></img>
              <button
                type="button"
                onClick={() => {
                  deleteOriginImgs(index);
                }}
                className="active:translate-y-[1px] absolute right-1 top-1 rounded-md hover:stroke-red-500 bg-transparent  transition-all duration-200"
              >
                <TrashIcon width={20} height={20} color="white"></TrashIcon>
              </button>
            </div>
          );
        })}
      </div>
      <span
        className={`self-start mb-2 text-white/70 hidden ${
          varyImageList.length > 0 && open && "!block"
        }`}
      >
        Vary Images
      </span>
      <div className=" columns-2 ">
        {varyImageList.map((imgUrl, index) => {
          return (
            <div className=" w-full h-full rounded-md flex-center relative mb-2 ">
              <img
                key={imgUrl}
                src={imgUrl}
                alt="midjourney image"
                className={`rounded-md  w-[100px] h-auto cursor-pointer hover:scale-105 transition-all duration-200`}
              ></img>
              <button
                type="button"
                onClick={() => {
                  deleteVaryImgs(index);
                }}
                className="active:translate-y-[1px] absolute right-1 top-1 rounded-md hover:stroke-red-500 bg-transparent  transition-all duration-200"
              >
                <TrashIcon width={20} height={20} color="white"></TrashIcon>
              </button>
            </div>
          );
        })}
      </div>
      <span
        className={`self-start mb-2 text-white/70 hidden ${
          upscaleImageList.length > 0 && open && "!block"
        }`}
      >
        Upscale Images
      </span>
      <div className=" columns-2 ">
        {upscaleImageList.map((imgUrl, index) => {
          return (
            <div className=" w-full h-full rounded-md flex-center relative mb-2 ">
              <img
                src={imgUrl}
                key={imgUrl}
                alt="midjourney image"
                className={`rounded-md  w-[100px] h-auto cursor-pointer hover:scale-105 transition-all duration-200`}
              ></img>
              <button
                type="button"
                onClick={() => {
                  deleteUpscaleImgs(index);
                }}
                className="active:translate-y-[1px] absolute right-1 top-1 rounded-md hover:stroke-red-500 bg-transparent  transition-all duration-200"
              >
                <TrashIcon width={20} height={20} color="white"></TrashIcon>
              </button>
            </div>
          );
        })}
      </div>
      <span
        className={`self-start mb-2 text-white/70 hidden ${
          zoomImageList.length > 0 && open && "!block"
        }`}
      >
        Zoom Images
      </span>
      <div className=" columns-2 ">
        {zoomImageList.map((imgUrl, index) => {
          return (
            <div className=" w-full h-full rounded-md flex-center relative mb-2 ">
              <img
                src={imgUrl}
                key={imgUrl}
                alt="midjourney image"
                className={`rounded-md  w-[100px] h-auto cursor-pointer hover:scale-105 transition-all duration-200`}
              ></img>
              <button
                type="button"
                onClick={() => {
                  deleteZoomImgs(index);
                }}
                className="active:translate-y-[1px] absolute right-1 top-1 rounded-md hover:stroke-red-500 bg-transparent  transition-all duration-200"
              >
                <TrashIcon width={20} height={20} color="white"></TrashIcon>
              </button>
            </div>
          );
        })}
      </div>
      <span
        className={`self-start mb-2 text-white/70 hidden ${
          expandImageList.length > 0 && open && "!block"
        }`}
      >
        Expand Images
      </span>
      <div className=" columns-2 ">
        {expandImageList.map((imgUrl, index) => {
          return (
            <div className=" w-full h-full rounded-md flex-center relative mb-2 ">
              <img
                src={imgUrl}
                key={imgUrl}
                alt="midjourney image"
                className={`rounded-md  w-[100px] h-auto cursor-pointer hover:scale-105 transition-all duration-200`}
              ></img>
              <button
                type="button"
                onClick={() => {
                  deleteExpandImgs(index);
                }}
                className="active:translate-y-[1px] absolute right-1 top-1 rounded-md hover:stroke-red-500 bg-transparent  transition-all duration-200"
              >
                <TrashIcon width={20} height={20} color="white"></TrashIcon>
              </button>
            </div>
          );
        })}
      </div>
      <span
        className={`self-start mb-2 text-white/70 hidden ${
          blendImageList.length > 0 && open && "!block"
        }`}
      >
        Blend Images
      </span>
      <div className=" columns-2 ">
        {blendImageList.map((imgUrl, index) => {
          return (
            <div className=" w-full h-full rounded-md flex-center relative mb-2 ">
              <img
                src={imgUrl}
                key={imgUrl}
                alt="midjourney image"
                className={`rounded-md  w-[100px] h-auto cursor-pointer hover:scale-105 transition-all duration-200`}
              ></img>
              <button
                type="button"
                onClick={() => {
                  deleteBlendImgs(index);
                }}
                className="active:translate-y-[1px] absolute right-1 top-1 rounded-md hover:stroke-red-500 bg-transparent  transition-all duration-200"
              >
                <TrashIcon width={20} height={20} color="white"></TrashIcon>
              </button>
            </div>
          );
        })}
      </div>
      <span
        className={`self-start mb-2 text-white/70 hidden ${
          inpaintImageList.length > 0 && open && "!block"
        }`}
      >
        Inpaint Images
      </span>
      <div className=" columns-2 ">
        {inpaintImageList.map((imgUrl, index) => {
          return (
            <div className=" w-full h-full rounded-md flex-center relative mb-2 ">
              <img
                src={imgUrl}
                key={imgUrl}
                alt="midjourney image"
                className={`rounded-md  w-[100px] h-auto cursor-pointer hover:scale-105 transition-all duration-200`}
              ></img>
              <button
                type="button"
                onClick={() => {
                  deleteInpaintImgs(index);
                }}
                className="active:translate-y-[1px] absolute right-1 top-1 rounded-md hover:stroke-red-500 bg-transparent  transition-all duration-200"
              >
                <TrashIcon width={20} height={20} color="white"></TrashIcon>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
