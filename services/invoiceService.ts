import { InvoiceFormValues, ApiResponse, Options, InvoiceFilters, PagedResult, Invoice, ReservationReference } from '@/types/invoiceType';
import { ReservationFormValues } from '@/types/reservationType';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
        
        // --- PERBAIKAN DIMULAI DI SINI ---
            // Jika data `reservation` tidak ada, tapi `reservation_id` ada,
            // panggil API untuk mendapatkan detail reservasi secara eksplisit.
            if (!invoice.reservation && invoice.reservation_id) {
              console.log(`Reservation object not included. Fetching details for reservation ID: ${invoice.reservation_id}`);
              try {
                  // Gunakan fungsi helper yang sudah ada untuk mengambil detail reservasi
                  const reservationDetails = await getReservationDetails(invoice.reservation_id);
                  // Lampirkan detail yang didapat ke objek invoice utama
                  invoice.reservation = reservationDetails;
              } catch (error) {
                  console.error(`Could not fetch details for reservation ${invoice.reservation_id}:`, error);
                  // Lanjutkan tanpa menampilkan error, agar PDF tetap bisa dibuat (meskipun dengan data N/A)
              }
          }
          // --- AKHIR DARI PERBAIKAN ---

          // Pastikan field reservation_ref ada jika objek reservation tersedia
          if (!invoice.reservation_ref && invoice.reservation) {
              console.log("Populating reservation_ref from reservation object for invoice:", invoice._id);
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
    //     if (!invoice.reservation_ref && invoice.reservation) {
    //     invoice.reservation_ref = {
    //       _id: invoice.reservation._id || '',
    //       ticket_id: invoice.reservation.ticket_id?.toString() || '',
    //       name: invoice.reservation.name || '',
    //       destination: invoice.reservation.destination || '',
    //       contact: invoice.reservation.contact || '',
    //     };
    //     }

    //     return invoice;
    //   } catch (parseError) {
    //     console.error("Error parsing JSON:", parseError);
    //     throw new Error(`Failed to parse response: ${parseError}`);
    //   }
    // } catch (fetchError) {
    //   console.error("Fetch error:", fetchError);
    //   throw fetchError;
    // }
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

function numberToWords(n: number): string {
  if (isNaN(n)) return 'Bukan angka';

  const num = Math.round(n);
  if (num === 0) return 'nol';

  if (num > Number.MAX_SAFE_INTEGER) {
      console.warn('Angka terlalu besar untuk konversi yang akurat, hasilnya mungkin tidak tepat.');
      return num.toLocaleString('id-ID'); 
  }

  const satuan = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan'];

  const terbilang = (currentNum: number): string => {
      if (currentNum === 0) return '';
      
      if (currentNum < 12) {
          if (currentNum === 10) return 'sepuluh';
          if (currentNum === 11) return 'sebelas';
          return satuan[currentNum];
      }
      if (currentNum < 20) {
          return satuan[currentNum - 10] + ' belas';
      }
      if (currentNum < 100) {
          const sisa = currentNum % 10;
          return satuan[Math.floor(currentNum / 10)] + ' puluh' + (sisa > 0 ? ' ' + satuan[sisa] : '');
      }
      if (currentNum < 200) {
          const sisa = currentNum % 100;
          return 'seratus' + (sisa > 0 ? ' ' + terbilang(sisa) : '');
      }
      if (currentNum < 1000) {
          const sisa = currentNum % 100;
          return satuan[Math.floor(currentNum / 100)] + ' ratus' + (sisa > 0 ? ' ' + terbilang(sisa) : '');
      }
      if (currentNum < 2000) {
          const sisa = currentNum % 1000;
          return 'seribu' + (sisa > 0 ? ' ' + terbilang(sisa) : '');
      }
      if (currentNum < 1000000) {
          const sisa = currentNum % 1000;
          return terbilang(Math.floor(currentNum / 1000)) + ' ribu' + (sisa > 0 ? ' ' + terbilang(sisa) : '');
      }
      if (currentNum < 1000000000) {
          const sisa = currentNum % 1000000;
          return terbilang(Math.floor(currentNum / 1000000)) + ' juta' + (sisa > 0 ? ' ' + terbilang(sisa) : '');
      }
      if (currentNum < 1000000000000) {
          const sisa = currentNum % 1000000000;
          return terbilang(Math.floor(currentNum / 1000000000)) + ' miliar' + (sisa > 0 ? ' ' + terbilang(sisa) : '');
      }
      const sisa = currentNum % 1000000000000;
      return terbilang(Math.floor(currentNum / 1000000000000)) + ' triliun' + (sisa > 0 ? ' ' + terbilang(sisa) : '');
  };
  
  const result = terbilang(num);
  return result.replace(/\s\s+/g, ' ').trim();
}

export async function exportBulkPdf(ids: string[]): Promise<void> {
  if (!ids?.length) throw new Error('No invoice IDs provided');

  try {
    // 1) Fetch all invoices
    const invoices: Invoice[] = await Promise.all(ids.map(id => getInvoice(id)));

    if (invoices.length === 0) {
      throw new Error('No invoices found');
    }

    // 2) Init jsPDF
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });

    invoices.forEach((invoice, idx) => {
      if (idx > 0) doc.addPage();

      const leftMargin = 40;
      const rightMargin = 30;
      const contentWidth = doc.internal.pageSize.getWidth() - leftMargin - rightMargin;
      const rightColX = 350;

      // — HEADER: logo + title + company info
      doc.setFontSize(22).setFont('helvetica', 'bold').text('INVOICE', leftMargin, 50);
      const detailY=90;
      // — BILL TO
      doc.setFontSize(11).setFont('helvetica', 'bold').text('Bill to:', leftMargin, detailY);
      doc.setFont('helvetica', 'normal').setFontSize(10);
      
      doc.text(`Name     : ${invoice.reservation_ref?.name || 'N/A'}`, leftMargin, detailY + 15);
      doc.text(`Contact  : ${invoice.reservation_ref?.contact || 'N/A'}`, leftMargin, detailY + 30);
      doc.text(`Destination : ${invoice.reservation_ref?.destination || 'N/A'}`, leftMargin, detailY + 45);
      doc.text(`Ticket ID: ${invoice.reservation_ref?.ticket_id || 'N/A'}`, leftMargin, detailY + 60);
      
      const infoY = detailY - 70;
      try {
        // Try to add logo - handle gracefully if it fails
        doc.addImage('/img/logo-karisma.jpg', 'JPEG', doc.internal.pageSize.getWidth() - rightMargin - 120, 20, 100, 70);
      } catch (logoError) {
        console.warn('Could not load logo:', logoError);
        // Continue without logo
      }
      doc.setFontSize(10).setFont('helvetica', 'bold');
      doc.text('KARISMA TOUR AND TRAVEL', rightColX - 80 , infoY + 30);
      doc.setFontSize(10).setFont('helvetica', 'normal');
      doc.text('Perum Grand Soeroso Kav 24 Malang', rightColX - 80, infoY + 45);
      doc.text('081217369484', rightColX - 80, infoY + 60);
      doc.text('karisma.travel@yahoo.co.id', rightColX - 80, infoY + 75);
      
      doc.setFontSize(10).setFont('helvetica', 'normal');
      const issuedDate = invoice.issued_date ? new Date(invoice.issued_date).toLocaleDateString('id-ID') : 'N/A';
      // const dueDate = invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('id-ID') : 'N/A';
      
      // doc.text(`Issued: ${issuedDate}`, 40, 100);
      // doc.text(`Due: ${dueDate}`, 40, 115);
      // doc.text(`Status: ${invoice.status || 'N/A'}`, 300, 100);
      // doc.text(`Payment Method: ${invoice.payment_method || 'N/A'}`, 300, 115);

      
      // — TABLE - Create a simple invoice table based on available invoice data
      const startY = 240;
      
      // Create table data based on invoice properties (not items array)
      const tableBody = [[
        issuedDate,
        invoice.reservation_ref?.destination || 'Travel Service', // Sementara menggunakan data destination, nanti di update dgn field tipe travel
        invoice.reservation_ref?.destination || 'N/A',
        invoice.reservation_ref?.name || 'N/A',
        (invoice.total_amount || 0).toLocaleString('id-ID'),
        (invoice.total_amount || 0).toLocaleString('id-ID')
      ]];

      autoTable(doc, {
        startY,
        theme: 'grid',
        head: [[
          'Date', 'Remark', 'Route',
          'Pax Name', 'Price / Pack', 'Total'
        ]],
        body: tableBody,
        styles: { fontSize: 9, cellPadding: 4 },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 80 },
          2: { cellWidth: 120 },
          3: { cellWidth: 100 },
          4: { cellWidth: 70, halign: 'right' },
          5: { cellWidth: 70, halign: 'right' },
        },
        foot: [
          [
            { content: 'Subtotal', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } },
            { content: (invoice.total_amount || 0).toLocaleString('id-ID'), styles: { halign: 'right', fontStyle: 'bold' } },
          ],
          [
            { content: 'Fee', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } },
            { content: (invoice.fee || 0).toLocaleString('id-ID'), styles: { halign: 'right', fontStyle: 'bold' } },
          ],
          [
            { content: 'Grand Total', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold' } },
            { content: (invoice.total_price || ((invoice.total_amount || 0) + (invoice.fee || 0))).toLocaleString('id-ID'), styles: { halign: 'right', fontStyle: 'bold' } },
          ]
        ]
      });

      // — TERBILANG
      const finalY = (doc as any).lastAutoTable.finalY + 30;
      const totalAmount = invoice.total_price || ((invoice.total_amount || 0) + (invoice.fee || 0));
      
      doc.setFontSize(10).setFont('helvetica', 'bold').text('Terbilang :', 40, finalY);
      doc.setFont('helvetica', 'bold').setFontSize(9)
        .text(numberToWords(totalAmount).toUpperCase() + ' RUPIAH', 40, finalY + 15);

      // — BOX TRANSFER
      const boxY = finalY + 45;
      doc.rect(40, boxY, 280, 50);
      doc.setFontSize(9).text('Transfer Bank Mandiri a.n Erik Andrias Budi Prasetyo SAB', 50, boxY + 15);
      doc.text('No. Rek 144 00 0012684 4', 50, boxY + 30);

      // — DATE & SIGNATURE
      // const sigY = boxY - 10;
      const tanggal = new Date().toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric'
      });
      doc.setFontSize(10).setFont('helvetica', 'normal').text(`Malang, ${tanggal}`, 400, boxY);
      doc.setFontSize(10).setFont('helvetica', 'bold').text('Erik Andrias B.P', 420, boxY + 40);
    });

    // 3) Save PDF
    const filename = `invoices_${new Date().toISOString().slice(0,10)}.pdf`;
    doc.save(filename);
    
  } catch (error) {
    console.error('exportBulkPdf error:', error);
    throw new Error(`Failed to export PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
