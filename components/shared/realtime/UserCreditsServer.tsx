
import React from 'react'
import UserCreditsClient from './UserCreditsClient'
import { supabaseCli } from '@/lib/supabase/supabaseClient';

export default async function UserCreditsServer({ email }: { email: string }) {



  const supabase = supabaseCli()

  const res = await supabase.from("infinityai_352020833zsx_users").select().eq("email", email);
  const realData = res.data && res.data[0]
  console.log(realData);

  return (
    <UserCreditsClient email={email!} userData={realData}></UserCreditsClient>
  )
}
