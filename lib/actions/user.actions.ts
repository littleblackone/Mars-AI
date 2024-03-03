"use server";
import { supabaseClient } from "../supabase/supabaseClient";
import { convertTimestampToDateTime } from "../utils";

interface userData {
  created_at: number;
  email: string;
  subscription_type: string;
  subscription_expiry?: number;
  subscription_startAt?: number;
  credits: number;
  user_id: string;
}
export const createUser = async (
  supabaseAccessToken: string,
  user: userData
) => {
  const supabase = await supabaseClient(supabaseAccessToken!);

  const createTime = convertTimestampToDateTime(user.created_at);

  const res = await supabase.from("users").insert([
    {
      created_at: createTime,
      email: user.email,
      subscription_type: "free",
      credits: 0,
      user_id: user.user_id,
    },
  ]);

  console.log(res);

  return res;
};
