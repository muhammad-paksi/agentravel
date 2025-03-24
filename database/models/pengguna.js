import mongoose from 'mongoose';
import dbConnect from '@/database/connection/mongodb';

await dbConnect(); // Pastikan koneksi dilakukan dulu

const penggunaSchema = new mongoose.Schema(
    {
        username: { type: String, required: true },
        password: { type: String, required: true },
        role    : { type: String, enum: ['Admin Travel Agent', 'Tim Keuangan'], required: true },
    }, 
    {
        collection: "pengguna", // Nama koleksi tetap "pengguna"
        timestamps: true, // Menambahkan createdAt & updatedAt
    },
);

export default mongoose.models.pengguna || mongoose.model('pengguna', penggunaSchema);