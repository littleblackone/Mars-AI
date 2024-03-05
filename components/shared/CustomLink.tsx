import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function CustomLink({
  href,
  text,
}: {
  href: string;
  text: string;
}) {
  const pathname = usePathname();
  return (
    <>
      <li className=" relative group">
        <Link href={href}>{text}</Link>
        <span
          className={`absolute h-[1px] group-hover:w-full  transition-all ease duration-300 inline-block bg-white left-1/2 transform -translate-x-1/2 -bottom-0.5 w-0`}
        ></span>
      </li>
    </>
  );
}
