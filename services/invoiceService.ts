import { InvoiceFormValues, ApiResponse, Options, InvoiceFilters, PagedResult, Invoice, ReservationReference } from '@/types/invoiceType';
import { ReservationFormValues } from '@/types/reservationType';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { generateInvoiceHtml } from '@/lib/invoiceTemplate';

const BASE_URL = '/api/invois';

export async function getAllInvoice(filters: InvoiceFilters): Promise<Invoice[]> {
    const params = new URLSearchParams();
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.search) params.append("search", filters.search);
    if (filters.status) params.append("status", filters.status);
    if (filters.reservation_id) params.append("reservation_id", filters.reservation_id);
    
    const res = await fetch(`${BASE_URL}?${params.toString()}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch invoices: ${res.statusText}`);
    }
    const json: ApiResponse<Invoice[]> = await res.json();
    return json.data;
}

export async function getInvoice(id: string): Promise<Invoice> {
    console.log("Fetching invoice with ID:", id);
    
    try {
      // Add include_reservation=true to get the full reservation data
      const res = await fetch(`${BASE_URL}/${id}?include_reservation=true`);
      
      console.log("Response status:", res.status, res.statusText);
      
      if (!res.ok) {
        console.error("Failed to fetch invoice:", res.status, res.statusText);
        throw new Error(`Failed to fetch invoice ${id}: ${res.statusText}`);
      }
      
      const jsonText = await res.text();
      console.log("Raw response:", jsonText);
      
      try {
        const json = JSON.parse(jsonText) as ApiResponse<Invoice>;
        console.log("Parsed response:", json);
        
        if (!json.data) {
          console.error("No data in response");
          throw new Error("No data returned from API");
        }
        
        // Map the invoice data to include total_price = total_amount + fee
        const invoice = json.data;
        invoice.total_price = (invoice.total_amount || 0) + (invoice.fee || 0);

        // Ensure reservation_ref fields are present
        if (!invoice.reservation_ref && invoice.reservation) {
        invoice.reservation_ref = {
          _id: invoice.reservation._id || '',
          ticket_id: invoice.reservation.ticket_id?.toString() || '',
          name: invoice.reservation.name || '',
          destination: invoice.reservation.destination || '',
          contact: invoice.reservation.contact || '',
        };
        }

        return invoice;
      } catch (parseError) {
        console.error("Error parsing JSON:", parseError);
        throw new Error(`Failed to parse response: ${parseError}`);
      }
    } catch (fetchError) {
      console.error("Fetch error:", fetchError);
      throw fetchError;
    }
  }  

export async function getReservationDetails(reservationId: string): Promise<ReservationFormValues> {
    const res = await fetch(`/api/reservasi/${reservationId}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch reservation ${reservationId}: ${res.statusText}`);
    }
    const json: ApiResponse<ReservationFormValues> = await res.json();
    return json.data;
}

export async function addInvoice(payload: InvoiceFormValues): Promise<Invoice> {
    // Remove reservation_ref before sending to API
    const { reservation_ref, ...apiPayload } = payload;
    
    const res = await fetch("/api/invois", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(apiPayload),
    });
  
    const contentType = res.headers.get("content-type");
  
    if (!res.ok) {
      let message = "Gagal membuat invoice";
  
      if (contentType?.includes("application/json")) {
        const err = await res.json();
        message = err.message || message;
      } else {
        const text = await res.text();
        message = text || message;
      }
  
      throw new Error(message);
    }
  
    const json: ApiResponse<Invoice> = await res.json();
    return json.data;
}

export async function updateInvoice(
    id: string,
    payload: Partial<InvoiceFormValues>
  ): Promise<Invoice> {
    console.log("Updating invoice with ID:", id);
    console.log("Update payload:", payload);
    
    // Remove reservation_ref before sending to API
    const { reservation_ref, ...apiPayload } = payload;
    
    // Format dates as ISO strings for API
    const formattedPayload = {
      ...apiPayload,
      payment_date: apiPayload.payment_date instanceof Date ? apiPayload.payment_date.toISOString() : apiPayload.payment_date,
      issued_date: apiPayload.issued_date instanceof Date ? apiPayload.issued_date.toISOString() : apiPayload.issued_date,
      due_date: apiPayload.due_date instanceof Date ? apiPayload.due_date.toISOString() : apiPayload.due_date,
    };
    
    console.log("Formatted payload:", formattedPayload);
    
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formattedPayload),
      // Add cache: 'no-store' to prevent caching
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error("Update failed:", res.status, res.statusText);
      
      let message = `Gagal memperbarui invoice ${id}`;
      try {
        const errorData = await res.json();
        message = errorData.message || message;
        console.error("Error response:", errorData);
      } catch (e) {
        const text = await res.text();
        message = text || message;
        console.error("Error text:", text);
      }

      throw new Error(message);
    }

    const json: ApiResponse<Invoice> = await res.json();
    console.log("Update successful:", json.data);
    return json.data;
}

export async function deleteInvoice(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || `Failed to delete invoice ${id}`);
    }
}

export async function listInvoices(opts: Options = {}): Promise<PagedResult<Invoice>> {
    const params = new URLSearchParams();
    if (opts.page) params.append("page", opts.page.toString());
    if (opts.limit) params.append("limit", opts.limit.toString());
    if (opts.search) params.append("search", opts.search);
    if (opts.status) params.append("status", opts.status);
    if (opts.reservation_id) params.append("reservation_id", opts.reservation_id);
  
    const res = await fetch(`/api/invois?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch invoices");
    const json = await res.json() as { data: Invoice[]; total: number };
    // Map total_price for each invoice
    json.data.forEach(inv => {
      inv.total_price = (inv.total_amount || 0) + (inv.fee || 0);
      if (!inv.reservation_ref && inv.reservation) {
        inv.reservation_ref = {
          _id: inv.reservation._id || '',
          ticket_id: inv.reservation.ticket_id?.toString() || '',
          name: inv.reservation.name || '',
          destination: inv.reservation.destination || '',
          contact: inv.reservation.contact || '',
        };
      }
    });
    return { data: json.data, total: json.total };
}

// Helper function to create an invoice from a reservation
export async function createInvoiceFromReservation(
  reservationId: string, 
  invoiceData: Partial<InvoiceFormValues>
): Promise<Invoice> {
  // First, get the reservation details
  const reservation = await getReservationDetails(reservationId);
  
  // Create the invoice with data from the reservation
  const invoicePayload: InvoiceFormValues = {
    reservation_id: reservationId,
    reservation_ref: {
      _id: reservationId || '',
      ticket_id: reservation.ticket_id.toString(),
      name: reservation.name,
      destination: reservation.destination,
      contact: reservation.contact
    },
    total_amount: reservation.total_price,
    fee: invoiceData.fee || 0,
    payment_method: invoiceData.payment_method || "Bank Transfer",
    payment_date: invoiceData.payment_date || new Date(),
    issued_date: invoiceData.issued_date || new Date(),
    due_date: invoiceData.due_date || new Date(),
    status: invoiceData.status || "Unpaid"
  };
  
  return addInvoice(invoicePayload);
}

export async function exportBulkPdf(invoiceIds: string[]) {
  const pdf = new jsPDF({ unit: 'mm', format: 'a5' });
  for (let i = 0; i < invoiceIds.length; i++) {
    const id = invoiceIds[i];
    const data = await getInvoice(id);
    if (!data) continue;

    // Create offscreen iframe to render HTML & CSS
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.top = '-10000px';
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow?.document;
    if (!doc) continue;
    doc.open();
    doc.write(generateInvoiceHtml(data));
    doc.close();

    // Wait for styles to apply
    await new Promise(res => setTimeout(res, 500));
    const canvas = await html2canvas(doc.body, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const w = pdf.internal.pageSize.getWidth();
    const h = (canvas.height * w) / canvas.width;
    if (i > 0) pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, 0, w, h);

    document.body.removeChild(iframe);
  }
  const blobUrl = pdf.output('bloburl');
  window.open(blobUrl, '_blank');
}