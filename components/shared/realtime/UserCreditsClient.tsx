'use client'
import { UserData } from '@/lib/actions/user.actions'
import { supabaseClient } from '@/lib/supabase/supabaseClient'
import { Sparkles } from 'lucide-react'
import React, { useEffect, useState } from 'react'

export default function UserCreditsClient({ userData, email }: { userData: UserData, email: string }) {

  const supabase = supabaseClient()
  console.log('email', email);
  const [userDatas, setUserDatas] = useState<UserData>(userData)

  useEffect(() => {
    const channel = supabase.channel('users-channel').on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'users', filter: `email=eq.${email}` },
      (payload) => {
        console.log(payload)
        setUserDatas(payload.new as UserData)
      }
    ).subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return (
    <div className='flex items-center gap-2 bg-gray-100 p-2 rounded-lg'>
      <span>{userDatas.credits}</span>
      <Sparkles width={15} height={15}></Sparkles>
    </div>
  )
}
