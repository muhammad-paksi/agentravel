import mongoose from 'mongoose';

const invoisSchema = new mongoose.Schema(
    {
        reservation_id  : [
            { type: /* String */ mongoose.Schema.Types.ObjectId, 
                ref: 'reservasi' , 
                required: true
            }],
        customer_name   : { type: String, required: false },
        total_amount    : { type: Number/* mongoose.Types.Decimal128 */, required: true },
        fee             : { type: Number/* mongoose.Types.Decimal128 */, required: true },
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