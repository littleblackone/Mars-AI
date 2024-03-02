'use client'

import { ShieldAlert } from "lucide-react";
import { useSearchParams } from 'next/navigation'

export default function ErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  console.log(error);

  return <div className=" w-screen h-screen flex-center text-3xl text-red-500">
    <div className="flex gap-2 items-center">
      <ShieldAlert width={60} height={60} color="rgb(239 ,68, 68)"></ShieldAlert>
      <span>Sorry, something went wrong:<br></br>{error}</span>
    </div>
  </div>
}