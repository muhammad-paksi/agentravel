import mongoose from 'mongoose';
// import dayjs from 'dayjs';
// import utc from 'dayjs/plugin/utc';
// import timezone from 'dayjs/plugin/timezone';

// dayjs.extend(utc);
// dayjs.extend(timezone);

const penggunaSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true },
        email   : { type: String,},
        password: { type: String, required: true },
        role    : { type: String, enum: ['Admin Travel Agent', 'Tim Keuangan'], required: true },
    }, 
    {
        collection: "pengguna", // Nama koleksi tetap "pengguna"
        timestamps: true, // Menambahkan createdAt & updatedAt
        // timestamps: {
        //     currentTime: () => dayjs().tz('Asia/Jakarta').format(), // Override default date ke Day.js
        // },
    },
);

export default mongoose.models.pengguna || mongoose.model('pengguna', penggunaSchema);