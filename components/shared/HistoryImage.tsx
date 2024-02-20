"use client";

import { useOriginImage } from "@/lib/store/useOriginImage";
import { useUpscaleImage } from "@/lib/store/useUpscaleImage";
import { useVaryImage } from "@/lib/store/useVaryImage";
import { useEffect, useState } from "react";
import ArrowSvg from "./ArrowSvg";
import { useOpenHistory } from "@/lib/store/useOpenHistory";
import { useZoomImages } from "@/lib/store/useZoomImages";
import { useExpandImages } from "@/lib/store/useExpandImages";

export default function HistoryImage() {
  const originImageList = useOriginImage((state) => state.images);
  const varyImageList = useVaryImage((state) => state.images);
  const upscaleImageList = useUpscaleImage((state) => state.images);
  const zoomImageList = useZoomImages((state) => state.images);
  const expandImageList = useExpandImages((state) => state.images);

  const [isOpenHistoryArea, setIsOpenHistoryArea] = useState(false);

  const open = useOpenHistory((state) => state.open);
  useEffect(() => {
    setIsOpenHistoryArea(
      originImageList.length > 0 ||
        varyImageList.length > 0 ||
        upscaleImageList.length > 0
    );
  }, [originImageList, varyImageList, upscaleImageList]);

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
        {originImageList.map((imgUrl) => {
          return (
            <img
              src={imgUrl}
              key={imgUrl}
              alt="midjourney image"
              className={`rounded-md mb-2 w-[100px]  cursor-pointer hover:scale-105 transition-all duration-200`}
            ></img>
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
        {varyImageList.map((imgUrl) => {
          return (
            <img
              key={imgUrl}
              src={imgUrl}
              alt="midjourney image"
              className={`rounded-md mb-2 w-[100px]  aspect-square cursor-pointer hover:scale-105 transition-all duration-200`}
            ></img>
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
        {upscaleImageList.map((imgUrl) => {
          return (
            <img
              src={imgUrl}
              key={imgUrl}
              alt="midjourney image"
              className={`rounded-md mb-2 w-[100px]  aspect-square cursor-pointer hover:scale-105 transition-all duration-200`}
            ></img>
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
        {zoomImageList.map((imgUrl) => {
          return (
            <img
              src={imgUrl}
              key={imgUrl}
              alt="midjourney image"
              className={`rounded-md mb-2 w-[100px]  aspect-square cursor-pointer hover:scale-105 transition-all duration-200`}
            ></img>
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
        {expandImageList.map((imgUrl) => {
          return (
            <img
              src={imgUrl}
              key={imgUrl}
              alt="midjourney image"
              className={`rounded-md mb-2 w-[100px]  aspect-square cursor-pointer hover:scale-105 transition-all duration-200`}
            ></img>
          );
        })}
      </div>
    </div>
  );
}
