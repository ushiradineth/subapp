import { useState } from "react";
import { type GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { yupResolver } from "@hookform/resolvers/yup";
import { ExternalLink } from "lucide-react";
import { getSession, useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { api } from "~/utils/api";
import { ForgetPasswordSchema, ResetPasswordSchema, type ForgetPasswordFormData, type ResetPasswordFormData } from "~/utils/validators";
import { Button } from "~/components/Atoms/Button";
import FormFieldError from "~/components/Atoms/FormFieldError";
import { Input } from "~/components/Atoms/Input";
import { Label } from "~/components/Atoms/Label";
import Loader from "~/components/Atoms/Loader";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/Molecules/Card";

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
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState("");

  if (status === "loading") return <Loader background />;

  return (
    <>
      <Head>
        <title>Reset Password - SubM</title>
      </Head>
      <main className="flex h-screen flex-col items-center justify-center">
        {emailSent ? <ResetPassword email={email} /> : <SendEmail setEmail={setEmail} setEmailSent={setEmailSent} />}
        <Card className="mt-2 w-full">
          <CardHeader>
            <CardDescription className="flex items-center justify-center gap-2">
              <Link href={"/auth"}>Found your password? Go back here.</Link>
              <ExternalLink size={"20px"} />
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    </>
  );
}

interface SendEmailProps {
  setEmail: (email: string) => void;
  setEmailSent: (emailSent: boolean) => void;
}

function SendEmail({ setEmail, setEmailSent }: SendEmailProps) {
  const {
    register,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgetPasswordFormData>({
    resolver: yupResolver(ForgetPasswordSchema),
  });

  const { mutate, isLoading } = api.vendor.forgotPassword.useMutation({
    onSuccess: () => {
      setEmail(getValues("Email"));
      setEmailSent(true);
    },
    onError: (error) => toast.error(error.message),
  });

  const onSubmit = (data: ForgetPasswordFormData) => {
    mutate({ email: data.Email });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>Enter your email address to receive an One Time Passcode.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="space-y-1">
            <Label htmlFor="name">Email</Label>
            <Input id="email" placeholder="email@subm.com" type="email" {...register("Email")} />
            <FormFieldError error={errors.Email?.message} />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" loading={isLoading}>
            Continue
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

interface ResetPasswordProps {
  email: string;
}

function ResetPassword({ email }: ResetPasswordProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: yupResolver(ResetPasswordSchema),
  });

  const { mutate, isLoading } = api.vendor.resetPassword.useMutation({
    onSuccess: () => toast.success("Your password has been reset"),
    onError: (error) => toast.error(error.message),
  });

  const onSubmit = (data: ResetPasswordFormData) => mutate({ email, password: data.Password, otp: data.OTP });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Confirm your Identity</CardTitle>
          <CardDescription>Check your email for the verification code.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="space-y-1">
            <Label htmlFor="otp">One Time Passcode</Label>
            <Input id="otp" placeholder="******" type="number" {...register("OTP")} />
            <FormFieldError error={errors.OTP?.message} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input id="password" placeholder="Enter your new password" type="password" {...register("Password")} />
            <FormFieldError error={errors.Password?.message} />
          </div>
        </CardContent>
        <CardFooter>
          <Button loading={isLoading}>Reset Password</Button>
        </CardFooter>
      </Card>
    </form>
  );
}
