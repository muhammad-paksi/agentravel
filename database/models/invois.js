import mongoose from 'mongoose';

const invoisSchema = new mongoose.Schema(
    {
        reservation_id  : { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation', required: true },
        total_amount    : { type: mongoose.Types.Decimal128, required: true },
        fee             : { type: mongoose.Types.Decimal128, required: true },
        payment_method  : { type: String, enum: ['Bank Transfer', 'Credit Card', 'Cash'], required: true },
        payment_date    : { type: Date, required: true },
        issued_date     : { type: Date, required: true },
        due_date        : { type: Date, required: true },
        status          : { type: String, enum: ['Unpaid', 'Paid'], required: true },
    },
    {
        collection: "invois", // Nama koleksi tetap "invois"
        timestamps: true, // Menambahkan createdAt & updatedAt
    },
);

export default mongoose.models.invois || mongoose.model('invois', invoisSchema);