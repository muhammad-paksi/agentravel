import { Hono } from 'hono';
import dbConnect from '@/database/connection/mongodb'; // Pastikan path benar
import User from '@/database/models/pengguna'; // Pastikan path benar

export const runtime = 'nodejs'; // Sesuaikan dengan environment
const app = new Hono().basePath("/api");

// Koneksi database hanya sekali sebelum rute dijalankan
await dbConnect();

app.get('/hello', async (c) => c.json({ message: 'Hello from Hono!' }));
app.get('/hello2', (c) => c.json({ message: 'Selamat datang di Hono!' }));

app.post("/tambahManual", async c => {
    console.log("Menambahkan data manual");
    // Query dan lain-lain
    try {
        const body = await c.req.json();
        const newUser = new User({
            nama: body.name,
            email: body.email,
            password: body.password, // Harus di-hash dalam produksi
        });

        await newUser.save();
        return c.json({ message: "Berhasil menambahkan data manual" });
    } catch (error: unknown) {
        if (error instanceof Error) {
            return c.json({ error: error.message }, 400);
          }
        return c.json({ error: String(error) }, 500);
    }
});

// Rute-rute API antara Next.js (frontend) dan Hono (backend)
/* -------------- MANAJEMEN PENGGUNA -------------- */
app.get("/pengguna", async c => {
        console.log("Mengambil data semua pengguna");
        // Query dan lain-lain
    })
    .post("/pengguna", async c => {
        console.log("Menambah data pengguna baru");
        // Query dan lain-lain
    });
    app.put("/pengguna/:id", async c => {
        console.log("Memperbarui data pengguna menurut id");
        // Query dan lain-lain
    });
    app.delete("/pengguna/:id", async c => {
        console.log("Menghapus data pengguna menurut id");
        // Query dan lain-lain
    });

/* -------------- MANAJEMEN CUSTOMER -------------- */
app.get("/customer", async c => {
        console.log("Mengambil data semua customer");
        // Query dan lain-lain
        c.json({ message: 'Hello from Hono!' });
    })
    .post("/customer", async c => {
        console.log("Menambah data customer baru");
        // Query dan lain-lain
    })
    .get("/customer/:id", async c => {
        console.log("Mengambil data customer menurut id");
        // Query dan lain-lain
    })
    .put("/customer/:id", async c => {
        console.log("Memperbarui data customer menurut id");
        // Query dan lain-lain
    })
    .delete("/customer/:id", async c => {
        console.log("Menghapus data customer menurut id");
        // Query dan lain-lain
    });

/* -------------- MANAJEMEN RESERVASI -------------- */
app.get("/reservasi", async c => {
        console.log("Mengambil data semua reservasi");
        // Query dan lain-lain
    })
    .post("/reservasi", async c => {
        console.log("Menambahkan data reservasi baru");
        // Query dan lain-lain
    })
    .get("/reservasi/:id", async c => {
        console.log("Mengambil detail reservasi menurut id");
        // Query dan lain-lain
    })
    .put("/reservasi/:id", async c => {
        console.log("Memperbarui data reservasi menurut id");
        // Query dan lain-lain
    })
    .delete("/reservasi/:id", async c => {
        console.log("Menghapus reservasi menurut id");
        // Query dan lain-lain
    });

/* -------------- MANAJEMEN PEMBAYARAN -------------- */
app.put("/pembayaran", async c => {
        console.log("Membuat pembayaran");
        // Query dan lain-lain
    })
    .post("/pembayaran/:id", async c => {
        console.log("Memperbarui data pembayaran menurut id");
        // Query dan lain-lain
    });

/* -------------- MANAJEMEN INVOIS -------------- */
app.post("/invois", async c => {
        console.log("Membuat dan mengirim invois");
        // Query dan lain-lain
    })
    .get("/invois/:id", async c => {
        console.log("Mendapatkan detail invois menurut id");
        // Query dan lain-lain
    });

/* ---------- MANAJEMEN RIWAYAT TRANSAKSI ---------- */
app.get("/log-transaksi", async c => {
        console.log("Mendapatkan daftar log transaksi");
        // Query dan lain-lain
    })
    .get("/log-transaksi/:id", async c => {
        console.log("Mendapatkan detail log transaksi menurut id");
        // Query dan lain-lain
    });

/* -------------- MANAJEMEN LAPORAN -------------- */
app.get("/laporan", async c => {
    console.log("Mendapatkan laporan");
    // Query dan lain-lain
});

// // Menangani request dari Next.js
// export default async function handler(req: Request) {
//   return app.fetch(req);
// }

// Definisikan metode HTTP sebagai named exports
export const GET = app.fetch;
export const POST = app.fetch;
export const PUT = app.fetch;
export const DELETE = app.fetch;