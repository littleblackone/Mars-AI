"use client";

import { ImageForm } from "@/components/shared/ImageForm";

export default function Create() {
  return (
    <div className="p-12 px-6 flex form-shadow  items-start min-w-[1160px] w-full h-full bg-create-bg  rounded-xl ">
      <ImageForm></ImageForm>
    </div>
  );
}
