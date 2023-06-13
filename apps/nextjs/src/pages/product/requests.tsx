import { type GetServerSideProps } from "next";
import { getSession } from "next-auth/react";

import { prisma } from "@acme/db";

import Products, { type ProductWithDetails } from "~/components/Products";
import { formalizeDate } from "~/lib/utils";

const ITEMS_PER_PAGE = 10;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession({ ctx: context });

  if (!session || session.user.role !== "Admin") {
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
      { vendor: { OR: [{ name: { search: search } }, { id: { search: search } }] } },
    ],
  };

  const where = search !== "" ? searchQuery : {};

  const filter = { user: null, verified: false };

  const products = await prisma.product.findMany({
    take: ITEMS_PER_PAGE,
    skip: context.query.page ? (Number(context.query.page) - 1) * ITEMS_PER_PAGE : 0,
    where: { ...where, ...filter },
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
      _count: {
        select: {
          tiers: true,
        },
      },
    },
  });

  const count = await prisma.product.count({ where: { ...where, ...filter } });

  const total = await prisma.product.count({ where: filter });

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

interface pageProps {
  products: ProductWithDetails[];
  count: number;
  total: number;
}

export default function Requests({ products, count, total }: pageProps) {
  return <Products products={products} count={count} total={total} itemsPerPage={ITEMS_PER_PAGE} requests={true} />;
}
