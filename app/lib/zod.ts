import { object, string, coerce, union, z } from "zod";

export const signInSchema = object({
  email: string({ required_error: "Email is required" }).min(1, "Email is required").email("Invalid email"),
  password: string({ required_error: "Password is required" }).min(1, "Password is required").min(8, "Password must be more than 8 characters").max(32, "Password must be less than 32 characters"),
});

// Updated reservation schema to match the new Mongoose schema
export const reservationSchema = object({
  // --- Customer Information ---
  nik: coerce
    .number({ required_error: "NIK wajib diisi", invalid_type_error: "NIK harus berupa angka" })
    .refine((val) => val > 0, "NIK wajib diisi")
    .refine((val) => val.toString().length === 16, "NIK harus terdiri dari 16 digit"),
  name: string().min(1, "Nama pelanggan wajib diisi").max(50, "Nama terlalu panjang"),
  contact: union([
    string().regex(/^\+62\d{8,12}$/, { message: "Format nomor telepon tidak valid (contoh: +628123456789)" }),
    string().email({ message: "Format email tidak valid" }),
  ], { required_error: "Kontak wajib diisi" }),

  // --- Reservation & Transport Information ---
  type: z.enum(['flight', 'hotel', 'activity']).optional(),
  ticket_id: coerce.number({ invalid_type_error: "Ticket ID harus berupa angka" }).min(1, "Ticket ID wajib diisi"),
  destination: string().min(1, "Destinasi wajib diisi").max(50, "Destinasi terlalu panjang"),
  departure_date: coerce.date({ required_error: "Tanggal keberangkatan wajib diisi", invalid_type_error: "Format tanggal tidak valid" }),
  transport_type: z.enum(['Plane', 'Ship', 'Train', 'Bus'], { required_error: "Tipe transportasi wajib diisi" }),
  carrier_name: string().min(1, "Nama maskapai/operator wajib diisi"),
  
  // --- Hotel Information (Optional) ---
  total_persons: coerce.number({ invalid_type_error: "Jumlah orang harus angka" }).optional(),
  checkInDate: coerce.date({ invalid_type_error: "Format tanggal check-in tidak valid" }).optional(),
  hotel_name: string().max(100, "Nama hotel terlalu panjang").optional(),
  room_price: coerce.number({ invalid_type_error: "Harga kamar harus angka" }).optional(),

  // --- Financials ---
  ticket_price: coerce.number({ required_error: "Harga tiket wajib diisi", invalid_type_error: "Harga tiket harus angka" }).min(0),
  estimated_budget: coerce.number({ invalid_type_error: "Estimasi budget harus angka" }).min(0).optional(),
  total_price: coerce.number({ invalid_type_error: "Total harga harus angka" }).min(0, "Total harga tidak boleh negatif"),

  // --- Status & Payment ---
  payment_method: z.enum(['Prepaid', 'Postpaid'], { required_error: "Metode pembayaran wajib diisi" }),
  payment_status: z.enum(['Pending', 'Paid'], { required_error: "Status pembayaran wajib diisi" }),
  status: z.enum(['Booked', 'Completed', 'Canceled'], { required_error: "Status reservasi wajib diisi" }),

  // --- Admin ---
  admin_id: string().min(1, "Admin ID wajib diisi"),
});


// Export types derived from the schema for type safety
export type ReservationInput = z.input<typeof reservationSchema>;
export type ReservationOutput = z.output<typeof reservationSchema>;
