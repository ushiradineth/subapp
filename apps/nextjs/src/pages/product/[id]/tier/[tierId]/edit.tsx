import React, { useEffect, useState } from "react";
import { type GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { yupResolver } from "@hookform/resolvers/yup";
import { Cross, XIcon } from "lucide-react";
import { getSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { prisma, type Tier } from "@acme/db";

import { api } from "~/utils/api";
import { TierSchema, type TierFormData } from "~/utils/validators";
import { Button } from "~/components/Atoms/Button";
import { Input } from "~/components/Atoms/Input";
import { Textarea } from "~/components/Atoms/Textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/Molecules/Card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/Molecules/Form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/Molecules/Select";
import { formalizeDate } from "~/lib/utils";
import { PERIODS } from "../new";

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

  const tier = await prisma.tier.findUnique({
    where: { id: context.query.tierId as string },
    include: { product: { select: { vendorId: true } } },
  });

  if (!tier || tier.productId !== context.query.id) return { props: {} };

  if (tier?.product.vendorId !== session.user.id && session.user.role !== "Admin") {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
      props: {},
    };
  }

  return {
    props: {
      tier: {
        ...tier,
        createdAt: formalizeDate(tier?.createdAt),
      },
    },
  };
};

interface pageProps {
  tier: Tier;
}

export default function EditTier({ tier }: pageProps) {
  const router = useRouter();
  const [point, setPoint] = useState("");

  const form = useForm<TierFormData>({
    resolver: yupResolver(TierSchema),
  });

  useEffect(() => {
    if (tier && tier.name && tier.description) {
      form.setValue("Name", tier.name);
      form.setValue("Description", tier.description);
      form.setValue("Period", tier.period);
      form.setValue("Price", tier.price);
      form.setValue("Points", tier.points);
    }
  }, [tier]);

  const { mutate, isLoading } = api.tier.update.useMutation({
    onError: (error) => toast.error(error.message),
    onSuccess: () => toast.success("Tier has been updated"),
  });

  const onSubmit = async (data: TierFormData) => {
    if (data.Points.length === 0) {
      return form.setError("Points", { message: "Points is required" });
    }

    mutate({
      name: data.Name,
      description: data.Description,
      price: data.Price,
      period: data.Period,
      id: router.query.tierId as string,
      points: data.Points,
    });
  };

  if (!tier) return <div>Tier not found</div>;

  return (
    <>
      <Head>
        <title>Edit Tier - {tier.name}</title>
      </Head>
      <main>
        {" "}
        <Card>
          <CardHeader>
            <CardTitle>Tier</CardTitle>
            <CardDescription>Edit &quot;{tier.name}&quot;</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="w-[400px] space-y-8">
                <FormField
                  control={form.control}
                  name="Name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="A Unique name for the tier" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="Description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="A brief description of the tier" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="Points"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Features points</FormLabel>
                      <FormControl>
                        <>
                          {form.getValues("Points")?.length > 0 && (
                            <Card className="p-4">
                              <ul className="list-disc">
                                {(Array.isArray(form.getValues("Points")) ? form.getValues("Points") : []).map((point, index) => (
                                  <li key={index} className="flex">
                                    <p className="w-full truncate">{point}</p>
                                    <span
                                      className="ml-auto cursor-pointer"
                                      onClick={() =>
                                        form.setValue(
                                          "Points",
                                          [...form.getValues("Points")].filter((_, i) => i !== index),
                                        )
                                      }>
                                      <XIcon />
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </Card>
                          )}
                          <div className="flex flex-row gap-2">
                            <Input
                              {...field}
                              onChange={(value) => setPoint(value.target.value)}
                              value={point}
                              maxLength={100}
                              placeholder="Feature points of this tier"
                            />
                            <Button
                              type="button"
                              onClick={() => {
                                if (point !== "") {
                                  form.setValue("Points", [
                                    ...(Array.isArray(form.getValues("Points")) ? form.getValues("Points") : []),
                                    point,
                                  ]);
                                  setPoint("");
                                } else {
                                  form.setError("Points", { message: "Point should have atleast one character" });
                                }
                              }}>
                              Add
                            </Button>
                          </div>
                        </>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="Price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input placeholder="Price of the tier in USD" type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="Period"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Period</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={PERIODS.find((period) => Number(period?.period) === tier.period)?.period}>
                          <SelectTrigger className="w-[400px]">
                            <SelectValue placeholder="Period of the Subscription" />
                          </SelectTrigger>
                          <SelectContent className="w-max">
                            {PERIODS.map((period, index) => {
                              return (
                                <SelectItem key={index} value={period?.period || ""}>
                                  {period?.label}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" loading={isLoading}>
                  Submit
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
