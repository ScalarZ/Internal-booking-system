import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

function useURLQuery() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const params = useMemo(
    () => new URLSearchParams(searchParams),
    [searchParams],
  );

  const addQuery = useCallback(
    (name: string, value: string) => {
      params.set(name, value);
      router.push(`?${params.toString()}`);
    },
    [params, router],
  );

  const removeQuery = useCallback(
    (name: string) => {
      params.delete(name);
      router.push(`?${params.toString()}`);
    },
    [params, router],
  );

  const restQuery = useCallback(
    () => router.replace(pathname),
    [pathname, router],
  );

  return { addQuery, removeQuery, params, restQuery };
}

export default useURLQuery;
