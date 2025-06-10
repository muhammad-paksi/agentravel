import { ReservationFormValues, ApiResponse, Options, PagedResult, ReservationFilters } from "@/types/reservationType";

const BASE_URL = "/api/reservasi";

const buildFilterParams = (filters: Partial<Options & ReservationFilters>): URLSearchParams => {
  const params = new URLSearchParams();

  if (filters.page) params.append("page", filters.page.toString());
  if (filters.limit) params.append("limit", filters.limit.toString());
  if (filters.search) params.append("search", filters.search);
  if (filters.status) params.append("status", filters.status);
  if (filters.payment_status) params.append("payment_status", filters.payment_status);
  if ((filters as any).type) params.append("type", (filters as any).type);
  if ((filters as any).transport_type) params.append("transport_type", (filters as any).transport_type);

  return params;
};

export async function getAllReservations(filters: ReservationFilters): Promise<ReservationFormValues[]> {
  const params = buildFilterParams(filters);
  const res = await fetch(`${BASE_URL}?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch reservations: ${res.statusText}`);
  }
  const json: ApiResponse<ReservationFormValues[]> = await res.json();
  return json.data;
}

export async function getReservation(id: string): Promise<ReservationFormValues> {
  const res = await fetch(`${BASE_URL}/${id}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch reservation ${id}: ${res.statusText}`);
  }
  const json: ApiResponse<ReservationFormValues> = await res.json();
  return json.data;
}

export async function addReservation(payload: ReservationFormValues): Promise<ReservationFormValues> {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const contentType = res.headers.get("content-type");
    let message = "Gagal membuat reservasi";

    if (contentType?.includes("application/json")) {
      const err = await res.json();
      message = err.message || message;
    } else {
      message = await res.text() || message;
    }
    throw new Error(message);
  }

  const json: ApiResponse<ReservationFormValues> = await res.json();
  return json.data;
}

export async function updateReservation(id: string, payload: Partial<ReservationFormValues>): Promise<ReservationFormValues> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  
  if (!res.ok) {
    const contentType = res.headers.get("content-type");
    let message = `Gagal memperbarui reservasi ${id}`;

    if (contentType?.includes("application/json")) {
      const err = await res.json();
      message = err.message || message;
    } else {
      message = await res.text() || message;
    }
    throw new Error(message);
  }

  const json: ApiResponse<ReservationFormValues> = await res.json();
  return json.data;
}


export async function deleteReservation(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || `Failed to delete reservation ${id}`);
  }
}

export async function listReservations(opts: Options = {}): Promise<PagedResult<ReservationFormValues>> {
  const params = buildFilterParams(opts);
  const res = await fetch(`${BASE_URL}?${params.toString()}`);

  if (!res.ok) {
    throw new Error("Failed to fetch reservations");
  }
  const json = await res.json() as { data: ReservationFormValues[]; total: number };
  return { data: json.data, total: json.total };
}

