import { Hono } from 'hono';
import { Invois } from '@/database/model/all';
import { Laporan } from '@/database/model/all';

const invois = new Hono();

// Fungsi untuk membuat report otomatis dari invoice
async function createReportsFromInvoice(invoice: any, isUpdate: boolean = false) {
    console.log(`Processing invoice ${invoice._id} with status ${invoice.status}`);

    // Make sure to properly populate the reservation data
    const populatedInvoice = await Invois.findById(invoice._id)
        .populate({
            path: 'reservation_id',
            model: 'reservasi' // Make sure this matches your model name
        });

    if (!populatedInvoice) {
        console.log('Invoice not found');
        return;
    }

    const customerName = populatedInvoice.reservation_id?.name || 'pelanggan';
    
    // Cari report yang sudah ada untuk invoice ini
    const existingReports = await Laporan.find({ invoice_ref: invoice._id });
    
    // Jika invoice berstatus Paid dan belum ada report Income
    if (populatedInvoice.status === 'Paid' && !existingReports.some(r => r.type === 'Income')) {
        console.log('Creating Income report for Paid invoice');
        const incomeReport = new Laporan({
            amount: populatedInvoice.total_price || (populatedInvoice.total_amount + (populatedInvoice.fee || 0)),
            type: 'Income',
            description: `Pembayaran dari ${customerName}`,
            invoice_ref: populatedInvoice._id,
            created_by: 'system',
        });
        await incomeReport.save();
        console.log('Income report created:', incomeReport);
    }
    
    // Jika invoice berstatus Unpaid, belum ada report Expense, dan ini bukan update
    if (populatedInvoice.status === 'Unpaid' && !existingReports.some(r => r.type === 'Expense')) {
        console.log('Creating Expense report for Unpaid invoice');
        const expenseReport = new Laporan({
            amount: populatedInvoice.total_amount,
            type: 'Expense',
            description: `Pemesanan untuk ${customerName}`,
            invoice_ref: populatedInvoice._id,
            created_by: 'system',
        });
        await expenseReport.save();
        console.log('Expense report created:', expenseReport);
    }
}

invois
    .post("/", async c => {
        const body = await c.req.json();
        const baru = new Invois(body);
        await baru.save();
        
        // Populate reservation data
        const invoiceWithReservation = await Invois.findById(baru._id).populate('reservation_id');
        
        // Buat report setelah invoice dibuat (isUpdate = false)
        await createReportsFromInvoice(invoiceWithReservation || baru);
        
        return c.json({ message: "Invois dibuat", data: baru });
    })
    .get("/", async c => {
        const list = await Invois.find().populate('reservation_id');
        return c.json({ status: "berhasil", data: list });
    })
    .get("/:id", async c => {
        const { id } = c.req.param();
        const data = await Invois.findById(id).populate('reservation_id');
        if (!data) return c.json({ status: "tidak ditemukan" }, 404);
        return c.json({ status: "berhasil", data });
    })
    .put("/:id", async c => {
        const { id } = c.req.param();
        const body = await c.req.json();

        console.log("Updating invoice:", id);
        console.log("Update data:", body);
        
        try {
            const originalInvoice = await Invois.findById(id);

            // Gunakan findByIdAndUpdate untuk memperbarui dokumen secara langsung
            const updatedInvoice = await Invois.findByIdAndUpdate(
                id,
                { $set: body },
                { new: true, runValidators: true } // new: true mengembalikan dokumen yang sudah diperbarui
            ).populate('reservation_id');
            
            if (!updatedInvoice) {
                console.log("Invoice not found:", id);
                return c.json({ status: "tidak ditemukan", message: "Invoice tidak ditemukan" }, 404);
            }

            console.log("Invoice updated successfully:", updatedInvoice);

            // Cek jika status berubah dari Unpaid ke Paid
            if (originalInvoice?.status === 'Unpaid' && updatedInvoice.status === 'Paid') {
                console.log('Status changed from Unpaid to Paid - creating Income report');
                await createReportsFromInvoice(updatedInvoice, true);
            }
            
            return c.json({ status: "berhasil", message: "Invoice diperbarui", data: updatedInvoice });
        } catch (error) {
            console.error("Error updating invoice:", error);
            return c.json({ status: "gagal", message: "Gagal memperbarui invoice", error: String(error) }, 500);
        }
    })
    .delete("/:id", async c => {
        const { id } = c.req.param();
        
        try {
            // Hapus report terkait invoice ini
            await Laporan.deleteMany({ invoice_ref: id });
            
            const result = await Invois.findByIdAndDelete(id);
            if (!result) {
                return c.json({ status: "tidak ditemukan", message: "Invoice tidak ditemukan" }, 404);
            }
            return c.json({ status: "berhasil", message: "Invoice dihapus" });
        } catch (error) {
            console.error("Error deleting invoice:", error);
            return c.json({ status: "gagal", message: "Gagal menghapus invoice", error: String(error) }, 500);
        }
    });

export default invois;
