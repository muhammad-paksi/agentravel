import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
    {
        nama: { type: String, required: true },
        kontak: { type: String, required: true },
        alamat: { type: String, required: true },
    }, 
    {
        collection: "customer", // Nama koleksi tetap "customer"
        timestamps: true, // Menambahkan createdAt & updatedAt
    },
);
export default mongoose.models.customer || mongoose.model('customer', customerSchema);