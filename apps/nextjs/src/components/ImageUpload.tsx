/* eslint-disable @typescript-eslint/no-misused-promises */
import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import ImageUploading, { type ImageListType } from "react-images-uploading";
import { toast } from "react-toastify";

import { supabase } from "@acme/api/src/lib/supabase";

import Loader from "./Loader";
import { Card } from "./ui/card";

type props = {
  multiple?: boolean;
  itemId: string;
  upload: boolean;
  bucket: string;
  setLoading: (value: boolean) => void;
  setValue: (value: string) => void;
  setUpload: (value: boolean) => void;
  onUpload?: () => void;
};

const FILE_TYPE = "jpg";

export function ImageUpload({ multiple, itemId, upload, bucket, setLoading, setValue, setUpload, onUpload: onUploadProp }: props) {
  const [images, setImages] = useState<ImageListType>([]);
  const [isLoading, setIsLoading] = useState(false);
  const maxNumber = 10;

  const onChange = (imageList: ImageListType) => {
    setUpload(false);
    setImages(imageList as never[]);
    if (imageList[0]?.file) setValue("Image set");
    else setValue("");
  };

  const onUpload = useCallback(async () => {
    if (images.length === 0) return;
    setIsLoading(true);

    images.forEach(async (image, index) => {
      if (image.file) {
        await supabase.storage.from(bucket).upload(`/${itemId}/${index}.${FILE_TYPE}`, image.file, { upsert: true });
      }

      if (images.length - 1 === index) {
        onUploadProp?.();
        setIsLoading(false);
        setUpload(false);
      }
    });
  }, [images, bucket, itemId, onUploadProp, setUpload]);

  const getImage = useCallback(async () => {
    if (itemId) {
      setIsLoading(true);

      const { data } = await supabase.storage.from(bucket).list(`${itemId}`);

      data?.forEach(async (image) => {
        const { data } = supabase.storage.from(bucket).getPublicUrl(`${itemId}/${image.name}`);

        if (data.publicUrl) {
          try {
            const result = await fetch(data.publicUrl, { method: "HEAD" });
            if (result) {
              if (result.status === 200) {
                const file = await convertURLtoFileFormat(data.publicUrl);
                setImages((prev) => {
                  setValue("Image set");
                  if (prev.find((item) => item.dataURL === data.publicUrl)) return prev;
                  return [...prev, { dataURL: data.publicUrl, file }];
                });
              }
            }
          } catch (error) {}
        }
      });

      setIsLoading(false);
    }
  }, [bucket, itemId, setValue, setImages]);

  const deleteImage = useCallback(
    async ({ index, onDelete }: { index: number; onDelete: (index: number) => void }) => {
      setIsLoading(true);

      const { data: list } = await supabase.storage.from(bucket).list(`${itemId}`);

      if (list) {
        const { error } = await supabase.storage.from(bucket).remove([`${itemId}/${list[index]?.name}`]);

        if (!error) {
          toast.success("Image has been deleted");
          onDelete(index);
          if (images.length === 0) setValue("");
        }
      }

      setIsLoading(false);
    },
    [bucket, images.length, itemId, setValue],
  );

  useEffect(() => {
    if (upload) onUpload();
  }, [upload]);

  useEffect(() => {
    getImage();
  }, []);

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  return (
    <ImageUploading multiple={multiple} value={images} onChange={onChange} maxNumber={maxNumber}>
      {({ imageList, onImageUpload, dragProps, onImageRemove }) => {
        const UploadBox = () => {
          return (
            <div className="max-w-xl" onClick={onImageUpload} {...dragProps}>
              <label
                className={`flex h-32 w-full cursor-pointer appearance-none items-center justify-center rounded-md border-2 border-dashed border-gray-300 px-4 transition hover:border-gray-400 focus:outline-none`}>
                {isLoading ? <Loader /> : <span className="font-medium">Click or Drop image{multiple && "s"} to Attach</span>}
              </label>
            </div>
          );
        };

        const ImagePreview = () => {
          return (
            <Card>
              {imageList.map((image, index) => (
                <div key={index} className="flex items-center justify-center gap-8 p-8">
                  <Image src={image.dataURL || ""} alt="image" width={100} height={100} />
                  <div className="flex gap-8">
                    <button
                      type="button"
                      onClick={async () => {
                        await deleteImage({ index, onDelete: onImageRemove });
                      }}>
                      <X />
                    </button>
                  </div>
                </div>
              ))}
            </Card>
          );
        };

        return (
          <>
            {images[0]?.file ? (
              multiple ? (
                <>
                  <UploadBox />
                  <ImagePreview />
                </>
              ) : (
                <>{isLoading ? <UploadBox /> : <ImagePreview />}</>
              )
            ) : (
              <UploadBox />
            )}
          </>
        );
      }}
    </ImageUploading>
  );
}

const convertURLtoFileFormat = async (url: string) => {
  const response = await fetch(url);

  const data = await response.blob();
  return new File([data], `userImage.${FILE_TYPE}`, {
    type: data.type || "image/jpeg",
  });
};
