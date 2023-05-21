import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { User, UserCircle2 } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarTrigger } from "~/components/ui/menubar";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from "~/components/ui/navigation-menu";
import icon from "../../public/logo.svg";
import { Button } from "./ui/button";

const ALLOWED_UNAUTHED_PATHS = ["/auth", "/"];

function Layout(props: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "unauthenticated" && !ALLOWED_UNAUTHED_PATHS.includes(router.pathname)) router.push("/auth");

  if (status === "authenticated" && router.pathname === "/auth") router.push("/");

  return (
    <main className="bg-bgc dark h-screen">
      <div className={`border-bc flex h-14 items-center border-b ${router.pathname === "/auth" && "hidden"}`}>
        <Link href={"/"}>
          <Image src={icon} alt="SubM Logo" width={120} className="ml-4" />
        </Link>

        <NavigationMenu className="absolute left-1/2 -translate-x-1/2 transform">
          <NavigationMenuList>
            {session?.user.role === "Admin" && (
              <NavigationMenuItem>
                <Link href="/vendor" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>Vendors</NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            )}
            <NavigationMenuItem>
              <Link href="/user" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>Users</NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/product" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>Products</NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            {session?.user.role === "Admin" && (
              <NavigationMenuItem>
                <Link href="/category" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>Categories</NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            )}
          </NavigationMenuList>
        </NavigationMenu>

        {status === "unauthenticated" ? (
          <Button className="ml-auto mr-4 w-fit" onClick={() => router.push("/auth")}>
            Authenticate
          </Button>
        ) : (
          status === "authenticated" && (
            <Menubar className="dark ml-auto mr-4 w-fit">
              <MenubarMenu>
                <MenubarTrigger className="m-0 p-2">
                  <User className="text-white" />
                </MenubarTrigger>
                <MenubarContent className="dark text-white">
                  <Profile />
                  <MenubarSeparator />
                  <Link href={`/profile/${session?.user.id}`}>
                    <MenubarItem>Profile</MenubarItem>
                  </Link>
                  <Link href={`/settings`}>
                    <MenubarItem>Settings</MenubarItem>
                  </Link>
                  <MenubarItem onClick={() => signOut()}>Log out</MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          )
        )}
      </div>
      <div className={`flex flex-grow flex-col items-center justify-center text-white ${router.pathname !== "/auth" && "my-10"}`}>{props.children}</div>
    </main>
  );
}

export default Layout;

function Profile() {
  const { data: session } = useSession();

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {session?.user.image ? <Image src={session?.user.image} alt={`${session?.user.name}'s profile image`} width={100} height={100} /> : <UserCircle2 width={100} height={100} />}
      <p>{session?.user.name}</p>
      <p>{session?.user.email}</p>
    </div>
  );
}
