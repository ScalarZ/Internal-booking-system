"use server";

import { createClient } from "./supabase/server";

const supabase = createClient();

export async function getUser() {
  "use server";
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return user;
}
