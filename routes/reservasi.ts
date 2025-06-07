import { Hono } from 'hono';
import { Reservasi, LogTransaksi } from '@/database/model/all';

const reservasi = new Hono();

async function saveLogReservasi(baru: any) {
  const log = new LogTransaksi({
    reference_id: baru.ticket_id,
    reference_type: 'Reservation',
    date: new Date(),
    description: `Reservation ID: #${baru.ticket_id} successfully created`,
    actor: 'Travel Admin'
  });

  await log.save();
  console.log('Log transaksi berhasil disimpan');
}

reservasi
  .get("/", async c => {
    const data = await Reservasi.find();
    return c.json({ status: "berhasil", data });
  })

  .post("/", async c => {
    const body = await c.req.json();
    const baru = new Reservasi(body);
    await baru.save();

    try {
      await saveLogReservasi(baru);
    } catch (error) {
      console.error("Gagal menyimpan log reservasi:", error);
    }

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
    try {
      // Cari reservasi untuk mendapatkan ticket_id
      const reservasi = await Reservasi.findById(id);
      if (!reservasi) {
        return c.json({ status: "tidak ditemukan", message: "Reservasi tidak ditemukan" }, 404);
      }

      // Hapus log transaksi terkait
      await LogTransaksi.deleteMany({ 
        reference_id: reservasi.ticket_id,
        reference_type: 'Reservation'
      });

      // Hapus reservasi
      await Reservasi.findByIdAndDelete(id);
      
      return c.json({ status: "berhasil", message: "Reservasi dihapus" });
    } catch (error) {
      console.error("Error deleting reservation:", error);
      return c.json({ 
        status: "gagal", 
        message: "Gagal menghapus reservasi", 
        error: String(error) 
      }, 500);
    }
  });

export default reservasi;
