"use client";

import { useOriginImage } from "@/lib/store/ImagesList/useOriginImage";
import { useUpscaleImage } from "@/lib/store/ImagesList/useUpscaleImage";
import { useVaryImage } from "@/lib/store/ImagesList/useVaryImage";
import { useEffect, useState } from "react";

import { useZoomImages } from "@/lib/store/ImagesList/useZoomImages";
import { useExpandImages } from "@/lib/store/ImagesList/useExpandImages";
import { useBlendImages } from "@/lib/store/ImagesList/useBlendImages";
import { TrashIcon } from "@radix-ui/react-icons";
import { useInpaintImages } from "@/lib/store/ImagesList/useInpaintImages";
import Link from "next/link";
import FullViewImg from "./FullViewImg";
import { useFullViewImage } from "@/lib/store/useFullViewImage";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { HistoryIcon } from "lucide-react";

export default function HistoryImage() {
  const originImageList = useOriginImage((state) => state.images);

  const varyImageList = useVaryImage((state) => state.images);

  const upscaleImageList = useUpscaleImage((state) => state.images);

  const zoomImageList = useZoomImages((state) => state.images);

  const expandImageList = useExpandImages((state) => state.images);

  const blendImageList = useBlendImages((state) => state.images);

  const inpaintImageList = useInpaintImages((state) => state.images);

  const setIndex = useFullViewImage((state) => state.setIndex);
  const setOpen = useFullViewImage((state) => state.setOpen);
  const setImgUrl = useFullViewImage((state) => state.setImgUrl);
  const setImgListName = useFullViewImage((state) => state.setImgListName);

  return (
    <>
      <div className=" relative">
        <div className="flex gap-2 items-center my-4">
          <HistoryIcon color="gray"></HistoryIcon>
          <span className=" font-medium text-[15px] text-gray-600">
            History Images
          </span>
        </div>
        <Accordion
          type="multiple"
          defaultValue={["originImages"]}
          className=" w-full"
        >
          {originImageList.length > 0 && (
            <AccordionItem value="originImages">
              <AccordionTrigger>
                <span
                  className={`self-start  mb-2 text-neutral-800 text-sm  hidden ${
                    originImageList.length > 0 && "!block"
                  }`}
                >
                  Origin Images
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className=" grid grid-cols-2 gap-2">
                  {originImageList.map((imgUrl, index) => {
                    return (
                      imgUrl !== "" && (
                        <div className=" w-[140px] h-[140px]">
                          <img
                            src={imgUrl}
                            key={imgUrl}
                            onClick={() => {
                              setIndex(index);
                              setImgUrl(imgUrl);
                              setImgListName("originImageList");
                              setOpen(true);
                            }}
                            alt="midjourney image"
                            className={`rounded-md w-full h-full object-cover  cursor-pointer hover:scale-105 transition-all duration-200`}
                          ></img>
                        </div>
                      )
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {varyImageList.length > 0 && (
            <AccordionItem value="varyImages">
              <AccordionTrigger>
                <span
                  className={`self-start mb-2 text-neutral-800 text-sm  hidden ${
                    varyImageList.length > 0 && "!block"
                  }`}
                >
                  Vary Images
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className=" grid grid-cols-2 gap-2">
                  {varyImageList.map((imgUrl, index) => {
                    return (
                      imgUrl !== "" && (
                        <div className=" w-[140px] h-[140px]">
                          <img
                            src={imgUrl}
                            onClick={() => {
                              setIndex(index);
                              setImgUrl(imgUrl);
                              setImgListName("varyImageList");
                              setOpen(true);
                            }}
                            key={imgUrl}
                            alt="midjourney image"
                            className={`rounded-md w-full h-full object-cover  cursor-pointer hover:scale-105 transition-all duration-200`}
                          ></img>
                        </div>
                      )
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {upscaleImageList.length > 0 && (
            <AccordionItem value="upscaleImages">
              <AccordionTrigger>
                <span
                  className={`self-start mb-2 text-neutral-800 text-sm  hidden ${
                    upscaleImageList.length > 0 && "!block"
                  }`}
                >
                  Upscale Images
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className=" grid grid-cols-2 gap-2">
                  {upscaleImageList.map((imgUrl, index) => {
                    return (
                      imgUrl !== "" && (
                        <div className=" w-[140px] h-[140px]">
                          <img
                            src={imgUrl}
                            onClick={() => {
                              setIndex(index);
                              setImgUrl(imgUrl);
                              setImgListName("upscaleImageList");
                              setOpen(true);
                            }}
                            key={imgUrl}
                            alt="midjourney image"
                            className={`rounded-md w-full h-full object-cover  cursor-pointer hover:scale-105 transition-all duration-200`}
                          ></img>
                        </div>
                      )
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {zoomImageList.length > 0 && (
            <AccordionItem value="zoomImages">
              <AccordionTrigger>
                <span
                  className={`self-start mb-2 text-neutral-800 text-sm  hidden ${
                    zoomImageList.length > 0 && "!block"
                  }`}
                >
                  Zoom Images
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className=" grid grid-cols-2 gap-2">
                  {zoomImageList.map((imgUrl, index) => {
                    return (
                      imgUrl !== "" && (
                        <div className=" w-[140px] h-[140px]">
                          <img
                            src={imgUrl}
                            onClick={() => {
                              setIndex(index);
                              setImgUrl(imgUrl);
                              setImgListName("zoomImageList");
                              setOpen(true);
                            }}
                            key={imgUrl}
                            alt="midjourney image"
                            className={`rounded-md w-full h-full object-cover  cursor-pointer hover:scale-105 transition-all duration-200`}
                          ></img>
                        </div>
                      )
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {expandImageList.length > 0 && (
            <AccordionItem value="expandImages">
              <AccordionTrigger>
                <span
                  className={`self-start mb-2 text-neutral-800 text-sm  hidden ${
                    expandImageList.length > 0 && "!block"
                  }`}
                >
                  Expand Images
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className=" grid grid-cols-2 gap-2">
                  {expandImageList.map((imgUrl, index) => {
                    return (
                      imgUrl !== "" && (
                        <div className=" w-[140px] h-[140px]">
                          <img
                            src={imgUrl}
                            key={imgUrl}
                            onClick={() => {
                              setIndex(index);
                              setImgUrl(imgUrl);
                              setImgListName("expandImageList");
                              setOpen(true);
                            }}
                            alt="midjourney image"
                            className={`rounded-md w-full h-full object-cover  cursor-pointer hover:scale-105 transition-all duration-200`}
                          ></img>
                        </div>
                      )
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {blendImageList.length > 0 && (
            <AccordionItem value="blendImages">
              <AccordionTrigger>
                <span
                  className={`self-start mb-2 text-neutral-800 text-sm  hidden ${
                    blendImageList.length > 0 && "!block"
                  }`}
                >
                  Blend Images
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className=" grid grid-cols-2 gap-2">
                  {blendImageList.map((imgUrl, index) => {
                    return (
                      imgUrl !== "" && (
                        <div className=" w-[140px] h-[140px]">
                          <img
                            src={imgUrl}
                            key={imgUrl}
                            onClick={() => {
                              setIndex(index);
                              setImgUrl(imgUrl);
                              setImgListName("blendImageList");
                              setOpen(true);
                            }}
                            alt="midjourney image"
                            className={`rounded-md w-full h-full object-cover  cursor-pointer hover:scale-105 transition-all duration-200`}
                          ></img>
                        </div>
                      )
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {inpaintImageList.length > 0 && (
            <AccordionItem value="inpaintImages">
              <AccordionTrigger>
                <span
                  className={`self-start mb-2 text-neutral-800 text-sm  hidden ${
                    inpaintImageList.length > 0 && "!block"
                  }`}
                >
                  Inpaint Images
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className=" grid grid-cols-2 gap-2">
                  {inpaintImageList.map((imgUrl, index) => {
                    return (
                      imgUrl !== "" && (
                        <div className=" w-[140px] h-[140px]">
                          <img
                            src={imgUrl}
                            key={imgUrl}
                            onClick={() => {
                              setIndex(index);
                              setImgUrl(imgUrl);
                              setImgListName("inpaintImageList");
                              setOpen(true);
                            }}
                            alt="midjourney image"
                            className={`rounded-md w-full h-full object-cover  cursor-pointer hover:scale-105 transition-all duration-200`}
                          ></img>
                        </div>
                      )
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </div>
    </>
  );
}
