import { DeleteObjectCommand, DeleteObjectsCommand, ListObjectsCommand, S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { z } from "zod";

import { env } from "../../env.mjs";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY_ID,
  },
});

export const s3Router = createTRPCRouter({
  createUploadUrl: protectedProcedure
    .input(z.object({ bucket: z.string(), fileName: z.string(), sizeLimit: z.number() }))
    .mutation(async ({ input }) => {
      const { url, fields } = await createPresignedPost(s3Client, {
        Bucket: input.bucket,
        Key: input.fileName,
        Expires: 3600,
        Conditions: [
          ["content-length-range", 1, input.sizeLimit ?? 25 * 1024 * 1024], // default limit of 25 MB
        ],
      });

      return { url, fields };
    }),

  deleteObject: protectedProcedure.input(z.object({ bucket: z.string(), fileName: z.string() })).mutation(async ({ input }) => {
    return await s3Client.send(new DeleteObjectCommand({ Bucket: input.bucket, Key: input.fileName }));
  }),

  deleteFolder: protectedProcedure.input(z.object({ bucket: z.string(), folderName: z.string() })).mutation(async ({ input }) => {
    const Objects = await s3Client.send(
      new ListObjectsCommand({
        Bucket: input.bucket,
        Prefix: input.folderName,
      }),
    );

    if (Objects.Contents?.length === 0) return;

    const DeleteObject: { Key: string | undefined }[] = [];

    Objects.Contents?.forEach(({ Key }) => {
      DeleteObject.push({ Key });
    });

    await s3Client.send(new DeleteObjectsCommand({ Bucket: input.bucket, Delete: { Objects: DeleteObject } }));
  }),
});
