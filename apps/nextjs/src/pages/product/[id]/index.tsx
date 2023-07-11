import { BadgeCheck, LinkIcon, XCircle, } from "lucide-react";
import { type GetServerSideProps } from "next";
import { getSession, useSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";

import { supabase } from "@acme/api/src/lib/supabase";
import { prisma } from "@acme/db";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/Atoms/Avatar";
import { Button } from "~/components/Atoms/Button";
import { Card } from "~/components/Molecules/Card";
import Carousel from "~/components/Molecules/Carousel";
import { type ProductWithDetails } from "~/components/Templates/Products";
import { env } from "~/env.mjs";
import { generalizeDate } from "~/lib/utils";
import { api } from "~/utils/api";

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

  if (!product) return { props: {} };

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

  return {
    props: {
      product: {
        ...product,
        createdAt: generalizeDate(product?.createdAt),
      },
      images,
      logo: `${env.NEXT_PUBLIC_SUPABASE_URL}/${env.NEXT_PUBLIC_PRODUCT_LOGO}/${product.id}/0.jpg`,
    },
  };
};

interface pageProps {
  product: ProductWithDetails;
  images: { url: string }[];
  logo: string;
}

export default function Product({ product, images, logo }: pageProps) {
  const { data: session } = useSession();

  const { mutate: verify, isLoading } = api.product.verify.useMutation({
    onError: (error) => toast.error(error.message),
    onSuccess: () => {
      toast.success("Product has been verified");
      product.verified = true;
    },
  });

  if (!product) return <div>Product not found</div>;

  return (
    <>
      <Head>
        <title>Product - {product.name}</title>
      </Head>
      <Card className="flex flex-col justify-center gap-4 p-4">
        <div className="flex justify-center gap-4">
          <div className="flex flex-col gap-4">
            <div className="flex h-fit items-center justify-center gap-8 rounded-2xl border p-12">
              <Avatar>
                <AvatarImage src={logo} alt="Logo Avatar" width={200} height={200} />
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
                <div className="max-w-[200px] overflow-hidden truncate text-ellipsis font-semibold">
                  Created {String(product.createdAt)}
                </div>
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
          <Card className="h-fit rounded-2xl p-4">
            <Carousel indicators navButtons autoScroll>
              {images.map((image, index) => (
                <div key={index} className="flex h-[400px] w-[400px] items-center justify-center">
                  <Image alt={image.url} width={400} height={400} src={image?.url} key={image?.url} priority />
                </div>
              ))}
            </Carousel>
          </Card>
        </div>
        <div className={`grid gap-4 ${session?.user.role === "Admin" && !product.verified ? "grid-cols-2" : "grid-cols-1"}`}>
          {session?.user.role === "Admin" && !product.verified && (
            <Button
              loading={isLoading}
              className="bg-bgc hover:bg-bgc active:bg-bgc flex items-center justify-center rounded-2xl border p-8 text-white "
              onClick={() => verify({ id: product.id })}>
              Verify Product
            </Button>
          )}
          <Link className="flex items-center justify-center rounded-2xl border p-4" href={`/product/${product.id}/tier`}>
            <div>See Tiers</div>
          </Link>
        </div>
      </Card>
    </>
  );
}
