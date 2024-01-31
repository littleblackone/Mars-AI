"use client";
import axios from "axios";
import Image from "next/image";
import React, { useState } from "react";
import { ImageData } from "../interface/ImageData";

export default function Create() {
  const [prompt, setPrompt] = useState<string>("");
  const [imageDatas, setImageDatas] = useState<ImageData>();

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(event.target.value);
  };

  const handleGenerateImage = async () => {
    try {
      const response: { task_result: ImageData } = await axios.post(
        "/api/discord",
        { prompt },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response.task_result);

      setImageDatas(response.task_result);
    } catch (error) {
      console.error("Error sending prompt:", error);
    }
  };

  return (
    <div className="flex items-center  p-12 text-white">
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
      >
        生成{imageDatas?.task_progress}
      </button>

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
