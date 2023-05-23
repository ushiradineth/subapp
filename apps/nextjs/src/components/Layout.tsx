import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { User, UserCircle2 } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarTrigger } from "~/components/ui/menubar";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "~/components/ui/navigation-menu";
import icon from "../../public/logo.svg";
import { Button } from "./ui/button";

const ALLOWED_UNAUTHED_PATHS = ["/auth", "/"];
const VENDOR_PROHIBITED_PATHS = ["/vendor", "/category"];

function Layout(props: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "unauthenticated" && !ALLOWED_UNAUTHED_PATHS.includes(router.pathname)) router.push("/auth");

  if (session?.user.role === "Vendor" && VENDOR_PROHIBITED_PATHS.includes(router.pathname)) router.push("/");

  if (status === "authenticated" && router.pathname === "/auth") router.push("/");

  return (
    <main className="bg-bgc border-bc dark flex min-h-screen flex-col">
      <div className={`border-bc flex h-14 items-center border-b ${router.pathname === "/auth" && "hidden"}`}>
        <Link href={"/"}>
          <Image src={icon} alt="SubM Logo" width={120} className="ml-4" />
        </Link>
        <NavItems />
        <AuthButton />
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

function NavItems() {
  const { data: session, status } = useSession();

  return (
    <>
      {status === "authenticated" && (
        <NavigationMenu className="absolute left-1/2 -translate-x-1/2 transform">
          <NavigationMenuList>
            {session?.user.role === "Admin" && (
              <NavigationMenuItem>
                <NavigationMenuTrigger>Vendors</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className={`flex flex-col gap-3 p-4 md:grid-cols-2 ${session?.user.role === "Admin" ? "w-[400px]" : "w-[200px]"}`}>
                    <NavigationMenuLink href="/vendor" className={navigationMenuTriggerStyle()}>
                      All Vendors
                    </NavigationMenuLink>
                    <NavigationMenuLink href="/vendor/requests" className={navigationMenuTriggerStyle()}>
                      Vendor Requests
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            )}

            <NavigationMenuLink href="/user" className={navigationMenuTriggerStyle()}>
              Users
            </NavigationMenuLink>

            <NavigationMenuItem>
              <NavigationMenuTrigger>Products</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className={`flex flex-col gap-3 p-4 md:grid-cols-2 ${session?.user.role === "Admin" ? "w-[400px]" : "w-[200px]"}`}>
                  <NavigationMenuLink href="/product" className={navigationMenuTriggerStyle()}>
                    All Products
                  </NavigationMenuLink>
                  <NavigationMenuLink href="/product/new" className={navigationMenuTriggerStyle()}>
                    Create Product
                  </NavigationMenuLink>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {session?.user.role === "Admin" && (
              <NavigationMenuItem>
                <NavigationMenuTrigger>Categories</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className={`flex flex-col gap-3 p-4 md:grid-cols-2 ${session?.user.role === "Admin" ? "w-[400px]" : "w-[200px]"}`}>
                    <NavigationMenuLink href="/category" className={navigationMenuTriggerStyle()}>
                      All Categories
                    </NavigationMenuLink>
                    <NavigationMenuLink href="/category/new" className={navigationMenuTriggerStyle()}>
                      Create Category
                    </NavigationMenuLink>
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
        <Button className="ml-auto mr-4 w-fit" onClick={() => router.push("/auth")}>
          Join Us
        </Button>
      ) : (
        status === "authenticated" && (
          <Menubar className="dark ml-auto mr-4 w-fit border-bc">
            <MenubarMenu>
              <MenubarTrigger className="m-0 p-2">
                <User className="text-white" />
              </MenubarTrigger>
              <MenubarContent className="dark text-white border-bc">
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
    </>
  );
}
