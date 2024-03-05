'use client'
import { UserData } from '@/lib/interface/ImageData'
import { useCredits } from '@/lib/store/useCredits'
import { supabaseRealTime } from '@/lib/supabase/supabaseClient'
import { Sparkles } from 'lucide-react'
import React, { useEffect, useState } from 'react'

export default function UserCreditsClient({ userData, email, token }: { token: string, userData: UserData, email: string }) {

  // const supabase = supabaseRealTime()
  // supabase.realtime.setAuth(token)//不设置这个就不能实时数据更新
  const infinityai_user_credits = useCredits(state => state.infinityai_user_credits)
  // const [userDatas, setUserDatas] = useState<UserData>(userData)

  // useEffect(() => {
  //   const channel = supabase.channel('users-channel').on('postgres_changes',
  //     { event: 'UPDATE', schema: 'public', table: 'infinityai_352020833zsx_users', filter: `email=eq.${email}` },
  //     (payload) => {
  //       console.log(payload)
  //       setUserDatas(payload.new as UserData)
  //     }
  //   ).subscribe()

  //   return () => {
  //     supabase.removeChannel(channel)
  //   }
  // }, [supabase, userDatas, setUserDatas])

  return (
    <div className='flex items-center gap-2 bg-gray-100 p-2 rounded-lg'>
      <span>{infinityai_user_credits === 0 ? userData.infinityai_user_credits : infinityai_user_credits}</span>
      <Sparkles width={15} height={15}></Sparkles>
    </div>
  )
}
