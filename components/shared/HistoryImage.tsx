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
import { useUser } from "@clerk/nextjs";
import { supabaseCli } from "@/lib/supabase/supabaseClient";
import { UserData } from "@/lib/interface/ImageData";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../ui/hover-card";

export default function HistoryImage() {
  const originImageList = useOriginImage((state) => state.images);

  const varyImageList = useVaryImage((state) => state.images);

  const upscaleImageList = useUpscaleImage((state) => state.images);

  const zoomImageList = useZoomImages((state) => state.images);

  const expandImageList = useExpandImages((state) => state.images);

  const blendImageList = useBlendImages((state) => state.images);

  const inpaintImageList = useInpaintImages((state) => state.images);

  const allImages = [...originImageList, ...varyImageList, ...expandImageList, ...zoomImageList, ...upscaleImageList, ...blendImageList, ...inpaintImageList]
  const [allImg, setAllImg] = useState(allImages)
  const [canUseAllDownload, setCanUseAllDownload] = useState(false)

  const { user } = useUser()
  const email = user?.emailAddresses[0].emailAddress

  useEffect(() => {
    const getUserSubsType = async () => {
      const supabase = supabaseCli();
      const res = await supabase
        .from("infinityai_352020833zsx_users")
        .select()
        .eq("email", email);
      const realData: UserData = res.data && res.data[0];
      console.log(realData.subscription_type);

      if (realData?.subscription_type === "month" || realData?.subscription_type === "year") {
        setCanUseAllDownload(true)
      } else {
        setCanUseAllDownload(false)
      }
    };
    getUserSubsType()
  }, [])


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
          <HoverCard openDelay={300}>
            <HoverCardTrigger>
              <Button type="button" disabled={canUseAllDownload === false || allImg.length === 0} variant='outline' onClick={() => {
                handleDownloadBase64s(allImg)
              }} className="flex dark:text-white dark:bg-[#2e426b] gap-2 cursor-pointer">
                下载全部{canUseAllDownload}
                <CrownIcon width={20} height={20} color="#818CF8"></CrownIcon>
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className=" w-fit">
              <p className="text-white text-sm">
                仅提供給按周期订阅用户使用
              </p>
            </HoverCardContent>
          </HoverCard>

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
