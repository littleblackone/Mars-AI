"use client";

import { ImageForm } from "@/components/shared/ImageForm";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Create() {
  const router = useRouter();
  return (
    <div className=" relative flex form-shadow  items-start  w-full max-h-screen overflow-hidden bg-white ">
      <ImageForm></ImageForm>
    </div>
  )

}
