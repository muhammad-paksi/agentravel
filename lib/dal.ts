import 'server-only'
 
import { cookies } from 'next/headers'
import { encrypt, decrypt } from "@/routes/utils/auth";
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { tokenPayload } from '@/types/payloadType';
import Pengguna from "@/database/model/pengguna";
 
export const verifySession = cache(async () => {
  const cookie = (await cookies()).get('token')?.value
  const payload = await decrypt(cookie) as tokenPayload | undefined
 
  if (!payload?.username) {
    redirect('/')
  }
 
  return { isLoggedIn: true, user: payload }
})

export const getUser = cache(async () => {
    const session = await verifySession()
    if (!session) return null
   
    try {
      const data = await Pengguna.find({ username: session.user.username.toLowerCase() });

   
      const user = data[0]
   
      return user
    } catch (error) {
      console.log('Failed to fetch user')
      return null
    }
  })