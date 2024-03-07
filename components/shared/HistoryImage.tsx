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
import { CrownIcon, HistoryIcon } from "lucide-react";
import { Button } from "../ui/button";
import { handleDownloadBase64s } from "@/lib/utils";

export default function HistoryImage() {
  const originImageList = useOriginImage((state) => state.images);
  // const originImageList = ['https://cdn.midjourney.com/b944e6f2-471e-4a2e-84f1-f68288849407/0_0.webp', 'https://cdn.midjourney.com/fbb38c35-9cc2-44bb-8698-d49e194c0b0d/0_2.webp']
  const varyImageList = useVaryImage((state) => state.images);
  // const varyImageList = ['https://cdn.midjourney.com/20c41fcd-880c-48e6-a118-5dd6489567a4/0_1.webp', 'https://cdn.midjourney.com/5f5de889-e361-4774-bf8c-665ce4ce001e/0_2.webp']
  const upscaleImageList = useUpscaleImage((state) => state.images);
  // const upscaleImageList = ['https://cdn.midjourney.com/aad5febf-145b-40f1-a640-6bbd8f693357/0_0.webp', 'https://cdn.midjourney.com/44339176-fc90-41c9-804c-2d941bf498d4/0_0.webp']

  const zoomImageList = useZoomImages((state) => state.images);
  // const zoomImageList = ['https://cdn.midjourney.com/f7edb641-bc1b-44ba-93a3-1c6c0430b64c/0_0.webp', 'https://cdn.midjourney.com/57be4dbd-deae-47f5-a193-2b7018f06f1a/0_1.webp']
  const expandImageList = useExpandImages((state) => state.images);
  // const expandImageList = ['https://cdn.midjourney.com/aad5febf-145b-40f1-a640-6bbd8f693357/0_0.webp', 'https://cdn.midjourney.com/44339176-fc90-41c9-804c-2d941bf498d4/0_0.webp']
  const blendImageList = useBlendImages((state) => state.images);
  // const blendImageList = ['https://cdn.midjourney.com/b944e6f2-471e-4a2e-84f1-f68288849407/0_0.webp', 'https://cdn.midjourney.com/fbb38c35-9cc2-44bb-8698-d49e194c0b0d/0_2.webp']
  const inpaintImageList = useInpaintImages((state) => state.images);
  // const inpaintImageList = ['https://cdn.midjourney.com/aad5febf-145b-40f1-a640-6bbd8f693357/0_0.webp', 'https://cdn.midjourney.com/44339176-fc90-41c9-804c-2d941bf498d4/0_0.webp']
  const allImages = [...originImageList, ...varyImageList, ...expandImageList, ...zoomImageList, ...upscaleImageList, ...blendImageList, ...inpaintImageList]
  const [allImg, setAllImg] = useState(allImages)

  useEffect(() => {
    setAllImg([...originImageList, ...varyImageList, ...expandImageList, ...zoomImageList, ...upscaleImageList, ...blendImageList, ...inpaintImageList])
  }, [inpaintImageList, blendImageList, expandImageList, zoomImageList, upscaleImageList, varyImageList, originImageList])


  const setIndex = useFullViewImage((state) => state.setIndex);
  const setOpen = useFullViewImage((state) => state.setOpen);
  const setImgUrl = useFullViewImage((state) => state.setImgUrl);
  const setImgListName = useFullViewImage((state) => state.setImgListName);

  return (
    <>
      <div className=" relative">
        <div className="flex justify-between items-center my-4">
          <div className="flex gap-2 items-center">
            <HistoryIcon color="gray"></HistoryIcon>
            <span className=" font-medium text-[15px] dark:text-gray-400 text-gray-600">
              历史图片
            </span>
          </div>
          <Button type="button" variant='outline' onClick={() => {
            handleDownloadBase64s(allImg)
          }} className="flex dark:text-white dark:bg-[#2e426b] gap-2">
            下载全部
            <CrownIcon width={20} height={20} color="#818CF8"></CrownIcon>
          </Button>
        </div>
        <Accordion
          type="multiple"
          defaultValue={["originImages"]}
          className=" w-full"
        >
          {originImageList.length > 0 && (
            <AccordionItem value="originImages ">
              <AccordionTrigger>
                <span
                  className={`self-start  mb-2 text-neutral-800 dark:text-gray-300  text-sm hidden ${originImageList.length > 0 && "!block"
                    }`}
                >
                  imagine Images
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className=" grid grid-cols-2 gap-2">
                  {originImageList.map((imgUrl, index) => {
                    return (
                      imgUrl !== "" && (
                        <div className=" w-[140px] h-[140px]" key={index}>
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
                  className={`self-start mb-2 text-neutral-800 dark:text-gray-300 text-sm  hidden ${varyImageList.length > 0 && "!block"
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
                        <div className=" w-[140px] h-[140px]" key={index}>
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
                  className={`self-start mb-2 text-neutral-800 dark:text-gray-300 text-sm  hidden ${upscaleImageList.length > 0 && "!block"
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
                        <div className=" w-[140px] h-[140px]" key={index}>
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
                  className={`self-start mb-2 text-neutral-800 dark:text-gray-300 text-sm  hidden ${zoomImageList.length > 0 && "!block"
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
                        <div className=" w-[140px] h-[140px]" key={index}>
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
                  className={`self-start mb-2 text-neutral-800 dark:text-gray-300 text-sm  hidden ${expandImageList.length > 0 && "!block"
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
                        <div className=" w-[140px] h-[140px]" key={index}>
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
                  className={`self-start mb-2 text-neutral-800 dark:text-gray-300 text-sm  hidden ${blendImageList.length > 0 && "!block"
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
                        <div className=" w-[140px] h-[140px]" key={index}>
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
                  className={`self-start mb-2 text-neutral-800 dark:text-gray-300 text-sm  hidden ${inpaintImageList.length > 0 && "!block"
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
                        <div className=" w-[140px] h-[140px]" key={index}>
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
