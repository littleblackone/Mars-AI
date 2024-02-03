"use client";
import axios from "axios";
import Image from "next/image";
import React, { useState } from "react";

import { debounce } from "@/lib/utils";
import { ImageData } from "../interface/ImageData";
import { ImageForm } from "@/components/shared/ImageForm";

export default function Create() {
  const [prompt, setPrompt] = useState<string>("");
  const [imageDatas, setImageDatas] = useState<ImageData>();
  const [isFetching, setIsFetching] = useState<boolean>(false);

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(event.target.value);
  };

  const handleGenerateImage = debounce(async () => {
    try {
      setIsFetching(true);
      const response = await axios.post("/api/imagine", { prompt });
      const taskId = response.data.task_id;

      const intervalId = setInterval(async () => {
        try {
          const taskResult: { data: ImageData } = await axios.post(
            "/api/fetchImage",
            { taskId }
          );

          if (taskResult.data.task_progress === 100) {
            clearInterval(intervalId);
            setImageDatas(taskResult.data);
            setIsFetching(false);
          }
        } catch (error) {
          console.error("Error fetching image:", error);
          setIsFetching(false);
        }
      }, 3000);
    } catch (error) {
      console.error("Error sending prompt:", error);
      setIsFetching(false);
    }
  }, 1000);

  return (
    <div className="p-12 px-6 flex items-start w-full h-full bg-white/70 rounded-xl ">
      <ImageForm></ImageForm>
    </div>
  );
}
