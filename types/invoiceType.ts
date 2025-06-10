import { ReservationFormValues } from './reservationType';

// Tipe ini tidak perlu diubah
export type PaymentMethod = "Bank Transfer" | "Credit Card" | "Cash";
export type Status = "Unpaid" | "Paid";

/**
 * Representasi objek reservasi yang sudah di-populate di dalam invoice.
 * Sesuai dengan referensi 'Reservation' di skema Anda.
 */
export interface ReservationReference {
  contact: string;
  _id: string;
  ticket_id: string;
  name: string;
  destination: string;
  total_price: number;
  date: Date;
  carrier_name: string;
  hotel_name: string;
}

/**
 * [BERUBAH] Interface untuk nilai-nilai dalam form pembuatan Invoice.
 * - Mencerminkan input pengguna: customer_name dan daftar ID reservasi.
 * - Fee diatur di sini.
 */
export interface InvoiceFormValues {
  _id?: string;
  customer_name: string;
  reservation_id: string[];
  
  fee: number;
  total_amount: number;
  payment_method: PaymentMethod;
  payment_date: Date;
  issued_date: Date;
  due_date: Date;
  status: Status;
}

export interface Invoice {
  _id: string;
  customer_name: string;
  reservation_id: ReservationReference[]; 
  total_amount: number;
  fee: number;
  payment_method: PaymentMethod;
  payment_date: string;
  issued_date: string;
  due_date: string;
  status: Status;

  createdAt: string;
  updatedAt: string;
}


export interface ApiResponse<T> {
  status?: string;
  message?: string;
  data: T;
}

export type InvoiceFilters = {
  search?: string;
  status?: string;
};

export interface PagedResult<T> {
  data: T[];
  total: number;
}
