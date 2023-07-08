import { useMemo } from "react";
import Head from "next/head";
import { Pie, PieChart, Tooltip } from "recharts";

import { api } from "~/utils/api";
import { theme } from "~/utils/consts";
import { Card, CardContent, CardHeader, CardTitle } from "../Molecules/Card";
import Carousel from "../Molecules/Carousel";
import ChartCard from "../Molecules/ChartCard";

export default function AdminDashboard() {
  const { data, isLoading } = api.admin.dashboard.useQuery(undefined, { refetchOnWindowFocus: false });

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

  if (isLoading) return <></>;

  return (
    <>
      <Head>
        <title>Admin Dashboard - SubM</title>
      </Head>
      <main className="flex flex-col gap-2">
        <div className="flex flex-col items-center justify-center gap-2 xl:flex-row">
          <Carousel indicators navButtons autoScroll>
            {mainCarouselData.map((item) => (
              <ChartCard
                key={item.title}
                currentWeek={item.currentWeek ?? 0}
                previousWeek={item.previousWeek ?? 0}
                dataKey={item.title}
                title={item.title}
                width={800}
                height={550}
                href={item.href ?? ""}
              />
            ))}
          </Carousel>
          <div className="flex flex-row gap-2 xl:flex-col">
            <Card>
              <CardHeader className="flex items-center justify-center">
                <CardTitle>User Turn-in Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <PieChart width={300} height={250}>
                  <Pie
                    dataKey="value"
                    isAnimationActive={false}
                    data={[
                      { name: "Users with a subscription", value: data?.userTurnInRate.usersWithASubscription },
                      { name: "Users without a subscription", value: data?.userTurnInRate.usersWithOutASubscription },
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill={theme.colors.accent}
                    label
                  />
                  <Tooltip />
                </PieChart>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex items-center justify-center">
                <CardTitle>Vendor Turn-in Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <PieChart width={300} height={250}>
                  <Pie
                    dataKey="value"
                    isAnimationActive={false}
                    data={[
                      { name: "Vendors with a product", value: data?.vendorTurnInRate.vendorsWithAProduct },
                      { name: "Vendors without a product", value: data?.vendorTurnInRate.vendorsWithOutAProduct },
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill={theme.colors.accent}
                    label
                  />
                  <Tooltip />
                </PieChart>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="grid gap-2 md:grid-cols-2 xl:flex xl:flex-row">
          <Card className="flex flex-col items-center justify-center">
            <p className="py-8 text-2xl ">Popular products</p>
            {/* @ts-expect-error Works as intended */}
            <Carousel indicators navButtons autoScroll>
              {data?.popularProducts.currentWeek.map((product, index) => (
                <ChartCard
                  key={product.id}
                  currentWeek={data.popularProducts.currentWeek[index]?._count.subscriptions ?? 0}
                  previousWeek={data.popularProducts.previousWeek[index]?._count.subscriptions ?? 0}
                  dataKey={product.name}
                  title={product.name}
                  width={347.5}
                  height={200}
                  href={`/product/${product.id}`}
                />
              ))}
            </Carousel>
          </Card>
          <Card className="flex flex-col items-center justify-center">
            <p className="py-8 text-2xl ">Popular categories</p>
            {/* @ts-expect-error Works as intended */}
            <Carousel indicators navButtons autoScroll>
              {data?.popularCategories.currentWeek.map((category, index) => (
                <ChartCard
                  key={category.id}
                  currentWeek={data.popularCategories.currentWeek[index]?._count.products ?? 0}
                  previousWeek={data.popularCategories.previousWeek[index]?._count.products ?? 0}
                  dataKey={category.name}
                  title={category.name}
                  width={347.5}
                  height={200}
                  href={`/category/${category.id}`}
                />
              ))}
            </Carousel>
          </Card>
          <Card className="flex flex-col items-center justify-center">
            <p className="py-8 text-2xl ">Popular vendors</p>
            {/* @ts-expect-error Works as intended */}
            <Carousel indicators navButtons autoScroll>
              {data?.popularVendors.currentWeek.map((vendor, index) => (
                <ChartCard
                  key={vendor.id}
                  currentWeek={data.popularVendors.currentWeek[index]?._count.products ?? 0}
                  previousWeek={data.popularVendors.previousWeek[index]?._count.products ?? 0}
                  dataKey={vendor.name}
                  title={vendor.name}
                  width={347.5}
                  height={200}
                  href={`/vendor/${vendor.id}`}
                />
              ))}
            </Carousel>
          </Card>
        </div>
        <div className="grid h-48 grid-cols-3 gap-2">
          <Card className="flex items-center justify-center">
            <p className="text-2xl">{data?.totalUsers} Concurrent Users</p>
          </Card>
          <Card className="flex items-center justify-center">
            <p className="text-2xl">{data?.totalVendors} Concurrent Vendors</p>
          </Card>
          <Card className="flex items-center justify-center">
            <p className="text-2xl">{data?.totalProducts} Concurrent Products</p>
          </Card>
        </div>
      </main>
    </>
  );
}
