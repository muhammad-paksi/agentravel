export type ReservationType = "flight" | "hotel" | "activity";
export type TransportType = "Plane" | "Ship" | "Train" | "Bus";
export type PaymentMethod = "Prepaid" | "Postpaid";
export type PaymentStatus = "Pending" | "Paid";
export type ReservationStatus = "Booked" | "Completed" | "Canceled";

export interface ReservationFormValues {
  // Personal & Contact Information
  nik: number;
  name: string;
  contact: string;

  // Reservation Type
  type: ReservationType;

  // Ticket & Transport Details
  ticket_id: number;
  destination: string;
  departure_date: Date;
  transport_type: TransportType;
  carrier_name: string;
  ticket_price: number;
  
  // Optional Hotel Details
  total_persons?: number;
  checkInDate?: Date;
  hotel_name?: string;
  room_price?: number;

  // Financials
  estimated_budget?: number; // Now optional
  total_price: number; // Will be calculated (ticket_price + room_price)

  // Status & Payment
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  status: ReservationStatus;

  // Admin & System
  admin_id: string;
  readonly _id?: string;
}

// Standard API Response structure
export interface ApiResponse<T> {
  status?: string;
  message?: string;
  data: T;
}

// Filters for fetching reservation data
export type ReservationFilters = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  payment_status?: string;
};

// Options for hooks or services
export interface Options {
  id?: string;
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  payment_status?: string;
  initialValues?: Partial<ReservationFormValues>;
}

// Structure for paginated results
export interface PagedResult<T> {
  data: T[];
  total: number;
}
