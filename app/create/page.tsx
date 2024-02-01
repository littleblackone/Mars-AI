"use client";
import axios from "axios";
import Image from "next/image";
import React, { useState } from "react";
import { ImageData } from "../interface/ImageData";
import { Form } from "@/components/ui/form";
import { debounce } from "@/lib/utils";

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
    <div className="p-12 flex items-center w-full bg-white/70 rounded-xl h-screen justify-between  text-white">
      <div className=" flex flex-col gap-6 w-96 h-full ">
        <textarea
          cols={20}
          value={prompt}
          rows={5}
          className="bg-white/60"
          onChange={handleTextChange}
        ></textarea>
        <button
          className=" bg-white/60 rounded-lg p-4"
          onClick={handleGenerateImage}
          disabled={isFetching}
        >
          {imageDatas?.task_progress}
        </button>
      </div>

      <div className=" w-[20rem] h-[20rem] bg-white/60 ml-6">
        <Image
          src={
            imageDatas?.task_progress === 100
              ? imageDatas.image_url
              : "/loading.jpg"
          }
          width={320}
          height={320}
          alt="midjourney image"
        ></Image>
      </div>
    </div>
  );
}
