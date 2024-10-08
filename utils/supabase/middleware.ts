import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "./server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createClient();

  // refreshing the auth token
  await supabase.auth.getUser();

  return response;
}
