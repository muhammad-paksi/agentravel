import mongoose from 'mongoose';

const logTransaksiSchema = new mongoose.Schema(
    {
        reference_id    : { type: Number, required: true },
        reference_type  : { type: String, enum: ['reservation', 'invoice'], required: true },
        action          : { type: String, required: true },
        action_date     : { type: Date, required: true },
        performed_by    : { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    }, 
    {
        collection: "log-transaksi", // Nama koleksi tetap "log-transaksi"
        timestamps: true, // Menambahkan createdAt & updatedAt
    },
);
export default mongoose.models['log-transaksi'] || mongoose.model('log-transaksi', logTransaksiSchema);