import 'server-only'
import { cookies } from 'next/headers'
import { Hono } from "hono";
import Pengguna from "@/database/model/pengguna";
import { encrypt, decrypt } from "@/routes/utils/auth";
import bcrypt from 'bcryptjs';

const autentikasi = new Hono();

autentikasi
    .post('signin', async (c) => {
        try {
            const { username, password } = await c.req.json() as { username: string, password: string };
            if (!username || !password) {
                return c.json({
                    ok: false,
                    loggedIn: false,
                    message: "Username dan password harus diisi",
                });
            }

            const pengguna = await Pengguna.find({ username: username.toLowerCase() });
            if (pengguna.length === 0) {
                return c.json({
                    ok: false,
                    loggedIn: false,
                    // usernameInput: username.toLowerCase(),
                    message: "Username dan password tidak valid",
                });
            }
            
            const isMatch = await bcrypt.compare(password, pengguna[0].password);
            console.log("isMatchCek: ", isMatch);
            if (!isMatch) {
                return c.json({
                    ok: false,
                    loggedIn: false,
                    // usernameInput: username.toLowerCase(),
                    // password: password,
                    // pengguna: pengguna[0],
                    message: "Username dan password tidak valid",
                });
            }
            
            const payload = {
                id: pengguna[0]._id,
                username: pengguna[0].username,
                email: pengguna[0].email,
                role: pengguna[0].role,
                exp: Math.floor(Date.now() / 1000) + 3600 * 72, // Token expires in 3 days (72 hours)
            }
            const token = await encrypt(payload);
            const cookie = await cookies();

            cookie.set('id', payload?.id || '', {
                httpOnly: false,
                secure: false,
                expires: new Date(Date.now() + 3 /* 3 days */ * 24 * 60 * 60 * 1000),
                sameSite: 'lax',
                path: '/',
            })
            cookie.set('username', payload?.username || '', {
                httpOnly: false,
                secure: false,
                expires: new Date(Date.now() + 3 /* 3 days */ * 24 * 60 * 60 * 1000),
                sameSite: 'lax',
                path: '/',
            })
            cookie.set('email', payload?.email || '', {
                httpOnly: false,
                secure: false,
                expires: new Date(Date.now() + 3 /* 3 days */ * 24 * 60 * 60 * 1000),
                sameSite: 'lax',
                path: '/',
            })
            cookie.set('token', token, {
                httpOnly: true,
                secure: false,
                expires: new Date(Date.now() + 3 /* 3 days */ * 24 * 60 * 60 * 1000),
                sameSite: 'lax',
                path: '/',
            });
            return c.json({
                ok: true,
                loggedIn: true,
                message: "Login berhasil",
                username: payload.username,
                token: token
            })
        } catch (error: unknown) {
            if (error instanceof Error) {
                return c.json({ loggedIn: false, error: error.message }, 400);
            }
            
            return c.json({ 
                status: "gagal", 
                loggedIn: false,
                message: String(error) , 
            }, 500);
        }
    })
    .post('signup', async (c) => {
        /*
        const new_user = await c.req.json() as { username: string, email: string, password: string, role: string };
        await fetch("/api/pengguna", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: new_user.username,
                email: new_user.email,
                password: new_user.password, // hash di backend nanti!
                role: new_user.role
            })
        })
        .then(res => res.json())
        */
        return c.json({
            ok: true,
            message: "Signup feature is currently disabled."
        })
    })
    .get('signout', async (c) => {
        // c.header("Set-Cookie", `token=; HttpOnly; Path=/; Secure; Max-Age=0`);
        (await cookies()).delete("token")

        return c.json({
            ok: true,
            loggedIn: false,
            message: "Logout berhasil"
        })
    })

export { autentikasi };