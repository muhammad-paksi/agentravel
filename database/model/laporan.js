import mongoose from 'mongoose';

const laporanSchema = new mongoose.Schema(
    {
        amount      : { type: Number, required: true },
        type        : { type: String, enum: ['Income', 'Expense'], required: true },
        description : { type: String, required: true },
        invoice_ref : { type: mongoose.Schema.Types.ObjectId, ref: 'invois' },
        created_by  : { type: String /* mongoose.Schema.Types.ObjectId */, ref: 'User', required: true },
    },
    {
        collection: "laporan", // Nama koleksi tetap "laporan"
        timestamps: true, // Menambahkan createdAt & updatedAt
    },
);
export default mongoose.models.laporan || mongoose.model('laporan', laporanSchema);