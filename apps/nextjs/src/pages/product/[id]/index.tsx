import { useState } from "react";
import { type GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, ChevronLeft, ChevronRight, Circle, LinkIcon, XCircle } from "lucide-react";
import moment from "moment";
import { getSession, useSession } from "next-auth/react";
import { toast } from "react-toastify";

import { supabase } from "@acme/api/src/lib/supabase";
import { prisma } from "@acme/db";

import { api } from "~/utils/api";
import { type ProductWithDetails } from "~/components/Products";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { env } from "~/env.mjs";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession({ ctx: context });

  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
      props: {},
    };
  }

  const product = await prisma.product.findUnique({
    where: {
      id: context.params?.id as string,
    },
    include: {
      vendor: {
        select: {
          name: true,
          id: true,
        },
      },
      category: {
        select: {
          name: true,
          id: true,
        },
      },
    },
  });

  if (session.user.id !== product?.vendorId && session.user.role !== "Admin") {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
      props: {},
    };
  }

  const { data: imageList } = await supabase.storage.from(env.NEXT_PUBLIC_PRODUCT_IMAGE).list(product?.id);

  const images: { url: string }[] = [];

  imageList?.forEach((image) => {
    const { data: url } = supabase.storage.from(env.NEXT_PUBLIC_PRODUCT_IMAGE).getPublicUrl(`${product?.id}/${image.name}`);
    images.push({ url: url?.publicUrl ?? "" });
  });

  const { data: logoFolder } = await supabase.storage.from(env.NEXT_PUBLIC_PRODUCT_IMAGE).list(product?.id, { limit: 1 });

  let logo = "";

  if (logoFolder) {
    const { data } = supabase.storage.from(env.NEXT_PUBLIC_PRODUCT_LOGO).getPublicUrl(`${product?.id}/${logoFolder[0]?.name}`);
    logo = data.publicUrl;
  }

  return {
    props: {
      product: {
        ...product,
        createdAt: moment(product?.createdAt).fromNow(),
      },
      images,
      logo,
    },
  };
};

const ImageView = ({ images }: { images: { url: string }[] }) => {
  const [index, setIndex] = useState(0);

  console.log(images);

  return (
    <div className={"grid h-full w-[400px] transform select-none place-items-center rounded-2xl border p-8 text-gray-300"}>
      <div className="flex h-[300px] w-full items-center justify-center transition-all duration-300">
        <ChevronLeft onClick={() => index > 0 && setIndex(index - 1)} className={"fixed left-4 top-[50%] h-4 w-4 scale-150 rounded-full bg-zinc-600 object-contain " + (index > 0 ? " cursor-pointer hover:bg-white hover:text-zinc-600 " : " opacity-0 ")} />
        <Image src={images[index]?.url || ""} key="image" className="h-full w-full object-contain" height={1000} width={1000} alt={"images"} />
        <ChevronRight onClick={() => index < (images.length || 0) - 1 && setIndex(index + 1)} className={"fixed right-4 top-[50%] h-4 w-4 scale-150 rounded-full bg-zinc-600 object-contain " + (index < (images.length || 0) - 1 ? " cursor-pointer hover:bg-white hover:text-zinc-600 " : " opacity-0 ")} />
        <Bullets count={images.length} index={index} setIndex={setIndex} />
      </div>
    </div>
  );
};

const Bullets = ({ count, index, setIndex }: { count: number; index: number; setIndex: (index: number) => void }) => {
  return (
    <div className="fixed bottom-1 flex">
      {[...Array(count || 0)].map((e, i) => (
        <button key={i} onClick={() => setIndex(i)}>
          <Circle fill={i === index ? "white" : "black"} className={"w-4"} />
        </button>
      ))}
    </div>
  );
};

export default function Requests({ product, images, logo }: { product: ProductWithDetails; images: { url: string }[]; logo: string }) {
  const { data: session } = useSession();

  const { mutate: verify, isLoading } = api.product.verify.useMutation({
    onError: (error) => toast.error(error.message),
    onSuccess: () => {
      toast.success("Product has been verified");
      product.verified = true;
    },
  });

  return (
    <>
      <Head>
        <title>Product - {product.name}</title>
      </Head>
      <main className="flex flex-col items-center justify-center">
        <div className="mb-12 flex items-center gap-8">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="flex h-fit items-center justify-center gap-8 rounded-2xl border p-8 ">
              <Avatar>
                <AvatarImage src={logo} alt="Product Avatar" width={200} height={200} />
                <AvatarFallback>
                  <XCircle width={200} height={200} />
                </AvatarFallback>
              </Avatar>
              <div className="grid grid-flow-row md:h-fit md:gap-3">
                <div className="max-w-[200px] overflow-hidden truncate text-ellipsis text-xl font-semibold">{product.name}</div>
                <div className="flex items-center gap-2">
                  <div className="verflow-hidden max-w-[200px] truncate text-ellipsis text-sm">
                    by {product.vendor.name} | {product.category.name}
                  </div>
                  {product.verified && <BadgeCheck className="text-green-500" />}
                </div>
                <div className="max-w-[200px] overflow-hidden truncate text-ellipsis font-semibold">Created {String(product.createdAt)}</div>
                <Link className="flex items-center gap-2 text-sm font-light text-gray-400" href={product.link || ""}>
                  <LinkIcon className="h-4 w-4" /> Visit the product website
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border p-8">
              <div className="text-lg font-semibold">About {product.name}</div>
              <div className={"mr-2 grid max-w-[800px] grid-flow-col break-all"}>{product.description}</div>
            </div>
          </div>
          <ImageView images={images} />
        </div>
        {session?.user.role === "Admin" && !product.verified && (
          <div className="flex items-center justify-center rounded-2xl border p-8">
            <Button loading={isLoading} className="flex items-center gap-1" onClick={() => verify({ id: product.id })}>
              Verify
            </Button>
          </div>
        )}
      </main>
    </>
  );
}
