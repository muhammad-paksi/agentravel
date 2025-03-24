import mongoose from 'mongoose';

const penggunaSchema = new mongoose.Schema({
  nama: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true });

const customerSchema = new mongoose.Schema({
  nama: { type: String, required: true },
  kontak: { type: String, required: true },
  alamat: { type: String, required: true },
}, { timestamps: true });

const reservasiSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  tanggal: { type: Date, required: true },
  layanan: { type: String, required: true },
}, { timestamps: true });

const pembayaranSchema = new mongoose.Schema({
  reservasiId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservasi', required: true },
  jumlah: { type: Number, required: true },
  metode: { type: String, required: true },
  status: { type: String, enum: ['pending', 'berhasil', 'gagal'], default: 'pending' },
}, { timestamps: true });

const invoisSchema = new mongoose.Schema({
  pembayaranId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pembayaran', required: true },
  nomorInvois: { type: String, required: true, unique: true },
  tanggalTerbit: { type: Date, default: Date.now },
}, { timestamps: true });

const logTransaksiSchema = new mongoose.Schema({
  tipe: { type: String, required: true },
  deskripsi: { type: String, required: true },
  waktu: { type: Date, default: Date.now },
}, { timestamps: true });

const laporanSchema = new mongoose.Schema({
  periode: { type: String, required: true },
  totalTransaksi: { type: Number, required: true },
  totalPendapatan: { type: Number, required: true },
}, { timestamps: true });

export const Pengguna = mongoose.model('Pengguna', penggunaSchema);
export const Customer = mongoose.model('Customer', customerSchema);
export const Reservasi = mongoose.model('Reservasi', reservasiSchema);
export const Pembayaran = mongoose.model('Pembayaran', pembayaranSchema);
export const Invois = mongoose.model('Invois', invoisSchema);
export const LogTransaksi = mongoose.model('LogTransaksi', logTransaksiSchema);
export const Laporan = mongoose.model('Laporan', laporanSchema);
