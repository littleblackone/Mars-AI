"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import CustomLink from "./CustomLink";
import { useUser } from "@clerk/nextjs";
export default function Header() {
  const user = useUser()


  return (
    <>
      <div className="flex gap-2 items-center absolute top-4 left-4">
        <Link href="/" className="flex items-center ">
          <Image src="/logo.png" alt="logo" height={52} width={52}></Image>
          <p className=" text-lg text-white font-medium">Infinity AI</p>
        </Link>
      </div>
      <div className=" pr-8 pt-4 flex items-center w-full justify-end text-white">
        <div className="flex">
          <ul className="flex gap-4 items-center text-lg">
            <CustomLink href="/sign-in" text="登 录"></CustomLink>
            <CustomLink href="#price" text="订 阅"></CustomLink>
          </ul>
        </div>
      </div>
    </>

  );
}
