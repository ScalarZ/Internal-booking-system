import { createClient } from "@/utils/supabase/client";
import { useCallback } from "react";

export function useSupabaseStorage(bucket: string) {
  const uploadFile = useCallback(
    async (file: File) => {
      const supabase = createClient();
      const date = Date.now();
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(`${date}-${file.name}`, file);
      if (error) {
        throw error;
      }
      return data;
    },
    [bucket],
  );

  const uploadFiles = useCallback(
    async (files: File[]) => {
      const res = await Promise.allSettled(
        files.map((file) => uploadFile(file)),
      );
      const paths = res
        .map((res, i) =>
          res.status === "fulfilled"
            ? {
                url: `https://sgddpuwyvwbqkygpjbgg.supabase.co/storage/v1/object/public/${bucket}/${res.value?.path}`,
                name: `${files[i].name}`,
              }
            : null,
        )
        .filter(Boolean) as { url: string; name: string }[];
      return paths;
    },
    [uploadFile],
  );

  const deleteFile = useCallback(
    async (path: string) => {
      const supabase = createClient();
      const { data, error } = await supabase.storage
        .from(bucket)
        .remove([path]);
      if (error) {
        throw error;
      }
      return data;
    },
    [bucket],
  );
  return {
    uploadFile,
    uploadFiles,
    deleteFile,
  };
}
