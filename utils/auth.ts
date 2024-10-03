"use server";

import { createClient } from "./supabase/server";

export async function getUser() {
  "use server";
  const supabase = createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return user;
}
