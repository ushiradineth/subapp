/* eslint-disable @typescript-eslint/no-misused-promises */
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import ImageUploading, { type ImageListType } from "react-images-uploading";
import { toast } from "react-toastify";

import { supabase } from "@acme/api/src/lib/supabase";

import Loader from "./Loader";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

type props = {
  multiple?: boolean;
  itemId: string;
  loading: (value: boolean) => void;
  upload: boolean;
  bucket: string;
  setValue: (value: string) => void;
  setUpload: (value: boolean) => void;
  onUpload?: () => void;
  delete?: boolean;
};

const FILE_TYPE = "jpg";

export function ImageUpload(props: props) {
  const [images, setImages] = useState<ImageListType>([]);
  const [isLoading, setIsLoading] = useState(false);
  const maxNumber = 10;
  const [deleteMenu, setDeleteMenu] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(0);

  const onChange = (imageList: ImageListType) => {
    props.setUpload(false);
    setImages(imageList as never[]);
    if (imageList[0]?.file) props.setValue("Image set");
    else props.setValue("");
  };

  const onUpload = () => {
    if (images.length === 0) return;

    images.forEach(async (image, index) => {
      if (image.file) {
        const { error } = await supabase.storage.from(props.bucket).upload(`/${props.itemId}/${index}.${FILE_TYPE}`, image.file);

        if (error) {
          await supabase.storage.from(props.bucket).update(`/${props.itemId}/${index}.${FILE_TYPE}`, image.file);
        }
      }
    });

    props.onUpload?.();
    props.setUpload(false);
  };

  const getImage = async () => {
    if (props.itemId) {
      setIsLoading(true);
      
      const { data } = await supabase.storage.from(props.bucket).list(`${props.itemId}`);

      data?.forEach(async (image) => {
        const { data } = supabase.storage.from(props.bucket).getPublicUrl(`${props.itemId}/${image.name}`);

        if (data.publicUrl) {
          try {
            const result = await fetch(data.publicUrl, { method: "HEAD" });
            if (result) {
              if (result.status === 200) {
                const file = await convertURLtoFileFormat(data.publicUrl);
                setImages((prev) => {
                  props.setValue("Image set");
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
  };

  const deleteImage = async ({ index, onDelete }: { index: number; onDelete: (index: number) => any }) => {
    setIsLoading(true);

    const { data: list } = await supabase.storage.from(props.bucket).list(`${props.itemId}`);

    if (list) {
      const { error } = await supabase.storage.from(props.bucket).remove([`${props.itemId}/${list[index]?.name}`]);
      if (!error) {
        toast.success("Image has been delete");
        onDelete(index);
        setImages((prev) => prev.filter((_, i) => i !== index));
        setDeleteMenu(false);
      }
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (props.upload) onUpload();
  }, [props.upload, props.itemId]);

  useEffect(() => {
    getImage();
  }, [props.itemId]);

  return (
    <ImageUploading multiple={props.multiple} value={images} onChange={onChange} maxNumber={maxNumber}>
      {({ imageList, onImageUpload, onImageRemove, dragProps }) => (
        <>
          {deleteMenu && (
            <AlertDialog defaultOpen>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>This action cannot be undone. This will permanently delete the image.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setDeleteMenu(false)}>Cancel</AlertDialogCancel>
                  <Button onClick={() => deleteImage({ index: deleteIndex, onDelete: onImageRemove })}>{isLoading ? <Loader /> : <button>Delete</button>}</Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {images[0]?.file && props.multiple && (
            <>
              <div className="max-w-xl" onClick={onImageUpload} {...dragProps}>
                <label className={`flex h-32 w-full cursor-pointer appearance-none justify-center rounded-md border-2 border-dashed border-gray-300 px-4 transition hover:border-gray-400 focus:outline-none`}>{isLoading ? <Loader /> : <span className="font-medium">Click or Drop image{props.multiple && "s"} to Attach</span>}</label>
              </div>
              <Card>
                {imageList.map((image, index) => (
                  <div key={index} className="flex items-center justify-center gap-8 p-8">
                    <Image src={image.dataURL || ""} alt="image" width={100} height={100} />
                    <div className="flex gap-8">
                      <X
                        onClick={() => {
                          setDeleteIndex(index);
                          setDeleteMenu(true);
                          props.setValue("");
                        }}
                      />
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
                    <Image src={image.dataURL || ""} alt="image" width={100} height={100} />
                    <div className="flex gap-8">
                      <X
                        onClick={() => {
                          setDeleteIndex(index);
                          setDeleteMenu(true);
                          props.setValue("");
                        }}
                      />
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
                  <span className="flex items-center space-x-2">{isLoading ? <Loader /> : <span className="font-medium">Click or Drop image{props.multiple && "s"} to Attach</span>}</span>
                </label>
              </div>
            </>
          )}
        </>
      )}
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
