"use client";

export default function HistoryImage() {
  const originImageList = [
    "https://cdn.midjourney.com/ffd8ffcd-3abf-4349-831b-71a79b682d6f/0_0.webp",
    "https://cdn.midjourney.com/ffd8ffcd-3abf-4349-831b-71a79b682d6f/0_1.webp",
    "https://cdn.midjourney.com/ffd8ffcd-3abf-4349-831b-71a79b682d6f/0_2.webp",
    "https://cdn.midjourney.com/ffd8ffcd-3abf-4349-831b-71a79b682d6f/0_3.webp",
  ];
  const varyImageList = [
    "https://cdn.midjourney.com/79cc2747-00c6-41bb-9e2b-d4f87223dac5/0_0.webp",
    "https://cdn.midjourney.com/79cc2747-00c6-41bb-9e2b-d4f87223dac5/0_1.webp",
    "https://cdn.midjourney.com/79cc2747-00c6-41bb-9e2b-d4f87223dac5/0_2.webp",
    "https://cdn.midjourney.com/79cc2747-00c6-41bb-9e2b-d4f87223dac5/0_3.webp",
  ];
  const upscaleImageList = [
    "https://cdn.midjourney.com/4098da5a-9af2-4a11-86ab-202931d8c31b/0_0.webp",
    "https://cdn.midjourney.com/4098da5a-9af2-4a11-86ab-202931d8c31b/0_1.webp",
  ];

  return (
    <div className="hide-scrollbar py-2 px-4 max-w-[20rem] max-h-[735px] flex flex-col overflow-y-scroll">
      <span className=" self-start mb-2 text-white/70">Origin Images</span>
      <div className=" columns-2 ">
        {originImageList.map((imgUrl) => {
          return (
            <img
              src={imgUrl}
              alt="midjourney image"
              className={`rounded-md mb-2 w-[100px]  aspect-square cursor-pointer hover:scale-105 transition-all duration-200`}
            ></img>
          );
        })}
      </div>
      <span className=" self-start mb-2 text-white/70">Vary Images</span>
      <div className=" columns-2 ">
        {varyImageList.map((imgUrl) => {
          return (
            <img
              src={imgUrl}
              alt="midjourney image"
              className={`rounded-md mb-2 w-[100px]  aspect-square cursor-pointer hover:scale-105 transition-all duration-200`}
            ></img>
          );
        })}
      </div>
      <span className=" self-start mb-2 text-white/70">Upscale Images</span>
      <div className=" columns-2 ">
        {upscaleImageList.map((imgUrl) => {
          return (
            <img
              src={imgUrl}
              alt="midjourney image"
              className={`rounded-md mb-2 w-[100px]  aspect-square cursor-pointer hover:scale-105 transition-all duration-200`}
            ></img>
          );
        })}
      </div>
    </div>
  );
}
