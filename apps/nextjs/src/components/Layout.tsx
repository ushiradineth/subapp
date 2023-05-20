import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { User, UserCircle2 } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarTrigger } from "~/components/ui/menubar";
import icon from "../../public/logo.svg";

function Layout(props: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "unauthenticated" && router.pathname !== "/auth") router.push("/auth");

  return (
    <main className="bg-bgc">
      <div className="border-bc flex h-14 items-center border-b">
        <Link href={"/"}>
          <Image src={icon} alt="SubM Logo" width={120} className="ml-4" />
        </Link>
        <Menubar className="ml-auto mr-4 w-fit">
          <MenubarMenu>
            <MenubarTrigger>
              <User className="w-8 text-black" />
            </MenubarTrigger>
            <MenubarContent>
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
      </div>
      <div className="min-h-screen pb-20 pt-10">{props.children}</div>
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
