import { Hono } from 'hono';
import { Invois } from '@/database/model/all';

const invois = new Hono();

invois.basePath("/invois")
  .post("/", async c => {
    const body = await c.req.json();
    const baru = new Invois(body);
    await baru.save();
    return c.json({ message: "Invois dibuat", data: baru });
  })
  .get("/:id", async c => {
    const { id } = c.req.param();
    const data = await Invois.findById(id);
    return c.json({ status: "berhasil", data });
  });

export default invois;
