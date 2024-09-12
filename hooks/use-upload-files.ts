import { generateRandomId } from "@/utils/generate-random-id";
import { useState } from "react";

export default function useUploadFiles() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      const newFile: UploadedFile[] = Array.from(files).map((file) => ({
        id: generateRandomId(),
        file,
      }));
      setUploadedFiles((prevFiles) => [...prevFiles, ...newFile]);
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles((prevFiles) => prevFiles.filter((img) => img.id !== id));
  };

  return { uploadedFiles, setUploadedFiles, handleFileUpload, removeFile };
}
