import 'server-only'
import { cookies } from 'next/headers'
import { encrypt, decrypt } from "@/routes/utils/auth";
import { tokenPayload } from '@/types/payloadType';
import { MiddlewareHandler } from "hono";

const check_auth: MiddlewareHandler = async (c, next) => {
    const cookie = await cookies();

    const tokenFromCookie = cookie.get('token')?.value;
    // const tokenFromCookie = c.req.header('cookie');
    console.log(tokenFromCookie)
    if (!tokenFromCookie) {
        return c.json({
            loggedIn: false,
            message: 'Akses ditolak. Token autentikasi tidak ditemukan dalam cookie.',
            path: c.req.url
        }, 401);
    }
    
    const payload = await decrypt(tokenFromCookie) as tokenPayload | undefined;
    c.set('user', payload); 
    
    await next()
}

export { check_auth }