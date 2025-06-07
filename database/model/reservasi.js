import mongoose from 'mongoose';

const reservasiSchema = new mongoose.Schema(
    {
        nik              : { type: Number, required: true },
        name             : { type: String, required: true },
        contact          : { type: String, required: true },
        type             : { type: String, enum: ['flight', 'hotel', 'activity'], required: false },
        ticket_id        : { type: Number, required: true },
        destination      : { type: String, required: true },
        date             : { type: Date, required: true }, // Field lama.
        // Untuk reservasi hotel baru, gunakan checkInDate dan checkOutDate untuk hotel.
        // Untuk reservasi flight baru, gunakan departure_time dan arrival_time.
        total_persons    : { type: Number }, // Jumlah orang yang dipesan
        checkInDate      : { type: Date, required: true },
        checkOutDate     : { type: Date, required: true },
        departure_time    : { type: String, required: false }, // Format: HH:mm:ss
        departure_airport : { type: String, required: false },   
        arrival_time      : { type: String, required: false }, // Format: HH:mm:ss
        arrival_airport   : { type: String, required: false },        
        estimated_budget : { type: Number, required: true },
        total_price      : { type: Number, required: true },
        
        payment_method   : { type: String, 
                             enum: ['Prepaid', 'Postpaid'], required: true },
        
        payment_status   : { type: String,
                             enum: ['Pending', 'Paid'], required: true },
                             
        status           : { type: String, 
                             enum: ['Booked', 'Completed', 'Canceled'], required: true },

        admin_id         : { type: String, // type: mongoose.Schema.Types.ObjectId, 
                             /* ref: 'User', */ required: true },
    },
    {
        collection: "reservasi", // Nama koleksi tetap "reservasi"
        timestamps: true, // Menambahkan createdAt & updatedAt
    },
);
export default mongoose.models.reservasi || mongoose.model('reservasi', reservasiSchema);