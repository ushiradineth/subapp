import React, { useState, type FormEvent } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";

import { api } from "~/utils/api";
import { emailValidator, passwordValidator } from "~/utils/validators";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Textarea } from "~/components/ui/textarea";

const Auth: NextPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const q = api.auth.authorize.useMutation();

  return (
    <>
      <Head>
        <title>SubApp - Authentication</title>
      </Head>
      <main className="bg-bgc flex h-screen flex-col items-center justify-center">
        <Tabs defaultValue="login" className="w-[400px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="registration">Registration</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>
                  Enter your Vendor credentials for SubApp Here.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="name">Email</Label>
                  <Input
                    id="email"
                    placeholder="email@subapp.com"
                    type="email"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" placeholder="********" type="password" />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  onClick={() =>
                    signIn("credentials", {
                      email,
                      password,
                      redirect: false,
                      callbackUrl: "/",
                    })
                  }
                >
                  Login
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <Registration />
        </Tabs>
      </main>
    </>
  );
};

export default Auth;

// const credentialsSchema = yup
//   .object()
//   .shape({
//     password: passwordValidator,
//     email: emailValidator,
//   })
//   .required();

function Registration() {
  return (
    <TabsContent value="registration">
      <Card>
        <CardHeader>
          <CardTitle>Registration</CardTitle>
          <CardDescription>
            Submit your Vendor Application Here.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="space-y-1">
            <Label htmlFor="name">Email</Label>
            <Input id="email" placeholder="email@subapp.com" type="email" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input id="password" placeholder="********" type="password" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="description">About your subscription</Label>
            <Textarea
              id="description"
              placeholder="Description"
              maxLength={500}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button>Register</Button>
        </CardFooter>
      </Card>
    </TabsContent>
  );
}
