import { useMemo } from "react";
import Head from "next/head";

import { api } from "~/utils/api";
import Loader from "../Atoms/Loader";
import NumberCard from "../Atoms/NumberCard";
import { Card, CardHeader, CardTitle } from "../Molecules/Card";
import Carousel from "../Molecules/Carousel";
import ChartCard from "../Molecules/LineChart";
import PieChart from "../Molecules/PieChart";

export default function VendorDashboard() {
  const { data, isLoading, isError } = api.vendor.dashboard.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

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
        <title>Vendor Dashboard - SubM</title>
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
                mainCard
              />
            ))}
          </Carousel>
          <div className="flex flex-row gap-2 xl:flex-col">
            <Card>
              <CardHeader className="flex items-center justify-center">
                <CardTitle>User Active Rate</CardTitle>
              </CardHeader>
              <Carousel indicators navButtons autoScroll>
                {data.allProducts
                  .filter((product) => product.subscriptions.length > 0)
                  .map((product) => (
                    <PieChart
                      key={product.id}
                      id={product.id}
                      title={product.name}
                      truthy={{ title: "Active users", value: product.subscriptions.filter((subscription) => subscription.active).length }}
                      falsity={{
                        title: "Terminated users",
                        value: product.subscriptions.filter((subscription) => !subscription.active).length,
                      }}
                    />
                  ))}
              </Carousel>
            </Card>
            <div className="grid h-[345px] grid-flow-row grid-rows-2 gap-2">
              <NumberCard number={data?.totalUsers} text="Concurrent Users" />
              <NumberCard number={data?.totalProducts} text="Concurrent Products" />
            </div>
          </div>
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          <Card className="flex flex-col items-center justify-center">
            <h2 className="pt-8 text-2xl ">Popular products</h2>
            <Carousel indicators navButtons autoScroll>
              {data?.popularProducts.currentWeek.map((product, index) => (
                <ChartCard
                  key={product.id}
                  currentWeek={data.popularProducts.currentWeek[index]?._count.subscriptions ?? 0}
                  previousWeek={data.popularProducts.previousWeek[index]?._count.subscriptions ?? 0}
                  dataKey={product.name}
                  title={product.name}
                  width={521.55}
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
                <ChartCard
                  key={category.id}
                  currentWeek={data.popularCategories.currentWeek[index]?._count.products ?? 0}
                  previousWeek={data.popularCategories.previousWeek[index]?._count.products ?? 0}
                  dataKey={category.name}
                  title={category.name}
                  width={521.55}
                  height={200}
                  href={`/category/${category.id}`}
                />
              ))}
            </Carousel>
          </Card>
        </div>
      </main>
    </>
  );
}
