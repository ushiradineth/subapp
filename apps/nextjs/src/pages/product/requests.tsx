import { type GetServerSideProps } from "next";
import { getSession } from "next-auth/react";

import { prisma, type Product } from "@acme/db";

import Products, { ProductWithDetails } from "~/components/Products";
import { formalizeDate } from "~/lib/utils";

const ITEMS_PER_PAGE = 10;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession({ ctx: context });

  if (!session || session.user.role === "Vendor") {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
      props: {},
    };
  }

  const search = context.query.search ? (context.query.search as string).split(" ").join(" | ") : "";

  const searchQuery = {
    OR: [
      { name: { search: search } },
      {
        category: { OR: [{ name: { search: search } }, { description: { search: search } }] },
      },
      { vendor: { name: { search: search } } },
    ],
  };

  const where = search !== "" ? { searchQuery, verified: false } : { verified: false };

  const products = await prisma.product.findMany({
    take: ITEMS_PER_PAGE,
    skip: context.query.page ? (Number(context.query.page) - 1) * ITEMS_PER_PAGE : 0,
    where,
    orderBy: {
      createdAt: "desc",
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

  const count = await prisma.product.count({ where });

  const total =
    session?.user.role === "Admin"
      ? await prisma.product.count()
      : await prisma.product.count({
          where: {
            vendorId: {
              equals: session?.user.id,
            },
          },
        });

  return {
    props: {
      products: products.map((product) => ({
        ...product,
        createdAt: formalizeDate(product.createdAt),
      })),
      count,
      total,
    },
  };
};

export default function Requests({ products, count, total }: { products: ProductWithDetails[]; count: number; total: number }) {
  return <Products products={products} count={count} total={total} itemsPerPage={ITEMS_PER_PAGE} />;
}
