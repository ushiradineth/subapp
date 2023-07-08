import React, { useState } from "react";
import { type GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { yupResolver } from "@hookform/resolvers/yup";
import { XIcon } from "lucide-react";
import { getSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { prisma } from "@acme/db";

import { api } from "~/utils/api";
import { TierSchema, type TierFormData } from "~/utils/validators";
import { Button } from "~/components/Atoms/Button";
import { Input } from "~/components/Atoms/Input";
import { Textarea } from "~/components/Atoms/Textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/Molecules/Card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/Molecules/Form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/Molecules/Select";

export const PERIODS = [
  { period: "1", label: "Daily" },
  { period: "7", label: "Weekly" },
  { period: "28", label: "Monthly" },
  { period: "365", label: "Annually" },
];

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

  const product = await prisma.product.findUnique({ where: { id: context.query.id as string }, select: { vendorId: true } });

  if (product?.vendorId !== session.user.id && session.user.role !== "Admin") {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
      props: {},
    };
  }

  return {
    props: {},
  };
};

export default function NewTier() {
  const router = useRouter();
  const [point, setPoint] = useState("");

  const form = useForm<TierFormData>({
    resolver: yupResolver(TierSchema),
  });

  const { mutate, isLoading } = api.tier.create.useMutation({
    onError: (error) => toast.error(error.message),
    onSuccess: () => toast.success("Tier has been created"),
  });

  const onSubmit = async (data: TierFormData) => {
    mutate({
      name: data.Name,
      description: data.Description,
      productId: router.query.id as string,
      price: data.Price,
      period: data.Period,
      points: data.Points,
    });
  };

  return (
    <>
      <Head>
        <title>Create Tier - SubM</title>
      </Head>
      <main>
        <Card>
          <CardHeader>
            <CardTitle>Tier</CardTitle>
            <CardDescription>Create a new Tier</CardDescription>
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
                        <Input placeholder="Price of the tier in USD" type="number" step={"0.01"} min={0} {...field} />
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
                        <Select onValueChange={field.onChange}>
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
