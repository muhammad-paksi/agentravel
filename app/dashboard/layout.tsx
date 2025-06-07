import '@/app/globals.css'
import type React from "react"
import { User } from "@/types/userType";
import { Sidebar } from "@/components/views/sidebar"
import { Header } from "@/components/views/header"
import { cookies } from 'next/headers'
import { encrypt, decrypt } from "@/routes/utils/auth";
// import { tokenPayload } from "@/types/payloadType";
// import { useEffect, useState} from "react";
// import { useRouter } from "next/navigation";

// import { UserContext } from "@/app/context/UserContext";
// import { usePathname } from 'next/navigation';
// import { getUser } from '@/lib/dal';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // const router = useRouter();
  // const pathname = usePathname();
  // const [user, setUser] = useState< User | null>(null);

  // useEffect(() => {
  //   console.log("Checking cookie for authentication at: ", pathname);
  //   fetch('/api/pengguna/afterSignIn', {
  //     credentials: 'include',
  //   })
  //   .then(res => res.json())
  //   .then(data => {
  //     // console.log("Data.loggedIn: ", data.loggedIn);
  //     // console.log("Data user: ", data.user)
  //     // const comparison = compareUserData(data.user, user);
  //     // console.log("newly fetched", data.user)
  //     // console.log("already fetched", user)
  //     if (data.loggedIn) {
  //       setUser(data.user);
  //     } else {
  //       // router.push('/');
  //     }
  //   });
  //   // check_cookie().then(auth => {
  //   //   if (auth.loggedIn) setUser(auth.user);
  //   //   else router.push('/');
  //   // });
  // }, [pathname]);
  // const token = (await cookies()).get('token')?.value; // ini ambil dari Next.js server
  // if (token == undefined) 
  // const res = await fetch('http://localhost:3000/api/pengguna/afterSignIn', {
  //   headers: {
  //     'Cookie' : token || '', // Pass the cookie to the request
  //   },
  //   credentials: 'include',
  // })
  // const data = await res.json() as User;
  // console.log(data)
  const cookie = await cookies();
  const data = cookie.get('token')?.value
  const user = await decrypt(data) as User;

  return (
    // <UserContext.Provider value={ user }>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header user={ user } />
          <main className="flex-1 overflow-y-auto bg-[#f5f5f5] p-4">{children}</main>
        </div>
      </div>
    // </UserContext.Provider>
  )
}