import { useState } from "react";
import { type GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { yupResolver } from "@hookform/resolvers/yup";
import { ExternalLink } from "lucide-react";
import { getSession, signIn, useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { api } from "~/utils/api";
import { LoginSchema, RegisterSchema, type LoginFormData, type RegisterFormData } from "~/utils/validators";
import { Button } from "~/components/Atoms/Button";
import FormFieldError from "~/components/Atoms/FormFieldError";
import { Input } from "~/components/Atoms/Input";
import { Label } from "~/components/Atoms/Label";
import Loader from "~/components/Atoms/Loader";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/Molecules/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/Molecules/Tabs";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession({ ctx: context });

  if (session) {
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

export default function Auth() {
  const { status } = useSession();
  const router = useRouter();

  if (status === "loading") return <Loader background />;

  return (
    <>
      <Head>
        <title>Authentication - SubM</title>
      </Head>
      <main className="flex h-screen flex-col items-center justify-center">
        <Tabs defaultValue={router.query.register ? "register" : "login"} className="w-[400px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Registration</TabsTrigger>
          </TabsList>
          <Login />
          <Registration />
        </Tabs>
        <Card className="mt-2 w-full">
          <CardHeader>
            <CardDescription className="flex items-center justify-center gap-2">
              <Link href={"/auth/reset"}>Forgot your password? Reset your password here.</Link>
              <ExternalLink size={"20px"} />
            </CardDescription>
          </CardHeader>
        </Card>
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

  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    const auth = await signIn("credentials", { email: data.Email, password: data.Password, redirect: false, callbackUrl: "/" });
    auth?.status === 401 && toast.error("Incorrect Credentials");
    if (auth?.status !== 401 && auth?.error) {
      console.error(auth.error);
      toast.error("An unknown error has occured");
    }
    setLoading(false);
  };

  return (
    <TabsContent value="login">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Enter your Vendor credentials for SubM Here.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="name">Email</Label>
              <Input id="email" placeholder="email@subm.com" type="email" {...register("Email")} />
              <FormFieldError error={errors.Email?.message} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input id="password" placeholder="********" type="password" {...register("Password")} />
              <FormFieldError error={errors.Password?.message} />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" loading={loading}>
              Login
            </Button>
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

  const { mutate, isLoading } = api.vendor.register.useMutation({
    onError: (error) => toast.error(error.message),
    onSuccess: () => toast.success("Account has been created"),
  });
  const onSubmit = (data: RegisterFormData) => mutate({ name: data.Name, email: data.Email, password: data.Password });

  return (
    <TabsContent value="register">
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
              <Input id="email" placeholder="email@subm.com" type="email" {...register("Email")} />
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
            <Button loading={isLoading}>Register</Button>
          </CardFooter>
        </Card>
      </form>
    </TabsContent>
  );
}
