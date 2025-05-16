import mongoose from 'mongoose';
import Pengguna from '@/database/model/pengguna';
import Customer from '@/database/model/customer';
import Reservasi  from '@/database/model/reservasi';
import Pembayaran from '@/database/model/pembayaran';
import Invois from '@/database/model/invois';
import Laporan from '@/database/model/laporan';
import LogTransaksi from '@/database/model/log-transaksi';

const sessionSchema = new mongoose.Schema(
  {
    userId    : { type: String, required: true},
    expiredAt : { type: Date, required: true },
  },
  { collection: "session", /* timestamps: true */ }
);

export { Pengguna, Customer, Reservasi, Pembayaran, Invois, Laporan, LogTransaksi };
// export const Session = mongoose.models.session || mongoose.model('session', sessionSchema);