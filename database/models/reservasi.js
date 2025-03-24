import mongoose from 'mongoose';

const reservasiSchema = new mongoose.Schema(
    {
        nik              : { type: Number, required: true },
        name             : { type: String, required: true },
        contact          : { type: String, required: true },
        ticket_id        : { type: Number, required: true },
        destination      : { type: String, required: true },
        date             : { type: Date, required: true },
        
        estimated_budget : { type: mongoose.Types.Decimal128, required: true },
        total_price      : { type: mongoose.Types.Decimal128, required: true },
        
        payment_method   : { type: String, 
                             enum: ['Prepaid', 'Postpaid'], required: true },
        
        payment_status   : { type: String,
                             enum: ['Pending', 'Paid'], required: true },
                             
        status           : { type: String, 
                             enum: ['Booked', 'Completed', 'Cancelled'], required: true },

        admin_id         : { type: mongoose.Schema.Types.ObjectId, 
                             ref: 'User', required: true },
    },
    {
        collection: "reservasi", // Nama koleksi tetap "reservasi"
        timestamps: true, // Menambahkan createdAt & updatedAt
    },
);
export default mongoose.models.reservasi || mongoose.model('reservasi', reservasiSchema);