"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const logindata = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  // console.log(logindata);

  const { error, data } = await supabase.auth.signInWithPassword(logindata);

  console.log(data, error);
  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/create");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const signUpdata = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };
  console.log(signUpdata);

  const { error, data } = await supabase.auth.signUp(signUpdata);
  console.log(data);
  console.log(error?.cause, error?.message);

  if (error) {
    redirect(`/error?error=${error.message}`);
  }

  revalidatePath("/", "layout");
  redirect("/create");
}
