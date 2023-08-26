import { useMemo } from "react";
import Head from "next/head";
import { Info } from "lucide-react";

import { api } from "~/utils/api";
import { trimString } from "~/lib/utils";
import Loader from "../Atoms/Loader";
import NumberCard from "../Atoms/NumberCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../Molecules/Card";
import Carousel from "../Molecules/Carousel";
import LineChart from "../Molecules/LineChart";
import PieChart from "../Molecules/PieChart";
import { ChartCardCarousel } from "./AdminDashboard";

export default function VendorDashboard() {
  const { data, isLoading, isError } = api.vendor.dashboard.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const mainCarouselData = useMemo(
    () => [
      {
        currentWeek: data?.products.currentWeek.length,
        previousWeek: data?.products.previousWeek.length,
        title: "New Products",
        hint: "Total products added by you this week compared to last week",
        href: "/product",
      },
      {
        currentWeek: data?.users.currentWeek.length,
        previousWeek: data?.users.previousWeek.length,
        title: "New Users",
        hint: "Total users joined to products you own this week compared to last week",
      },
      {
        currentWeek: data?.subscriptions.currentWeek.length,
        previousWeek: data?.subscriptions.previousWeek.length,
        title: "New Subscriptions",
        hint: "Total subscriptions made to products you own this week compared to last week",
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
      <Card className="flex flex-col p-4">
        <CardHeader>
          <CardTitle>Vendor Dashboard</CardTitle>
          <CardDescription>Visualize and monitor your products on the SubM Platform here.</CardDescription>
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
                hint={item.hint}
                width={800}
                height={550}
                href={item.href ?? ""}
                mainCard
                hasData
              />
            ))}
          </Carousel>
          <div className="flex flex-row gap-2 xl:flex-col">
            <Card>
              <CardHeader className="flex items-center justify-center">
                <CardTitle
                  className="flex items-center justify-center gap-2"
                  hint={"User base of the products, Active or terminated subscriptions"}>
                  User Active Rate <Info color="white" size={"20"} />
                </CardTitle>
              </CardHeader>
              {data?.allProducts.length > 0 ? (
                <Carousel indicators navButtons autoScroll>
                  {data.allProducts
                    .filter((product) => product.subscriptions.length > 0)
                    .map((product) => (
                      <PieChart
                        key={product.id}
                        id={product.id}
                        title={trimString(product.name, 20)}
                        truthy={{
                          title: "Active users",
                          value: product.subscriptions.filter((subscription) => subscription.active).length,
                        }}
                        falsity={{
                          title: "Terminated users",
                          value: product.subscriptions.filter((subscription) => !subscription.active).length,
                        }}
                        hasData={product.subscriptions.length !== 0}
                        hideCard
                      />
                    ))}
                </Carousel>
              ) : (
                <div className="flex h-[270px] w-[410px] items-center justify-center">No data found</div>
              )}
            </Card>
            <div className="grid h-[345px] grid-flow-row grid-rows-2 gap-2">
              <NumberCard number={data?.totalUsers} text="Active Users" />
              <NumberCard number={data?.totalProducts} text="Active Products" />
            </div>
          </div>
        </CardContent>
        <div className="grid gap-2 px-6 pb-6 md:grid-cols-2">
          <ChartCardCarousel
            title={"Active Products"}
            hint="Performance of your products"
            hasData={data.activeProducts.currentWeek.length > 0}>
            <Carousel indicators navButtons autoScroll>
              {data?.activeProducts.currentWeek.map((product, index) => (
                <LineChart
                  key={product.id}
                  currentWeek={data.activeProducts.currentWeek[index]?._count.subscriptions ?? 0}
                  previousWeek={data.activeProducts.previousWeek[index]?._count.subscriptions ?? 0}
                  dataKey={"Subscriptions"}
                  title={trimString(product.name, 20)}
                  width={521.55}
                  height={200}
                  href={`/product/${product.id}`}
                  hasData={Boolean(data.activeProducts.currentWeek.length > 0)}
                />
              ))}
            </Carousel>
          </ChartCardCarousel>
          <ChartCardCarousel
            title={"Active Categories"}
            hint="Performance of your products in the categories you own products of"
            hasData={data.activeCategories.currentWeek.length > 0}>
            <Carousel indicators navButtons autoScroll>
              {data?.activeCategories.currentWeek.map((category, index) => (
                <LineChart
                  key={category.id}
                  currentWeek={data.activeCategories.currentWeek[index]?._count.products ?? 0}
                  previousWeek={data.activeCategories.previousWeek[index]?._count.products ?? 0}
                  dataKey={"Products"}
                  title={trimString(category.name, 32)}
                  width={521.55}
                  height={200}
                  href={`/category/${category.id}`}
                  hasData={Boolean(data.activeCategories.currentWeek.length > 0)}
                />
              ))}
            </Carousel>
          </ChartCardCarousel>
        </div>
      </Card>
    </>
  );
}
