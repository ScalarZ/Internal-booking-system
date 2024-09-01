import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ImageUploading, {
  ImageListType,
  ImageType,
} from "react-images-uploading";
import { File, XCircle } from "lucide-react";

export default function UploadImage({
  images,
  setImages,
  title,
  button,
  maxNumber,
}: {
  images: { image?: ImageType; name?: string; url?: string }[];
  setImages: (
    images: { image?: ImageType; name?: string; url?: string }[],
  ) => void;
  title: string;
  button: React.ReactElement;
  maxNumber?: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const onChange = (imageList: ImageListType) => {
    setImages(
      imageList.map((image) =>
        image.name !== undefined
          ? (image as { image: ImageType; name: string; url: string })
          : {
              image,
              name: image.file?.name ?? "",
              url: image.file ? URL.createObjectURL(image.file) : "",
            },
      ),
    );
  };

  const TriggerButton = React.cloneElement(button, {
    onClick: () => setIsOpen(true),
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {TriggerButton}
      <DialogContent className="max-h-screen min-w-[1360px] gap-y-2">
        <DialogHeader>
          <DialogTitle className="mb-2">{title}</DialogTitle>
          <ImageUploading
            multiple
            value={images}
            onChange={onChange}
            dataURLKey="data_url"
            allowNonImageType
            onError={(e) => console.log(e)}
          >
            {({
              imageList,
              onImageUpload,
              onImageRemove,
              isDragging,
              dragProps,
            }) => (
              <div className="upload__image-wrapper">
                <div
                  style={isDragging ? { color: "red" } : undefined}
                  onClick={onImageUpload}
                  {...dragProps}
                  className="mb-4 flex h-24 w-full items-center justify-center gap-x-2 rounded border-2 border-dashed border-sky-900 border-opacity-30"
                >
                  <File />
                  <p className="font-medium">Click or Drop here</p>
                </div>
                <div className="grid max-h-[76vh] grid-cols-4 gap-4 overflow-y-auto p-2">
                  {imageList.map(({ image, name, url }, index) => (
                    <div
                      key={index}
                      className="image-item relative flex flex-col items-center justify-center gap-y-2"
                    >
                      <a
                        href={url}
                        target="_blank"
                        className="flex flex-grow flex-col items-center"
                      >
                        <File size={128} strokeWidth={1} />
                        <p className="text-center">{name}</p>
                      </a>

                      <XCircle
                        size={28}
                        className="absolute -right-2 -top-2 cursor-pointer text-white"
                        onClick={() => onImageRemove(index)}
                        fill="red"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </ImageUploading>
        </DialogHeader>
        <DialogFooter className="flex w-full justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsOpen(false);
              setImages([]);
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => {
              setIsOpen(false);
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
