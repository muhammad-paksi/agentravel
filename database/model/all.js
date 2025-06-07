import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    userId    : { type: String, required: true},
    expiredAt : { type: Date, required: true },
  },
  { collection: "session", /* timestamps: true */ }
);

const penggunaSchema = new mongoose.Schema(
  {
    username  : { type: String, required: true, unique: true },
    email     : { type: String },
    password  : { type: String, required: true },
    role      : { type: String, enum: ['Admin Travel Agent', 'Tim Keuangan'], required: true },
  },
  { collection: "pengguna", timestamps: true }
);

const reservasiSchema = new mongoose.Schema(
  {
    nik              : { type: Number, required: true },
    name             : { type: String, required: true },
    contact          : { type: String, required: true },
    ticket_id        : { type: Number, required: true },
    destination      : { type: String, required: true },
    date             : { type: Date, required: true },
    estimated_budget : { type: Number, required: true },
    total_price      : { type: Number, required: true },
    payment_method   : { type: String, enum: ['Prepaid', 'Postpaid'], required: true },
    payment_status   : { type: String, enum: ['Pending', 'Paid'], required: true },
    status           : { type: String, enum: ['Booked', 'Completed', 'Canceled'], required: true },
    admin_id         : { type: String, required: true },
  },
  { collection: "reservasi", timestamps: true }
);

const pembayaranSchema = new mongoose.Schema(
  {
    reservasiId : { type: /* String */ mongoose.Schema.Types.ObjectId, ref: 'Reservasi', required: true },
    jumlah      : { type: Number, required: true },
    metode      : { type: String, required: true },
    status      : { type: String, enum: ['pending', 'berhasil', 'gagal'], default: 'pending' },
  },
  { collection: "pembayaran", timestamps: true }
);

const invoisSchema = new mongoose.Schema(
  {
    reservation_id : { type: String, required: true },
    total_amount   : { type: Number/* mongoose.Types.Decimal128 */, required: true },
    fee            : { type: Number/* mongoose.Types.Decimal128 */, required: true },
    payment_method : { type: String, enum: ['Bank Transfer', 'Credit Card', 'Cash'], required: true },
    payment_date   : { type: Date, required: true },
    issued_date    : { type: Date, required: true },
    due_date       : { type: Date, required: true },
    status         : { type: String, enum: ['Unpaid', 'Paid'], required: true },
  },
  { collection: "invois", timestamps: true }
);

const logTransaksiSchema = new mongoose.Schema(
  {
    reference_id    : { type: Number, required: true },
    reference_type  : { type: String, enum: ['Reservation', 'Invoice'], required: true },
    date            : { type: Date, required: true },
    description     : { type: String, required: true },
    actor           : { type: String, enum: ['Finance Admin', 'Travel Admin'], required: true },
  },
  { collection: "log-transaksi", timestamps: true }
);

const laporanSchema = new mongoose.Schema(
  {
    amount      : { type: Number, required: true },
    type        : { type: String, enum: ['Income', 'Expense'], required: true },
    description : { type: String, required: true },
    invoice_ref : { type: mongoose.Schema.Types.ObjectId, ref: 'invois' },
    created_by  : { type: String, ref: 'User', required: true },
  },
  { collection: "laporan", timestamps: true }
);

export const Pengguna = mongoose.models.pengguna || mongoose.model('pengguna', penggunaSchema);
export const Session = mongoose.models.pengguna || mongoose.model('session', sessionSchema);
// export const Customer = mongoose.model('Customer', customerSchema);
export const Reservasi = mongoose.models.reservasi || mongoose.model('reservasi', reservasiSchema);
export const Pembayaran = mongoose.models.pembayaran || mongoose.model('pembayaran', pembayaranSchema);
export const Invois = mongoose.models.invois || mongoose.model('invois', invoisSchema);
export const LogTransaksi = mongoose.models.logTransaksi || mongoose.model('logTransaksi', logTransaksiSchema);
export const Laporan = mongoose.models.laporan || mongoose.model('laporan', laporanSchema);
