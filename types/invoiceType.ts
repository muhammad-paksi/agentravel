import { ReservationFormValues } from './reservationType';

export type PaymentMethod = "Bank Transfer" | "Credit Card" | "Cash";
export type Status = "Unpaid" | "Paid";

export interface ReservationReference {
  _id: string;
  ticket_id: string;
  name: string;
  destination: string;
  contact: string;
}


export interface InvoiceFormValues {
    reservation_id: string;
    reservation_ref?: Partial<ReservationReference>;
    reservation?: ReservationFormValues;
    total_amount: number;
    fee: number;
    payment_method: PaymentMethod
    payment_date: Date;
    issued_date: Date;
    due_date: Date;
    status: Status;

    readonly _id?: string;
}

export interface Invoice extends InvoiceFormValues {
  _id: string;
  createdAt: string;
  updatedAt: string;
  /** Populated reservation object from the API */
  
  total_price?: number; // Added total_price as optional
}

export interface ApiResponse<T> {
  status?: string;
  message?: string;
  data: T;
}

export type InvoiceFilters = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  payment_date?: string;
  reservation_id?: string;
};

export interface Options {
  id?: string;
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  reservation_id?: string;
  initialValues?: Partial<InvoiceFormValues>;
}

export interface PagedResult<T> {
  data: T[];
  total: number;
}
