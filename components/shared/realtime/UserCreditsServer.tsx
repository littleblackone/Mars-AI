
import React from 'react'
import UserCreditsClient from './UserCreditsClient'
import { supabaseClient } from '@/lib/supabase/supabaseClient';
import { auth } from '@clerk/nextjs';

export default async function UserCreditsServer({ email }: { email: string }) {

  const { getToken } = auth()
  const token = await getToken({ template: "supabase" });

  const supabase = await supabaseClient(token!)

  const res = await supabase.from("infinityai_352020833zsx_users").select().eq("email", email);
  const realData = res.data && res.data[0]

  return (
    <UserCreditsClient email={email!} token={token!} userData={realData}></UserCreditsClient>
  )
}
