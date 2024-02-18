"use client";

import HistoryImage from "@/components/shared/HistoryImage";
import { ImageForm } from "@/components/shared/ImageForm";

export default function Create() {
  return (
    <div className="p-12 px-6 pr-0 flex form-shadow  items-start min-w-[1480px] w-full h-full bg-create-bg  rounded-xl ">
      <ImageForm></ImageForm>
      <HistoryImage></HistoryImage>
    </div>
  );
}
