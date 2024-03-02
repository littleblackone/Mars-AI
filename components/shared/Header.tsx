"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import CustomLink from "./CustomLink";
export default function Header() {
  return (
    <>
      <div className="flex gap-2 items-center absolute top-4 left-4">
        <Link href="/" className="flex items-center ">
          <Image src="/logo.png" alt="logo" height={52} width={52}></Image>
          <p className=" text-lg text-white font-medium">Infinity AI</p>
        </Link>
      </div>
      <div className=" px-32 py-12 pb-0 flex items-center w-full justify-end text-[#F4DFB6]">
        <div className="flex gap-[4rem]">
          <ul className="flex gap-12 items-center text-xl">
            <CustomLink href="/login" text="登 录"></CustomLink>
            <CustomLink href="/order" text="订 阅"></CustomLink>
          </ul>
        </div>
      </div>
    </>

  );
}
