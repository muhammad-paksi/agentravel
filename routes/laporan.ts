import { Hono } from 'hono';
import { Laporan } from '@/database/model/all';

const laporan = new Hono();

laporan.basePath("/laporan")
  .get("/", async c => {
    const data = await Laporan.find();
    return c.json({ status: "berhasil", data });
  })
;

export default laporan;
