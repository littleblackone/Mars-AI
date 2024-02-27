"use client";

import { useOriginImage } from "@/lib/store/useOriginImage";
import { useUpscaleImage } from "@/lib/store/useUpscaleImage";
import { useVaryImage } from "@/lib/store/useVaryImage";
import { useEffect, useState } from "react";

import { useZoomImages } from "@/lib/store/useZoomImages";
import { useExpandImages } from "@/lib/store/useExpandImages";
import { useBlendImages } from "@/lib/store/useBlendImages";
import { TrashIcon } from "@radix-ui/react-icons";
import { useInpaintImages } from "@/lib/store/useInpaintImages";
import Link from "next/link";

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

  // const originImageList = [
  //   "https://cdn.midjourney.com/a5de8d18-0392-4061-97c3-f2907e60c0e9/0_1.webp",
  //   "https://cdn.midjourney.com/ffd8ffcd-3abf-4349-831b-71a79b682d6f/0_3.webp",
  //   "https://cdn.midjourney.com/a5de8d18-0392-4061-97c3-f2907e60c0e9/0_1.webp",
  //   "https://cdn.midjourney.com/ffd8ffcd-3abf-4349-831b-71a79b682d6f/0_3.webp",
  //   "https://cdn.midjourney.com/a5de8d18-0392-4061-97c3-f2907e60c0e9/0_1.webp",
  //   "https://cdn.midjourney.com/ffd8ffcd-3abf-4349-831b-71a79b682d6f/0_1.webp",
  //   "https://cdn.midjourney.com/ffd8ffcd-3abf-4349-831b-71a79b682d6f/0_2.webp",
  //   "https://cdn.midjourney.com/88fe7e90-8672-4fab-ad6f-a4bca0e0dac2/0_0.webp",
  //   "https://cdn.midjourney.com/132d59ca-7fb4-4c35-8505-3fee440ca046/0_0.webp",
  //   "https://cdn.midjourney.com/8fd5387d-470b-41c4-9f9c-c71c521a51d7/0_3.webp",
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
    <>
      <div className=" relative">
        <span
          className={`self-start mb-2 text-neutral-800 text-sm  hidden ${
            originImageList.length > 0 && "!block"
          }`}
        >
          Origin Images
        </span>
        <div className=" grid grid-cols-2 gap-2">
          {originImageList.map((imgUrl, index) => {
            return (
              <Link
                href={`/create/fullImage?index=${index}&imgListName=originImageList&imgUrl=${imgUrl}`}
              >
                <div className=" w-[140px] h-[140px]">
                  <img
                    src={imgUrl}
                    key={imgUrl}
                    alt="midjourney image"
                    className={`rounded-md w-full h-full object-cover  cursor-pointer hover:scale-105 transition-all duration-200`}
                  ></img>
                </div>
              </Link>
            );
          })}
        </div>
        <span
          className={`self-start mb-2 text-neutral-800 text-sm  hidden ${
            varyImageList.length > 0 && "!block"
          }`}
        >
          Vary Images
        </span>
        <div className=" grid grid-cols-2 gap-2">
          {varyImageList.map((imgUrl, index) => {
            return (
              <Link
                href={`/create/fullImage?index=${index}&imgListName=varyImageList&imgUrl=${imgUrl}`}
              >
                <div className=" w-[140px] h-[140px]">
                  <img
                    src={imgUrl}
                    key={imgUrl}
                    alt="midjourney image"
                    className={`rounded-md w-full h-full object-cover  cursor-pointer hover:scale-105 transition-all duration-200`}
                  ></img>
                </div>
              </Link>
            );
          })}
        </div>
        <span
          className={`self-start mb-2 text-neutral-800 text-sm  hidden ${
            upscaleImageList.length > 0 && "!block"
          }`}
        >
          Upscale Images
        </span>
        <div className=" grid grid-cols-2 gap-2">
          {upscaleImageList.map((imgUrl, index) => {
            return (
              <Link
                href={`/create/fullImage?index=${index}&imgListName=upscaleImageList&imgUrl=${imgUrl}`}
              >
                <div className=" w-[140px] h-[140px]">
                  <img
                    src={imgUrl}
                    key={imgUrl}
                    alt="midjourney image"
                    className={`rounded-md w-full h-full object-cover  cursor-pointer hover:scale-105 transition-all duration-200`}
                  ></img>
                </div>
              </Link>
            );
          })}
        </div>
        <span
          className={`self-start mb-2 text-neutral-800 text-sm  hidden ${
            zoomImageList.length > 0 && "!block"
          }`}
        >
          Zoom Images
        </span>
        <div className=" grid grid-cols-2 gap-2">
          {zoomImageList.map((imgUrl, index) => {
            return (
              <Link
                href={`/create/fullImage?index=${index}&imgListName=zoomImageList&imgUrl=${imgUrl}`}
              >
                <div className=" w-[140px] h-[140px]">
                  <img
                    src={imgUrl}
                    key={imgUrl}
                    alt="midjourney image"
                    className={`rounded-md w-full h-full object-cover  cursor-pointer hover:scale-105 transition-all duration-200`}
                  ></img>
                </div>
              </Link>
            );
          })}
        </div>
        <span
          className={`self-start mb-2 text-neutral-800 text-sm  hidden ${
            expandImageList.length > 0 && "!block"
          }`}
        >
          Expand Images
        </span>
        <div className=" grid grid-cols-2 gap-2">
          {expandImageList.map((imgUrl, index) => {
            return (
              <Link
                href={`/create/fullImage?index=${index}&imgListName=expandImageList&imgUrl=${imgUrl}`}
              >
                <div className=" w-[140px] h-[140px]">
                  <img
                    src={imgUrl}
                    key={imgUrl}
                    alt="midjourney image"
                    className={`rounded-md w-full h-full object-cover  cursor-pointer hover:scale-105 transition-all duration-200`}
                  ></img>
                </div>
              </Link>
            );
          })}
        </div>
        <span
          className={`self-start mb-2 text-neutral-800 text-sm  hidden ${
            blendImageList.length > 0 && "!block"
          }`}
        >
          Blend Images
        </span>
        <div className=" grid grid-cols-2 gap-2">
          {blendImageList.map((imgUrl, index) => {
            return (
              <Link
                href={`/create/fullImage?index=${index}&imgListName=blendImageList&imgUrl=${imgUrl}`}
              >
                <div className=" w-[140px] h-[140px]">
                  <img
                    src={imgUrl}
                    key={imgUrl}
                    alt="midjourney image"
                    className={`rounded-md w-full h-full object-cover  cursor-pointer hover:scale-105 transition-all duration-200`}
                  ></img>
                </div>
              </Link>
            );
          })}
        </div>
        <span
          className={`self-start mb-2 text-neutral-800 text-sm  hidden ${
            inpaintImageList.length > 0 && "!block"
          }`}
        >
          Inpaint Images
        </span>
        <div className=" grid grid-cols-2 gap-2">
          {inpaintImageList.map((imgUrl, index) => {
            return (
              <Link
                href={`/create/fullImage?index=${index}&imgListName=inpaintImageList&imgUrl=${imgUrl}`}
              >
                <div className=" w-[140px] h-[140px]">
                  <img
                    src={imgUrl}
                    key={imgUrl}
                    alt="midjourney image"
                    className={`rounded-md w-full h-full object-cover  cursor-pointer hover:scale-105 transition-all duration-200`}
                  ></img>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
