import { Hono, Context } from 'hono';
import { Pengguna } from '@/database/model/all';
import { cookies } from 'next/headers'
import { check_auth } from '@/routes/middleware/check_auth';
import { tokenPayload } from '@/types/payloadType';
import bcrypt from 'bcryptjs';

const pengguna = new Hono();
// const cookie = await cookies();

pengguna
  .get("/", async c => {
    const pengguna = await Pengguna.find();
    return c.json({ status: "berhasil", data: pengguna });
  })
  .get('/afterSignIn', check_auth, async (c: MyContext) => {    
    const authenticatedUser = c.get('user') as tokenPayload;
    
    return c.json({
        ok: true,
        loggedIn: true,
        message: "Berhasil mendapatkan informasi pengguna setelah otentikasi.",
        user: authenticatedUser
    });
  })
  .get("/:id", async c => {
    const { id } = c.req.param();
    const pengguna = await Pengguna.findById(id);
    return c.json({ status: "berhasil", data: pengguna });
  })
  .get("/admin/pengguna", async c => {
    const { username, password } = c.req.query();
    const pengguna = await Pengguna.find({ username, password });
    return c.json({ status: "berhasil", data: pengguna });
  })
  .post("/", async c => {
    console.log("Menambah data pengguna baru");
        
    // Query dan lain-lain
    try {
        const body = await c.req.json();
        const existingUser = await Pengguna.find({ username: body.username.toLowerCase() });
        if (existingUser.length > 0) {
            return c.json({
                ok: true, 
                message: "Username sudah cek", 
                data: existingUser
            });
        }
        const hashed = await bcrypt.hash(body.password, 10);
        const newUser = await Pengguna.create({
            username: body.username,
            email: body.email,
            password: hashed, // Harus di-hash dalam produksi
            role: body.role,
        });

        await newUser.save();
        return c.json({ 
            message: "Berhasil menambahkan data manual", 
            data: {
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
            } 
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            return c.json({ error: error.message }, 400);
        }
        return c.json({ error: String(error) }, 500);
    }
  })
  .put("/:id", async c => {
    const body = await c.req.json();
    const { id } = c.req.param();
    const pengguna = await Pengguna.findByIdAndUpdate(id, body, { new: true });
    return c.json({ status: "berhasil", data: pengguna });
  })
  .delete("/:id", async c => {
    const { id } = c.req.param();
    await Pengguna.findByIdAndDelete(id);
    return c.json({ status: "berhasil", message: "Data pengguna berhasil dihapus" });
  });


type MyContext = Context<{
  Variables: {
    user: {
      id: string;
      username: string;
      email: string;
      role: string;
      exp: number;
    };
  };
}>;

export default pengguna;