import { Hono } from 'hono';
import { Pengguna } from '@/database/model/all';

const pengguna = new Hono();

pengguna.basePath("/pengguna")
  .get("/", async c => {
    const pengguna = await Pengguna.find();
    return c.json({ status: "berhasil", data: pengguna });
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
    const body = await c.req.json();
    const newUser = new Pengguna(body);
    await newUser.save();
    return c.json({ message: "Berhasil menambahkan pengguna", data: newUser });
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

export default pengguna;
