"use client";

import ArrowSvg from "@/components/shared/ArrowSvg";
import HistoryImage from "@/components/shared/HistoryImage";
import { ImageForm } from "@/components/shared/ImageForm";
import { useOpenHistory } from "@/lib/store/useOpenHistory";
import { useOriginImage } from "@/lib/store/useOriginImage";
import { useUpscaleImage } from "@/lib/store/useUpscaleImage";
import { useVaryImage } from "@/lib/store/useVaryImage";
import { useEffect, useState } from "react";

export default function Create() {
  const originImageList = useOriginImage((state) => state.images);
  const varyImageList = useVaryImage((state) => state.images);
  const upscaleImageList = useUpscaleImage((state) => state.images);

  const [isOpenHistoryArea, setIsOpenHistoryArea] = useState(false);

  const setOpen = useOpenHistory((state) => state.setOpen);
  const open = useOpenHistory((state) => state.open);

  useEffect(() => {
    setIsOpenHistoryArea(
      originImageList.length > 0 ||
        varyImageList.length > 0 ||
        upscaleImageList.length > 0
    );
  }, [originImageList, varyImageList, upscaleImageList]);

  const handleOpen = () => {
    console.log(open);

    setOpen(!open);
  };

  return (
    <div className=" relative p-12 px-6 pr-0 flex form-shadow  items-start min-w-[1480px] w-full h-full bg-create-bg  rounded-xl ">
      <ImageForm></ImageForm>
      {/* <HistoryImage></HistoryImage>
      <div
        className={` absolute w-8 h-8 bg-white/60 hover:bg-white/70 transition-all duration-200 cursor-pointer rounded-full -right-4 top-[50%] hidden ${
          isOpenHistoryArea && "flex-center"
        }`}
        onClick={() => handleOpen()}
      >
        <ArrowSvg open={open}></ArrowSvg>
      </div> */}
    </div>
  );
}
