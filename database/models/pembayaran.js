import mongoose from 'mongoose';

const pembayaranSchema = new mongoose.Schema(
    {
        reservasiId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservasi', required: true },
        jumlah: { type: Number, required: true },
        metode: { type: String, required: true },
        status: { type: String, enum: ['pending', 'berhasil', 'gagal'], default: 'pending' },
    }, 
    {
        collection: "pembayaran", // Nama koleksi tetap "pembayaran"
        timestamps: true, // Menambahkan createdAt & updatedAt
    },
);
export default mongoose.models.Item || mongoose.model('pembayaran', pembayaranSchema);