import { Hono } from 'hono';
import { Pembayaran } from '@/database/model/all';

const pembayaran = new Hono();

pembayaran.basePath("/pembayaran")
  .post("/", async c => {
    const body = await c.req.json();
    const baru = new Pembayaran(body);
    await baru.save();
    return c.json({ message: "Pembayaran dibuat", data: baru });
  })
  .put("/:id", async c => {
    const body = await c.req.json();
    const { id } = c.req.param();
    const data = await Pembayaran.findByIdAndUpdate(id, body, { new: true });
    return c.json({ status: "berhasil", data });
  })
;

export default pembayaran;
