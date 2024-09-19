import { headers } from "next/headers";

export function getServerQueries() {
  const headersList = headers();
  const fullUrl = headersList.get("referer") || "";
  const queries = new URLSearchParams(new URL(fullUrl).searchParams);
  return Object.fromEntries(queries.entries());
}
