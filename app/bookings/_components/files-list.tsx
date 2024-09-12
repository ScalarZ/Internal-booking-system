import { XCircle } from "lucide-react";

export default function FilesList({
  uploadedFiles,
  removeFile,
}: {
  uploadedFiles: { id: string; file: File }[];
  removeFile: (id: string) => void;
}) {
  return (
    uploadedFiles.length > 0 && (
      <ul>
        {uploadedFiles.map((img) => (
          <li key={img.id} className="flex items-center gap-x-2 text-sm">
            <XCircle
              size={18}
              onClick={() => removeFile(img.id)}
              className="cursor-pointer text-gray-600 hover:text-red-500"
            />
            {img.file.name}
          </li>
        ))}
      </ul>
    )
  );
}
