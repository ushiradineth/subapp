import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { yupResolver } from "@hookform/resolvers/yup";
import { signIn, useSession } from "next-auth/react";
import { useForm } from "react-hook-form";

import { api } from "~/utils/api";
import { LoginSchema, RegisterSchema, type LoginFormData, type RegisterFormData } from "~/utils/validators";
import FormFieldError from "~/components/FormFieldError";
import Loader from "~/components/Loader";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

export default function Auth() {
  const { status } = useSession();
  const router = useRouter();

  if (status === "loading") return <Loader background />;

  return (
    <>
      <Head>
        <title>SubApp - Authentication</title>
      </Head>
      <main className="flex flex-col items-center justify-center">
        <Tabs defaultValue="login" className="w-[400px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="registration">Registration</TabsTrigger>
          </TabsList>
          <Login />
          <Registration />
        </Tabs>
      </main>
    </>
  );
}

function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(LoginSchema),
  });
  const onSubmit = (data: LoginFormData) => signIn("credentials", { email: data.Email, password: data.Password, redirect: true, callbackUrl: "/" });
  return (
    <TabsContent value="login">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Enter your Vendor credentials for SubApp Here.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="name">Email</Label>
              <Input id="email" placeholder="email@subapp.com" type="email" {...register("Email")} />
              <FormFieldError error={errors.Email?.message} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input id="password" placeholder="********" type="password" {...register("Password")} />
              <FormFieldError error={errors.Password?.message} />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit">Login</Button>
          </CardFooter>
        </Card>
      </form>
    </TabsContent>
  );
}

function Registration() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(RegisterSchema),
  });

  const { mutate } = api.vendor.register.useMutation();
  const onSubmit = (data: RegisterFormData) => mutate({ name: data.Name, email: data.Email, password: data.Password });

  return (
    <TabsContent value="registration">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Registration</CardTitle>
            <CardDescription>Submit your Vendor Application Here.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="John Doe" type="text" {...register("Name")} />
              <FormFieldError error={errors.Name?.message} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" placeholder="email@subapp.com" type="email" {...register("Email")} />
              <FormFieldError error={errors.Email?.message} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input id="password" placeholder="********" type="password" {...register("Password")} />
              <FormFieldError error={errors.Password?.message} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" placeholder="********" type="password" {...register("ConfirmPassword")} />
              <FormFieldError error={errors.ConfirmPassword?.message} />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Register</Button>
          </CardFooter>
        </Card>
      </form>
    </TabsContent>
  );
}
