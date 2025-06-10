import { Hono } from 'hono';
import { Invois, Laporan, LogTransaksi, Reservasi } from '@/database/model/all';

const invois = new Hono();

async function createIncomeReport(invoice: any, customer_name: string) {
  const incomeReport = new Laporan({
    amount: invoice.total_price || (invoice.total_amount + (invoice.fee || 0)),
    type: 'Income',
    description: `Pembayaran dari ${customer_name}`,
    invoice_ref: invoice._id,
    created_by: 'system',
  });
  await incomeReport.save();
  console.log('Income report created:', incomeReport);
}

async function createExpenseReport(invoice: any, customer_name: string) {
  const expenseReport = new Laporan({
    amount: invoice.total_amount,
    type: 'Expense',
    description: `Pemesanan untuk ${customer_name}`,
    invoice_ref: invoice._id,
    created_by: 'system',
  });
  await expenseReport.save();
  console.log('Expense report created:', expenseReport);
}

async function logInvoiceStatusChange(invoice: any) {
  // First populate the invoice with reservation data if not already populated
  const populatedInvoice = await Invois.findById(invoice._id)
    .populate({
      path: 'reservation_id',
      model: 'reservasi'
    });

  if (!populatedInvoice) {
    console.error('Invoice not found');
    return;
  }

  // Get the ticket_id from the reservation
  const ticketId = populatedInvoice.reservation_id[0]?.ticket_id || 'unknown';
const customer_name = populatedInvoice.customer_name || 'pelanggan';

  const logTransaksi = new LogTransaksi({
    reference_id: invoice._id, // Use the ticket_id instead of invoice._id
    reference_type: 'Invoice',
    date: new Date(),
    description: `Reservation ID: #${ticketId} has been paid`, // Use the ticket_id here
    actor: 'Finance Admin'
  });
  
  await logTransaksi.save();
  console.log('Log transaksi berhasil disimpan');
}

async function createReportsFromInvoice(invoice: any, isUpdate: boolean = false) {
  console.log(`Processing invoice ${invoice._id} with status ${invoice.status}`);

  const populatedInvoice = await Invois.findById(invoice._id).populate({
    path: 'reservation_id',
    model: 'reservasi'
  });

  if (!populatedInvoice) {
    console.log('Invoice not found');
    return;
  }

  const customer_name = populatedInvoice.reservation_id?.name || 'pelanggan';
  const existingReports = await Laporan.find({ invoice_ref: invoice._id });

  if (populatedInvoice.status === 'Paid' && !existingReports.some(r => r.type === 'Income')) {
    await createIncomeReport(populatedInvoice, customer_name);
  }

  if (populatedInvoice.status === 'Unpaid' && !existingReports.some(r => r.type === 'Expense')) {
    await createExpenseReport(populatedInvoice, customer_name);
  }
}

invois
  /* POST LAMA
  .post("/", async c => {
    const body = await c.req.json();
    const baru = new Invois(body);
    await baru.save();

    const invoiceWithReservation = await Invois.findById(baru._id).populate('reservation_id');
    await createReportsFromInvoice(invoiceWithReservation || baru);

    return c.json({ message: "Invois dibuat", data: baru });
  })
  */
  // POST BARU
  .post("/", async (c) => {
    try {
    const body = await c.req.json();
    if (!body.customer_name || !body.reservation_id || !Array.isArray(body.reservation_id) || body.reservation_id.length === 0) {
      return c.json({ message: "Nama pelanggan dan minimal satu reservasi wajib diisi." }, 400);
    }
    
    const invoiceBaru = new Invois(body);

    await invoiceBaru.save();

    const dataLengkap = await Invois.findById(invoiceBaru._id).populate('reservation_id');

    return c.json({
      message: "Invoice berhasil dibuat",
      data: dataLengkap
    }, 201);

  } catch (error: any) {
    if (error.name === 'ValidationError') {
      return c.json({
        message: 'Validasi gagal',
        errors: error.errors
      }, 400);
    }
    
    console.error("Error saat membuat invoice:", error);
    return c.json({ message: "Terjadi kesalahan pada server" }, 500);
  }
})
    /**
     * Contoh isi body invois baru yang berisi dua reservasi:
     * {
            "customer_name": "Paksi Bayu",
            "reservationIds": [
                "665efc7e23850f12cf4f2b3d",
                "665efc8c23850f12cf4f2b3e"
            ]
        }
     */

  //   const { customer_name, reservation_id, total_amount, fee } = body;

  //   if (!reservation_id || !Array.isArray(reservation_id)) {
  //     return c.json({ error:  'Properti "reservation_id" (dalam bentuk array) wajib diisi' }, 400);
  //   }

  //   // Validasi ID-ID yang dikirim, optional tapi disarankan
  //   const existingReservations = await Reservasi.find({
  //       _id: { $in: reservation_id }
  //   });

  //   if (existingReservations.length !== reservation_id.length) {
  //       return c.json({ error: 'Beberapa reservation ID tidak ditemukan' }, 400);
  //   }

  //   // Buat invoice dengan ID-ID yang sudah dikirim
  //   const invoice = new Invois({
  //       customer_name,
  //       reservation_id,
  //       total_amount,
  //       fee
  //   });
  //   await invoice.save();

  //   return c.json(invoice, 201);
  // })
  /* GET LAMA
  .get("/", async c => {
    const list = await Invois.find().populate('reservation_id');
    return c.json({ status: "berhasil", data: list });
  })
  */

  // GET BARU
  .get('/', async (c) => {
    const invois = await Invois.find().populate('reservation_id');
    
    return c.json({
        status: "berhasil",
        messsage: "Daftar invoice berhasil diambil",
        data: invois
    });
    // Contoh isi invois berisi dua reservasi:
    /*
    [
        {
          "_id": "665ef1...",
          "customer_name": "Paksi Bayu",
          "date": "2025-06-04T14:00:00.000Z",
          "reservations": [
            {
              "_id": "665efc7e23850f12cf4f2b3d",
              "type": "flight",
              "details": {
                "from": "CGK",
                "to": "KUL"
              },
              "amount": 800000,
              "__v": 0
            },
            {
              "_id": "665efc8c23850f12cf4f2b3e",
              "type": "hotel",
              "details": {
                "name": "Hotel Bagus"
              },
              "amount": 400000,
              "__v": 0
            }
          ],
          "__v": 0
        }
      ]
    */
  })
  .get("/:id", async (c) => {
    const { id } = c.req.param();
    const data = await Invois.findById(id).populate('reservation_id');
    if (!data) return c.json({ status: "tidak ditemukan" }, 404);
    return c.json({ status: "berhasil", data });
  })
  .put("/:id", async (c) => {
    const { id } = c.req.param();
    const body = await c.req.json();

    try {
      const originalInvoice = await Invois.findById(id);
      const updatedInvoice = await Invois.findByIdAndUpdate(
        id,
        { $set: body },
        { new: true, runValidators: true }
      ).populate('reservation_id');

      if (!updatedInvoice) {
        return c.json({ status: "tidak ditemukan", message: "Invoice tidak ditemukan" }, 404);
      }

      if (originalInvoice?.status === 'Unpaid' && updatedInvoice.status === 'Paid') {
        await createReportsFromInvoice(updatedInvoice, true);
        try {
          await logInvoiceStatusChange(updatedInvoice);
        } catch (logError) {
          console.error('Gagal menyimpan log transaksi:', logError);
        }
      }

      return c.json({
        status: "berhasil",
        message: "Invoice diperbarui",
        data: updatedInvoice
      });
    } catch (error) {
      console.error("Error updating invoice:", error);
      return c.json({
        status: "gagal",
        message: "Gagal memperbarui invoice",
        error: String(error)
      }, 500);
    }
  })
  .delete("/:id", async (c) => {
    const { id } = c.req.param();
    try {
      // Cari invoice untuk mendapatkan reservation_id
      const invoice = await Invois.findById(id).populate('reservation_id');
      if (!invoice) {
        return c.json({ status: "tidak ditemukan", message: "Invoice tidak ditemukan" }, 404);
      }

      // Hapus laporan terkait
      await Laporan.deleteMany({ invoice_ref: id });
      
      // Hapus log transaksi terkait
      if (invoice.reservation_id) {
        await LogTransaksi.deleteMany({
          reference_id: invoice._id,
          reference_type: 'Invoice'
        });
      }

      // Hapus invoice
      const result = await Invois.findByIdAndDelete(id);
      if (!result) {
        return c.json({ status: "tidak ditemukan", message: "Invoice tidak ditemukan" }, 404);
      }
      
      return c.json({ status: "berhasil", message: "Invoice dihapus" });
    } catch (error) {
      console.error("Error deleting invoice:", error);
      return c.json({ 
        status: "gagal", 
        message: "Gagal menghapus invoice", 
        error: String(error) 
      }, 500);
    }
  });

export default invois;
