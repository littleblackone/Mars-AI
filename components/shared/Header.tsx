"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import CustomLink from "./CustomLink";
export default function Header() {
  return (
    <div className=" px-32 py-12 pb-0 flex items-center w-full justify-between text-[#F4DFB6]">
      <div className="flex gap-[4rem]">
        <Link href="/" className="flex items-center ">
          <Image src="/logo.png" alt="logo" height={52} width={52}></Image>
          <p className=" text-lg text-white font-medium">MARS AI</p>
        </Link>
        <ul className="flex gap-12 items-center text-xl">
          <CustomLink href="/create" text="创 造"></CustomLink>
          <CustomLink href="/order" text="订 阅"></CustomLink>
        </ul>
      </div>

      {/* <div className="text-xl">登&nbsp;&nbsp;录</div> */}
    </div>
  );
}
