"use client";
import React from "react";
export default function Create() {
  

  return (
    <div className="flex items-center  p-12 text-white">
      <form
        action="post"
        className="flex flex-col gap-6 items-center justify-center"
      >
        <textarea cols={20} rows={5} className="bg-white/60"></textarea>
        <button className=" bg-white/60 rounded-lg p-4" onSubmit={() => {}}>
          生成
        </button>
      </form>
      <div className=" w-[20rem] h-[20rem] bg-white/60 ml-6"></div>
    </div>
  );
}
