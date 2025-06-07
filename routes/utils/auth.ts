import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { tokenPayload } from '@/types/payloadType'

const secretKey = process.env.TOKEN_SECRET
const encodedKey = new TextEncoder().encode(secretKey)
 
export async function encrypt(payload: tokenPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('3d')
    .sign(encodedKey)
}
 
export async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    })
    return payload
  } catch (error) {
    console.log('Failed to verify session')
  }
}