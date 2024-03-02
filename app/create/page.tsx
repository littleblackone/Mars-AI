"use client";

import { ImageForm } from "@/components/shared/ImageForm";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Create() {
  const router = useRouter();
  const [isGetSession, setIsGetSession] = useState(false)

  useEffect(() => {
    async function checkSession() {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession()

      if (!data.session) {
        router.push('/login');
      }
      setIsGetSession(true)
    }
    checkSession();
  }, []);


  return (!isGetSession ?
    <div className=" w-screen h-screen flex-center">
      <div className="flex gap-2 items-center">
        <img src="/logo.png" alt="logo" className=" animate-spin" width={80} height={80} />
        <span className=" text-2xl font-bold">Infinity AI</span>
      </div>
    </div> :
    <div className=" relative flex form-shadow  items-start  w-full max-h-screen overflow-hidden bg-white ">
      <ImageForm></ImageForm>
    </div>)

}
