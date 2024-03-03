"use server";

import { supabaseClient } from "../supabase/supabaseClient";

export const getUsers = async (supabaseAccessToken: string) => {
  const supabase = await supabaseClient(supabaseAccessToken!);

  let data = await supabase.from("users").select("*");

  return data;
};
