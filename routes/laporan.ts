import { Hono } from 'hono';
import { Laporan } from '@/database/model/all';

const laporan = new Hono();

laporan
    .get("/", async c => {
        const data = await Laporan.find()
            .populate({
                path: 'invoice_ref',
                populate: {
                    path: 'reservation_id',
                    model: 'reservasi'
                }
            });
        return c.json({ status: "berhasil", data });
    })
    .get("/:id", async c => {
        const { id } = c.req.param();
        const data = await Laporan.findById(id)
            .populate({
                path: 'invoice_ref',
                populate: {
                    path: 'reservation_id',
                    model: 'reservasi'
                }
            });
        return c.json({ status: "berhasil", data });
    });

export default laporan;