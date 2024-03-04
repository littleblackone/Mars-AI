
import React from 'react'
import UserCreditsClient from './UserCreditsClient'
import { supabaseClient } from '@/lib/supabase/supabaseClient';

export default async function UserCreditsServer({ email }: { email: string }) {

  const supabase = supabaseClient()
  console.log(email);

  // const user = await currentUser()
  // const email = user?.emailAddresses[0].emailAddress


  const res = await supabase.from("users").select().eq("email", email);
  const realData = res.data && res.data[0]
  console.log(realData);

  return (
    <UserCreditsClient email={email!} userData={realData}></UserCreditsClient>
  )
}
