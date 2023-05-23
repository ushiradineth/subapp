/* eslint-disable @typescript-eslint/no-misused-promises */
import React, { useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import ImageUploading, { type ImageListType } from "react-images-uploading";

import { supabase } from "@acme/api/src/lib/supabase"
import { Card } from "./ui/card";

type props = {
  multiple?: boolean;
  itemId: string;
  loading: (value: boolean) => void;
  upload: boolean;
  bucket: string;
  setValue: (value: string) => void;
  setUpload: (value: boolean) => void;
};

export function ImageUpload(props: props) {
  const [images, setImages] = React.useState<ImageListType>([]);
  const maxNumber = 10;

  const onChange = (imageList: ImageListType) => {
    props.setUpload(false);
    setImages(imageList as never[]);
    if (imageList[0]?.file) props.setValue("Image set");
    else props.setValue("");
  };

  useEffect(() => {
    if (props.upload) onUpload();
  }, [props.upload, props.itemId]);

  const onUpload = () => {
    if (images.length === 0) return;

    images.forEach(async (image, index) => {
      if (image.file) {
        const { data, error } = await supabase.storage.from(props.bucket).upload(`/${props.itemId}/${index}.${image.file.name.split(".").pop()}`, image.file);
        console.log(data, error);
        if (error) {
          const { data, error } = await supabase.storage.from(props.bucket).update(`/${props.itemId}/${index}.${image.file.name.split(".").pop()}`, image.file);
          console.log(data, error);
        }
      }
    });

    props.setUpload(false);
  };

  return (
    <ImageUploading multiple={props.multiple} value={images} onChange={onChange} maxNumber={maxNumber}>
      {({ imageList, onImageUpload, onImageRemove, dragProps }) => (
        <>
          {images[0]?.file && props.multiple && (
            <>
              <div className="max-w-xl" onClick={onImageUpload} {...dragProps}>
                <label className={`flex h-32 w-full cursor-pointer appearance-none justify-center rounded-md border-2 border-dashed border-gray-300 px-4 transition hover:border-gray-400 focus:outline-none`}>
                  <span className="flex items-center space-x-2">
                    <span className="font-medium">Click or Drop image{props.multiple && "s"} to Attach</span>
                  </span>
                </label>
              </div>
              <Card>
                {imageList.map((image, index) => (
                  <div key={index} className="flex items-center justify-center gap-8 p-8">
                    <Image src={image.dataURL || ""} alt="Product Logo" width={100} height={100} />
                    <div className="flex gap-8">
                      <X onClick={() => onImageRemove(index)} />
                    </div>
                  </div>
                ))}
              </Card>
            </>
          )}

          {images[0]?.file && !props.multiple && (
            <>
              <Card>
                {imageList.map((image, index) => (
                  <div key={index} className="flex items-center justify-center gap-8 p-8">
                    <Image src={image.dataURL || ""} alt="Product Logo" width={100} height={100} />
                    <div className="flex gap-8">
                      <X onClick={() => onImageRemove(index)} />
                    </div>
                  </div>
                ))}
              </Card>
            </>
          )}

          {!images[0]?.file && (
            <>
              <div className="max-w-xl" onClick={onImageUpload} {...dragProps}>
                <label className={`flex h-32 w-full cursor-pointer appearance-none justify-center rounded-md border-2 border-dashed border-gray-300 px-4 transition hover:border-gray-400 focus:outline-none`}>
                  <span className="flex items-center space-x-2">
                    <span className="font-medium">Click or Drop image{props.multiple && "s"} to Attach</span>
                  </span>
                </label>
              </div>
            </>
          )}
        </>
      )}
    </ImageUploading>
  );
}
