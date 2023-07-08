import { useMemo } from "react";
import Head from "next/head";

import { api } from "~/utils/api";
import Loader from "../Atoms/Loader";
import NumberCard from "../Atoms/NumberCard";
import { Card, CardContent, CardHeader, CardTitle } from "../Molecules/Card";
import Carousel from "../Molecules/Carousel";
import LineChart from "../Molecules/LineChart";
import PieChart from "../Molecules/PieChart";

export default function AdminDashboard() {
  const { data, isLoading, isError } = api.admin.dashboard.useQuery(undefined, { refetchOnWindowFocus: false });

  const mainCarouselData = useMemo(
    () => [
      {
        currentWeek: data?.products.currentWeek.length,
        previousWeek: data?.products.previousWeek.length,
        title: "Products",
        href: "/product",
      },
      {
        currentWeek: data?.users.currentWeek.length,
        previousWeek: data?.users.previousWeek.length,
        title: "Users",
        href: "/user",
      },
      {
        currentWeek: data?.subscriptions.currentWeek.length,
        previousWeek: data?.subscriptions.previousWeek.length,
        title: "Subscriptions",
      },
    ],
    [data],
  );

  if (isLoading) return <Loader />;
  if (isError) return <div>Data not found</div>;

  return (
    <>
      <Head>
        <title>Admin Dashboard - SubM</title>
      </Head>
      <main className="flex flex-col gap-2">
        <div className="flex flex-col items-center justify-center gap-2 xl:flex-row">
          <Carousel indicators navButtons autoScroll>
            {mainCarouselData.map((item) => (
              <LineChart
                key={item.title}
                currentWeek={item.currentWeek ?? 0}
                previousWeek={item.previousWeek ?? 0}
                dataKey={item.title}
                title={item.title}
                width={800}
                height={550}
                href={item.href ?? ""}
                mainCard
              />
            ))}
          </Carousel>
          <div className="flex flex-row gap-2 xl:flex-col">
            <Card>
              <CardHeader className="flex items-center justify-center">
                <CardTitle>User Turn-in Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <PieChart
                  key={"User Turn-in Rate"}
                  id={"Vendor Turn-in Rate"}
                  truthy={{ title: "Users with a subscription", value: data?.userTurnInRate.usersWithASubscription }}
                  falsity={{
                    title: "Users without a subscription",
                    value: data?.userTurnInRate.usersWithOutASubscription,
                  }}
                  width={300}
                  height={240}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex items-center justify-center">
                <CardTitle>Vendor Turn-in Rate</CardTitle>
              </CardHeader>
              <PieChart
                key={"Vendor Turn-in Rate"}
                id={"Vendor Turn-in Rate"}
                truthy={{ title: "Vendors with a product", value: data?.vendorTurnInRate.vendorsWithAProduct }}
                falsity={{
                  title: "Vendors without a product",
                  value: data?.vendorTurnInRate.vendorsWithOutAProduct,
                }}
                width={300}
                height={240}
              />
            </Card>
          </div>
        </div>
        <div className="grid gap-2 md:grid-cols-2 xl:flex xl:flex-row">
          <Card className="flex flex-col items-center justify-center">
            <h2 className="pt-8 text-2xl ">Popular products</h2>
            <Carousel indicators navButtons autoScroll>
              {data?.popularProducts.currentWeek.map((product, index) => (
                <LineChart
                  key={product.id}
                  currentWeek={data.popularProducts.currentWeek[index]?._count.subscriptions ?? 0}
                  previousWeek={data.popularProducts.previousWeek[index]?._count.subscriptions ?? 0}
                  dataKey={product.name}
                  title={product.name}
                  width={362}
                  height={200}
                  href={`/product/${product.id}`}
                />
              ))}
            </Carousel>
          </Card>
          <Card className="flex flex-col items-center justify-center">
            <h2 className="pt-8 text-2xl ">Popular categories</h2>
            <Carousel indicators navButtons autoScroll>
              {data?.popularCategories.currentWeek.map((category, index) => (
                <LineChart
                  key={category.id}
                  currentWeek={data.popularCategories.currentWeek[index]?._count.products ?? 0}
                  previousWeek={data.popularCategories.previousWeek[index]?._count.products ?? 0}
                  dataKey={category.name}
                  title={category.name}
                  width={362}
                  height={200}
                  href={`/category/${category.id}`}
                />
              ))}
            </Carousel>
          </Card>
          <Card className="flex flex-col items-center justify-center">
            <h2 className="pt-8 text-2xl ">Popular vendors</h2>
            <Carousel indicators navButtons autoScroll>
              {data?.popularVendors.currentWeek.map((vendor, index) => (
                <LineChart
                  key={vendor.id}
                  currentWeek={data.popularVendors.currentWeek[index]?._count.products ?? 0}
                  previousWeek={data.popularVendors.previousWeek[index]?._count.products ?? 0}
                  dataKey={vendor.name}
                  title={vendor.name}
                  width={362}
                  height={200}
                  href={`/vendor/${vendor.id}`}
                />
              ))}
            </Carousel>
          </Card>
        </div>
        <div className="grid h-48 grid-cols-3 gap-2">
          <NumberCard number={data?.totalUsers} text="Concurrent Users" />
          <NumberCard number={data?.totalVendors} text="Concurrent Vendors" />
          <NumberCard number={data?.totalProducts} text="Concurrent Products" />
        </div>
      </main>
    </>
  );
}
