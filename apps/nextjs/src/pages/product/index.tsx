import { type GetServerSideProps } from "next";
import { getSession } from "next-auth/react";

import { prisma } from "@acme/db";

import Products, { type ProductWithDetails } from "~/components/Products";
import { formalizeDate } from "~/lib/utils";

const ITEMS_PER_PAGE = 10;

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

  const where =
    search !== ""
      ? session.user.role === "Admin"
        ? searchQuery
        : {
            vendorId: { equals: session?.user.id },
            searchQuery,
          }
      : session.user.role === "Admin"
      ? {}
      : { vendorId: { equals: session?.user.id } };

  const products = await prisma.product.findMany({
    take: ITEMS_PER_PAGE,
    skip: context.query.page ? (Number(context.query.page) - 1) * ITEMS_PER_PAGE : 0,
    where: { ...where, user: null, verified: true },
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

  const count = await prisma.product.count({ where: { ...where, user: null, verified: true } });

  const total =
    session?.user.role === "Admin"
      ? await prisma.product.count({ where: { ...where, user: null, verified: true } })
      : await prisma.product.count({
          where: {
            vendorId: {
              equals: session?.user.id,
            },
            user: null,
            verified: true,
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

export default function Index({ products, count, total }: { products: ProductWithDetails[]; count: number; total: number; itemsPerPage: number }) {
  return <Products products={products} count={count} total={total} itemsPerPage={ITEMS_PER_PAGE} />;
}
