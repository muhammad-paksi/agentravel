import { Hono } from 'hono';
import { Reservasi } from '@/database/model/all';

const reservasi = new Hono();

reservasi.basePath("/reservasi")
  .get("/", async c => {
    const data = await Reservasi.find();
    return c.json({ status: "berhasil", data });
  })
  .post("/", async c => {
    const body = await c.req.json();
    const baru = new Reservasi(body);
    await baru.save();
    return c.json({ message: "Berhasil menambahkan reservasi", data: baru });
  })
  .get("/:id", async c => {
    const { id } = c.req.param();
    const data = await Reservasi.findById(id);
    return c.json({ status: "berhasil", data });
  })
  .put("/:id", async c => {
    const body = await c.req.json();
    const { id } = c.req.param();
    const data = await Reservasi.findByIdAndUpdate(id, body, { new: true });
    return c.json({ status: "berhasil", data });
  })
  .delete("/:id", async c => {
    const { id } = c.req.param();
    await Reservasi.findByIdAndDelete(id);
    return c.json({ status: "berhasil", message: "Reservasi dihapus" });
  });

export default reservasi;
