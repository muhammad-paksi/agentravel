import mongoose from 'mongoose';

const logTransaksiSchema = new mongoose.Schema(
    {
        reference_id    : { type: Number, required: true },
        reference_type  : { type: String, enum: ['Reservation', 'Invoice'], required: true },
        date            : { type: Date, required: true },
        description     : { type: String, required: true },
        actor           : { type: String, enum: ['Finance Admin', 'Travel Admin'], required: true },

    }, 
    {
        collection: "log-transaksi", // Nama koleksi tetap "log-transaksi"
        timestamps: true, // Menambahkan createdAt & updatedAt
    },
);
export default mongoose.models['log-transaksi'] || mongoose.model('log-transaksi', logTransaksiSchema);