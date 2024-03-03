"use server";
import { createClient } from "@supabase/supabase-js";

export const getUsers = async () => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  );

  let data = await supabase.from("users").select("*");

  console.log(data);

  return data;
};
