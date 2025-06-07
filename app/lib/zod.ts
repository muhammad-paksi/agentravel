import { object, string, coerce, union } from "zod"

export const signInSchema = object({
  email: string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email"),
  password: string({ required_error: "Password is required" })
    .min(1, "Password is required")
    .min(8, "Password must be more than 8 characters")
    .max(32, "Password must be less than 32 characters"),
})

export const reservationSchema = object({
  nik: coerce
    .number({ invalid_type_error: "NIK harus berupa angka" })
    .min(1, "NIK wajib diisi")
    .max(17, "NIK terlalu panjang"),
  name: string()
    .min(1, "Nama pelanggan wajib diisi")
    .max(50, "Nama terlalu panjang"),
  contact: union([
    // regex +62 diikuti digit (minimal 8 digit misal)
    string().regex(/^\+62\d{8,}$/, {
      message: "Contact harus berupa nomor telepon dengan awalan +62",
    }),
    // email valid
    string().email({ message: "Contact harus berupa email yang valid" }),
  ]),
  ticket_id: coerce
    .number({ invalid_type_error: "Ticket ID harus berupa angka" })
    .min(1, "Ticket ID wajib diisi"),
  destination: string()
    .min(1, "Destination wajib diisi")
    .max(50, "Destination terlalu panjang"),
  date: coerce
    .date({ invalid_type_error: "Tanggal tidak valid" })
    .refine((d) => !isNaN(d.getTime()), "Tanggal wajib diisi"),
  estimated_budget: coerce
    .number({ invalid_type_error: "Estimated Budget harus angka" })
    .min(0, "Estimated Budget tidak boleh negatif"),
  total_price: coerce
    .number({ invalid_type_error: "Total Price harus angka" })
    .min(0, "Total Price tidak boleh negatif"),
  admin_id: string().min(1, "Admin ID wajib diisi"),
});

export type ReservationInput = typeof reservationSchema._input;
export type Reservation = typeof reservationSchema._output;
