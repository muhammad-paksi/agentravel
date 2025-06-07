import { Hono } from 'hono';
import dbConnect from '@/database/connection/mongodb';
import pengguna from '@/routes/pengguna';
import reservasi from '@/routes/reservasi';
import pembayaran from '@/routes/pembayaran';
import invois from '@/routes/invois';
import logTransaksi from '@/routes/logTransaksi';
import laporan from '@/routes/laporan';
import custom from '@/routes/dashboard';
import { autentikasi } from '@/routes/auth';

export const runtime = 'nodejs';
await dbConnect();

const app = new Hono().basePath("/api");

app.route('', autentikasi)
app.route('/pengguna', pengguna);
app.route('/reservasi', reservasi);
app.route('/pembayaran', pembayaran);
app.route('/invois', invois);
app.route('/log-transaksi', logTransaksi);
app.route('/laporan', laporan);

app.route('', custom);
app.get('/hello', c => c.json({ message: 'Hello from Hono!' }));
app.get('/hello2', c => c.json({ message: 'Selamat datang di Hono!' }));

export const GET = app.fetch;
export const POST = app.fetch;
export const PUT = app.fetch;
export const DELETE = app.fetch;

