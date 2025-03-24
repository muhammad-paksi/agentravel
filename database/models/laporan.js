import mongoose from 'mongoose';

const laporanSchema = new mongoose.Schema(
    {
        amount      : { type: mongoose.Types.Decimal128, required: true },
        created_by  : { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    },
    {
        collection: "laporan", // Nama koleksi tetap "laporan"
        timestamps: true, // Menambahkan createdAt & updatedAt
    },
);
export default mongoose.models.laporan || mongoose.model('laporan', laporanSchema);