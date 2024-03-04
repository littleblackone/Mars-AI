"use server";
import { supabaseClient } from "../supabase/supabaseClient";
import { convertTimestampToDateTime } from "../utils";

export interface UserData {
  created_at: number;
  email: string;
  subscription_type: string;
  subscription_expiry?: number;
  subscription_startAt?: number;
  credits: number;
  user_id: string;
}

interface UpdateUserData {
  subscription_type: string;
  subscription_expiry?: number;
  subscription_startAt?: number;
  credits: number;
}

// export const getUser = async (email: string) => {
//   const supabase = supabaseClient();
//   const res = await supabase.from("users").select("*").eq("email", email);
//   return res;
// };

export const createUser = async (user: UserData) => {
  const supabase = supabaseClient();

  const createTime = convertTimestampToDateTime(user.created_at);

  const res = await supabase.from("users").insert([
    {
      created_at: createTime,
      email: user.email,
      subscription_type: "free",
      credits: 20,
      user_id: user.user_id,
    },
  ]);

  return res;
};

export const updateUser = async (userEmail: string, user: UpdateUserData) => {
  const supabase = supabaseClient();
  const subscriptionType = user.subscription_type;

  const subscriptionStartAt = convertTimestampToDateTime(
    user.subscription_startAt!
  );
  const subscriptionExpiry = convertTimestampToDateTime(
    user.subscription_expiry!
  );
  const newCredits = user.credits;
  const res = await supabase
    .from("users")
    .update({
      subscription_type: subscriptionType,
      subscription_startAt: subscriptionStartAt,
      subscription_expiry: subscriptionExpiry,
      credits: newCredits,
    })
    .eq("email", userEmail)
    .select();

  return res;
};

export const updateUserCredits = async (userEmail: string, credits: number) => {
  const supabase = supabaseClient();

  const res = await supabase
    .from("users")
    .update({
      credits: credits,
    })
    .eq("email", userEmail)
    .select();

  return res;
};
