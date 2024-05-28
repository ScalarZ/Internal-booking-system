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
import { File, X, XCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function UploadPassport({
  passports,
  setPassports,
  pax,
  touristNames,
}: {
  passports: { image: ImageType; touristName: string }[];
  setPassports: (
    passports: { image: ImageType; touristName: string }[],
  ) => void;
  pax: number;
  touristNames: string[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const onChange = (
    imageList: ImageListType,
    addUpdateIndex?: Array<number>,
  ) => {
    // data for submit
    setPassports(
      imageList.map((image) =>
        image.touristName !== undefined
          ? (image as { image: ImageType; touristName: string })
          : { image, touristName: "" },
      ),
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button
        type="button"
        variant="secondary"
        onClick={() => setIsOpen(true)}
        className="mb-8 self-center"
        disabled={!pax}
      >
        Upload passport
      </Button>
      <DialogContent className="max-h-screen min-w-[1360px] gap-y-2">
        <DialogHeader>
          <DialogTitle className="mb-2">Upload Tourists Passports</DialogTitle>
          <ImageUploading
            multiple
            value={passports}
            onChange={onChange}
            maxNumber={pax}
            dataURLKey="data_url"
          >
            {({
              imageList,
              onImageUpload,
              onImageRemove,
              isDragging,
              dragProps,
            }) => (
              // write your building UI
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
                  {imageList.map(({ image, touristName }, index) => (
                    <div
                      key={index}
                      className="image-item relative flex flex-col gap-y-2"
                    >
                      <div className="flex-grow">
                        <img src={image["data_url"]} alt="" />
                      </div>

                      <XCircle
                        size={28}
                        className="absolute -right-2 -top-2 cursor-pointer text-white"
                        onClick={() => onImageRemove(index)}
                        fill="red"
                      />
                      <Select
                        onValueChange={(value) => {
                          passports[index].touristName = value;
                          setPassports([...passports]);
                        }}
                        defaultValue={touristName}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a currency" />
                        </SelectTrigger>
                        <SelectContent>
                          {touristNames.map((name) => (
                            <SelectItem key={name} value={name}>
                              {name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
              setPassports([]);
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
