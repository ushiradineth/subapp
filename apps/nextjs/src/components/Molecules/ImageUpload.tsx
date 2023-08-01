import axios from "axios";
import { X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import ImageUploading, { type ImageListType } from "react-images-uploading";
import { toast } from "react-toastify";

import { getPayload } from "~/lib/utils";
import { api } from "~/utils/api";
import Loader from "../Atoms/Loader";
import { Card } from "./Card";

type props = {
  multiple?: boolean;
  itemId: string;
  upload: boolean;
  bucket: string;
  setLoading: (value: boolean) => void;
  setValue: (value: string) => void;
  setUpload: (value: boolean) => void;
  onUpload?: (images: string[]) => void;
  onDelete?: (image: string) => void;
  previewImages?: string[];
};

const FILE_TYPE = "jpg";

export function ImageUpload({
  multiple,
  itemId,
  upload,
  bucket,
  setLoading,
  setValue,
  setUpload,
  onUpload: onUploadProp,
  onDelete: onDeleteProp,
  previewImages,
}: props) {
  const { mutateAsync: getUploadUrl } = api.s3.createUploadUrl.useMutation();
  const { mutate: deleteObject } = api.s3.deleteObject.useMutation({
    onError: (error) => toast.error(error.message),
    onMutate: () => setLoading(true),
    onSettled: () => setLoading(false),
  });

  const [images, setImages] = useState<ImageListType>([]);
  const [isLoading, setIsLoading] = useState(false);
  const maxNumber = 10;

  const onChange = (imageList: ImageListType) => {
    setUpload(false);
    setImages(imageList as never[]);
    if (imageList[0]?.file) setValue("Image set");
    else setValue("");
  };

  const onUpload = useCallback(() => {
    if (images.length === 0) return;
    setIsLoading(true);

    const uploadedImages: string[] = [...(previewImages ?? [])];
    images.forEach(async (image, index) => {
      const fileName = multiple ? `${itemId}/${itemId}-${new Date().getTime()}-${index}` : `${itemId}`;

      if (image.file && !uploadedImages?.includes(`${image.file.name}`)) {
        const UploadPayload = await getUploadUrl({
          bucket,
          fileName: `${fileName}.${FILE_TYPE}`,
          sizeLimit: 25 * 1024 * 1024, // default limit of 25 MB
        });
        try {
          await axios.post(UploadPayload.url, getPayload(image.file, UploadPayload.fields));
          uploadedImages.push(fileName);
        } catch (error) {
          const err = error as any;
          String(err?.response?.data).includes("EntityTooLarge")
            ? toast.error("Profile image exceeds the maximum upload size")
            : toast.error("Error uploading image");
        }
      }

      if (images.length - 1 === index) {
        onUploadProp?.(uploadedImages);
        setIsLoading(false);
        setUpload(false);
      }
    });
  }, [images, multiple, itemId, previewImages, getUploadUrl, bucket, onUploadProp, setUpload]);

  const getImage = useCallback(() => {
    if (itemId) {
      setIsLoading(true);

      previewImages?.forEach(async (image) => {
        const url = `https://${bucket}.s3.ap-southeast-1.amazonaws.com/${image}.${FILE_TYPE}?${new Date().getTime()}`;
        const file = await convertURLtoFileFormat(url);
        try {
          const result = await fetch(url, { method: "HEAD" });
          if (result) {
            if (result.status === 200) {
              setImages((prev) => {
                setValue("Image set");
                if (prev.find((item) => item.dataURL?.split("?")[0] === url.split("?")[0])) return prev;
                return [...prev, { dataURL: url, file }];
              });
            }
          }
        } catch (error) { }
      });

      setIsLoading(false);
    }
  }, [itemId, previewImages, bucket, setValue]);

  const deleteImage = useCallback(
    ({ index, onDelete }: { index: number; onDelete: (index: number) => void }) => {
      if (previewImages?.includes(`${images[index]?.file?.name}`)) {
        if (multiple) {
          deleteObject({ bucket, fileName: `${images[index]?.file?.name}.${FILE_TYPE}` });
        } else {
          deleteObject({ bucket, fileName: `${itemId}.${FILE_TYPE}` });
        }
        onDeleteProp?.(`${images[index]?.file?.name}`);
      }
      onDelete(index);
      if (images.length === 0) setValue("");
    },
    [bucket, deleteObject, images, itemId, multiple, onDeleteProp, previewImages, setValue],
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

  useEffect(() => {
    onChange(images);
  }, [itemId]);

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
                      onClick={() => {
                        deleteImage({ index, onDelete: onImageRemove });
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
  try {
    const response = await fetch(url);
    const data = await response.blob();
    return new File([data], `${url.split(".s3.ap-southeast-1.amazonaws.com/")[1]?.split(".jpg")[0]}`, {
      type: data.type || "image/jpeg",
    });
  } catch (error) { }
};
