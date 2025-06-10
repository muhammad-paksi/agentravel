import mongoose from 'mongoose';

const reservasiSchema = new mongoose.Schema(
    {
        nik              : { type: Number, required: true },
        name             : { type: String, required: true },
        contact          : { type: String, required: true },
        type             : { type: String, enum: ['flight', 'hotel', 'activity'], required: false },
        ticket_id        : { type: Number, required: true },
        destination      : { type: String, required: true },
        departure_date   : { type: Date, required: true },
        transport_type   : { type: String, enum: ['Plane', 'Ship', 'Train', 'Bus'], required: true},
        carrier_name     : { type: String, required: true },
        ticket_price     : { type: Number, required: true },
        // 5 variabel dibawah untuk menambah reservasi untuk hotel juga jika iya setuju, jika tidak maka disable
        total_persons    : { type: Number }, // Jumlah orang yang dipesan
        checkInDate      : { type: Date, required: false },       
        estimated_budget : { type: Number, required: false },
        hotel_name       : { type: String, required: false },
        room_price       : { type: Number, required: false },
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