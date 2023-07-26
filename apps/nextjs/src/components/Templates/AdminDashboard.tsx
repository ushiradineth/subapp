import { useMemo, type ReactNode } from "react";
import Head from "next/head";

import { api } from "~/utils/api";
import { trimString } from "~/lib/utils";
import Loader from "../Atoms/Loader";
import NumberCard from "../Atoms/NumberCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../Molecules/Card";
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

  console.log(data?.activeCategories.currentWeek.length > 0);

  return (
    <>
      <Head>
        <title>Admin Dashboard - SubM</title>
      </Head>
      <Card className="flex flex-col gap-2">
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
          <CardDescription>Visualize and monitor the SubM Platform here.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-2 xl:flex-row">
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
                hasData
              />
            ))}
          </Carousel>
          <div className="flex flex-row gap-2 xl:flex-col">
            <PieChart
              key={"User Turn-in Rate"}
              id={"User Turn-in Rate"}
              truthy={{ title: "Users with a subscription", value: data?.userTurnInRate.usersWithASubscription }}
              falsity={{
                title: "Users without a subscription",
                value: data?.userTurnInRate.usersWithOutASubscription,
              }}
              width={345}
              height={251}
              hasData={Boolean(data?.userTurnInRate)}
            />
            <PieChart
              key={"Vendor Turn-in Rate"}
              id={"Vendor Turn-in Rate"}
              truthy={{ title: "Vendors with a product", value: data?.vendorTurnInRate.vendorsWithAProduct }}
              falsity={{
                title: "Vendors without a product",
                value: data?.vendorTurnInRate.vendorsWithOutAProduct,
              }}
              width={345}
              height={251}
              hasData={Boolean(data?.vendorTurnInRate)}
            />
          </div>
        </CardContent>
        <div className="grid gap-2 px-6 pb-6 md:grid-cols-2 xl:flex xl:flex-row">
          <ChartCardCarousel title={"Popular products"} hasData={data?.activeProducts.currentWeek.length > 0}>
            <Carousel indicators navButtons autoScroll>
              {data?.activeProducts.currentWeek.map((product, index) => (
                <LineChart
                  key={product.id}
                  currentWeek={data.activeProducts.currentWeek[index]?._count.subscriptions ?? 0}
                  previousWeek={data.activeProducts.previousWeek[index]?._count.subscriptions ?? 0}
                  dataKey={"Subscriptions"}
                  title={trimString(product.name, 20)}
                  width={362}
                  height={200}
                  href={`/product/${product.id}`}
                  hasData={data?.activeProducts.currentWeek.length > 0}
                />
              ))}
            </Carousel>
          </ChartCardCarousel>
          <ChartCardCarousel title={"Popular categories"} hasData={data.activeCategories.currentWeek.length > 0}>
            <Carousel indicators navButtons autoScroll>
              {data?.activeCategories.currentWeek.map((category, index) => (
                <LineChart
                  key={category.id}
                  currentWeek={data.activeCategories.currentWeek[index]?._count.products ?? 0}
                  previousWeek={data.activeCategories.previousWeek[index]?._count.products ?? 0}
                  dataKey={"Products"}
                  title={trimString(category.name, 32)}
                  width={362}
                  height={200}
                  href={`/category/${category.id}`}
                  hasData={data?.activeCategories.currentWeek.length > 0}
                />
              ))}
            </Carousel>
          </ChartCardCarousel>
          <ChartCardCarousel title={"Popular vendors"} hasData={data.activeVendors.currentWeek.length > 0}>
            <Carousel indicators navButtons autoScroll>
              {data?.activeVendors.currentWeek.map((vendor, index) => (
                <LineChart
                  key={vendor.id}
                  currentWeek={data.activeVendors.currentWeek[index]?._count.products ?? 0}
                  previousWeek={data.activeVendors.previousWeek[index]?._count.products ?? 0}
                  dataKey={"Products"}
                  title={trimString(vendor.name, 20)}
                  width={362}
                  height={200}
                  href={`/vendor/${vendor.id}`}
                  hasData={data?.activeVendors.currentWeek.length > 0}
                />
              ))}
            </Carousel>
          </ChartCardCarousel>
        </div>
        <div className="grid h-48 grid-cols-3 gap-2 px-6 pb-6">
          <NumberCard number={data?.totalUsers} text="Active Users" />
          <NumberCard number={data?.totalVendors} text="Active Vendors" />
          <NumberCard number={data?.totalProducts} text="Active Products" />
        </div>
      </Card>
    </>
  );
}

export const ChartCardCarousel = ({ children, title, hasData }: { children: ReactNode; title: string; hasData: boolean }) => {
  return (
    <Card className="flex w-full flex-col items-center justify-center">
      <h2 className="pt-8 text-2xl ">{title}</h2>
      {hasData ? children : <div className="flex h-[340px] items-center justify-center">No data found</div>}
    </Card>
  );
};
