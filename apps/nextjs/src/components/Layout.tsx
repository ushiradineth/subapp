import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { User, UserCircle2 } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

import { supabase } from "@acme/api/src/lib/supabase";

import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarTrigger } from "~/components/ui/menubar";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "~/components/ui/navigation-menu";
import { env } from "~/env.mjs";
import icon from "../../public/logo.svg";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";

const ALLOWED_UNAUTHED_PATHS = ["/auth", "/", "/auth/reset", "/learn"];
const NAVBAR_HIDDEN__PATHS = ["/auth", "/auth/reset"];

function Layout(props: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();

  if (status === "unauthenticated" && !ALLOWED_UNAUTHED_PATHS.includes(router.pathname)) router.push("/auth");

  if (status === "authenticated" && router.pathname === "/auth") router.push("/");

  return (
    <main className="bg-bgc border-bc dark flex min-h-screen flex-col">
      <div className={`border-bc flex h-14 items-center border-b ${NAVBAR_HIDDEN__PATHS.includes(router.pathname) && "hidden"}`}>
        <Link href={"/"}>
          <Image src={icon} alt="SubM Logo" width={120} className="ml-4" />
        </Link>
        <NavItems />
        <AuthButton />
      </div>
      <div className={`flex flex-grow flex-col items-center justify-center text-white ${router.pathname !== "/auth" && "my-10"}`}>
        {props.children}
      </div>
    </main>
  );
}

export default Layout;

function NavItems() {
  const { data: session, status } = useSession();

  return (
    <>
      {status === "authenticated" && (
        <NavigationMenu className="absolute left-1/2 -translate-x-1/2 transform">
          <NavigationMenuList>
            {session?.user.role === "Admin" && (
              <Link href={"/vendor"}>
                <NavigationMenuItem className={navigationMenuTriggerStyle()}>Vendors</NavigationMenuItem>
              </Link>
            )}
            {session?.user.role === "Admin" && (
              <Link href={"/user"}>
                <NavigationMenuItem className={navigationMenuTriggerStyle()}>Users</NavigationMenuItem>
              </Link>
            )}
            <NavigationMenuItem>
              <NavigationMenuTrigger>Products</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className={`flex flex-col gap-3 p-4 md:grid-cols-2 ${session?.user.role === "Admin" ? "w-[400px]" : "w-[200px]"}`}>
                  <Link href={"/product"}>
                    <NavigationMenuItem className={navigationMenuTriggerStyle()}>All Products</NavigationMenuItem>
                  </Link>
                  <Link href={"/product/new"}>
                    <NavigationMenuItem className={navigationMenuTriggerStyle()}>Create Product</NavigationMenuItem>
                  </Link>
                  {session?.user.role === "Admin" && (
                    <Link href={"/product/requests"}>
                      <NavigationMenuItem className={navigationMenuTriggerStyle()}>Product Requests</NavigationMenuItem>
                    </Link>
                  )}
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {session?.user.role === "Admin" && (
              <NavigationMenuItem>
                <NavigationMenuTrigger>Categories</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className={`flex flex-col gap-3 p-4 md:grid-cols-2 ${session?.user.role === "Admin" ? "w-[400px]" : "w-[200px]"}`}>
                    <Link href={"/category"}>
                      <NavigationMenuItem className={navigationMenuTriggerStyle()}>All Categories</NavigationMenuItem>
                    </Link>
                    <Link href={"/category/new"}>
                      <NavigationMenuItem className={navigationMenuTriggerStyle()}>Create Category</NavigationMenuItem>
                    </Link>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            )}
          </NavigationMenuList>
        </NavigationMenu>
      )}
    </>
  );
}

function AuthButton() {
  const { data: session, status } = useSession();
  const router = useRouter();

  return (
    <>
      {status === "unauthenticated" ? (
        <Button
          className="ml-auto mr-4 w-fit bg-indigo-600 font-semibold text-white hover:bg-indigo-500"
          onClick={() => router.push("/auth")}>
          Join Us
        </Button>
      ) : (
        status === "authenticated" && (
          <Menubar className="border-bc ml-auto mr-4 w-fit">
            <MenubarMenu>
              <MenubarTrigger className="m-0 p-2">
                <User className="text-white" />
              </MenubarTrigger>
              <MenubarContent className="border-bc text-white">
                <Profile />
                <MenubarSeparator />
                {session.user.role === "Vendor" && (
                  <Link href={`/vendor/${session?.user.id}`}>
                    <MenubarItem>Profile</MenubarItem>
                  </Link>
                )}
                <Link href={`/settings`}>
                  <MenubarItem>Settings</MenubarItem>
                </Link>
                <MenubarItem onClick={() => signOut()}>Log out</MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        )
      )}
    </>
  );
}

function Profile() {
  const { data: session } = useSession();
  const [image, setImage] = useState("");

  useEffect(() => {
    getImage();
  }, []);

  const getImage = async () => {
    const { data: image } = await supabase.storage.from(env.NEXT_PUBLIC_USER_ICON).list(session?.user.id, { limit: 1 });
    if (image) {
      const { data: url } = supabase.storage.from(env.NEXT_PUBLIC_USER_ICON).getPublicUrl(`${session?.user.id}/${image[0]?.name}`);

      if (url.publicUrl) {
        try {
          const result = await fetch(url.publicUrl, { method: "HEAD" });
          if (result) {
            if (result.status === 200) {
              setImage(url.publicUrl);
            }
          }
        } catch (error) {}
      }
    }
  };

  return (
    <Link href={session?.user.role === "Vendor" ? `/vendor/${session?.user.id}` : `#`}>
      <MenubarItem className="flex flex-col items-center justify-center p-4">
        <Avatar>
          <AvatarImage src={image} alt="User Avatar" width={100} height={100} />
          <AvatarFallback>
            <UserCircle2 width={100} height={100} />
          </AvatarFallback>
        </Avatar>
        <p>{session?.user.name}</p>
        <p>{session?.user.email}</p>
      </MenubarItem>
    </Link>
  );
}
