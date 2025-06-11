import { InvoiceFormValues, ApiResponse, InvoiceFilters, PagedResult, Invoice } from "@/types/invoiceType";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const BASE_URL = "/api/invois";

export async function getAllInvoices(filters: InvoiceFilters = {}): Promise<Invoice[]> {
  const params = new URLSearchParams();
  if (filters.search) params.append("search", filters.search);
  if (filters.status) params.append("status", filters.status);

  const res = await fetch(`${BASE_URL}?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Gagal mengambil data invoices: ${res.statusText}`);
  }
  const json: ApiResponse<Invoice[]> = await res.json();
  return json.data || [];
}

export async function getInvoice(id: string): Promise<Invoice> {
  const res = await fetch(`${BASE_URL}/${id}`);
  if (!res.ok) {
    throw new Error(`Gagal mengambil data invoice ${id}: ${res.statusText}`);
  }
  const json: ApiResponse<Invoice> = await res.json();
  if (!json.data) {
    throw new Error("Tidak ada data yang diterima dari API");
  }
  return json.data;
}

export async function addInvoice(payload: InvoiceFormValues): Promise<Invoice> {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const resClone = res.clone();
    try {
      const errorData = await res.json();
      throw new Error(errorData.message || errorData.error || `Error ${res.status}: Terjadi kesalahan pada server`);
    } catch (jsonError) {
      const textError = await resClone.text();
      throw new Error(textError || `Error ${res.status}: Gagal memproses permintaan`);
    }
  }
  const json: ApiResponse<Invoice> = await res.json();
  return json.data;
}

export async function updateInvoice(id: string, payload: Partial<InvoiceFormValues>): Promise<Invoice> {
  const { customer_name, reservation_id, ...updatePayload } = payload;
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatePayload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: `Gagal memperbarui invoice ${id}` }));
    throw new Error(errorData.message || "Terjadi kesalahan yang tidak diketahui");
  }
  const json: ApiResponse<Invoice> = await res.json();
  return json.data;
}

export async function deleteInvoice(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || `Gagal menghapus invoice ${id}`);
  }
}

// --- FUNGSI HELPER UNTUK PDF ---
const formatCurrency = (amount: number | undefined) => {
  if (typeof amount !== "number") return "Rp 0";
  return `Rp ${amount.toLocaleString("id-ID")}`;
};

function numberToWords(n: number): string {
  if (isNaN(n)) return "Bukan angka";
  const num = Math.round(n);
  if (num === 0) return "nol";
  if (num > Number.MAX_SAFE_INTEGER) return num.toLocaleString("id-ID");
  const satuan = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan"];
  const terbilang = (currentNum: number): string => {
    if (currentNum === 0) return "";
    if (currentNum < 12) {
      if (currentNum === 10) return "sepuluh";
      if (currentNum === 11) return "sebelas";
      return satuan[currentNum];
    }
    if (currentNum < 20) return satuan[currentNum - 10] + " belas";
    if (currentNum < 100) return satuan[Math.floor(currentNum / 10)] + " puluh" + (currentNum % 10 > 0 ? " " + satuan[currentNum % 10] : "");
    if (currentNum < 200) return "seratus" + (currentNum % 100 > 0 ? " " + terbilang(currentNum % 100) : "");
    if (currentNum < 1000) return satuan[Math.floor(currentNum / 100)] + " ratus" + (currentNum % 100 > 0 ? " " + terbilang(currentNum % 100) : "");
    if (currentNum < 2000) return "seribu" + (currentNum % 1000 > 0 ? " " + terbilang(currentNum % 1000) : "");
    if (currentNum < 1000000) return terbilang(Math.floor(currentNum / 1000)) + " ribu" + (currentNum % 1000 > 0 ? " " + terbilang(currentNum % 1000) : "");
    if (currentNum < 1000000000) return terbilang(Math.floor(currentNum / 1000000)) + " juta" + (currentNum % 1000000 > 0 ? " " + terbilang(currentNum % 1000000) : "");
    if (currentNum < 1000000000000) return terbilang(Math.floor(currentNum / 1000000000)) + " miliar" + (currentNum % 1000000000 > 0 ? " " + terbilang(currentNum % 1000000000) : "");
    return terbilang(Math.floor(currentNum / 1000000000000)) + " triliun" + (currentNum % 1000000000000 > 0 ? " " + terbilang(currentNum % 1000000000000) : "");
  };
  const result = terbilang(num);
  return result.replace(/\s\s+/g, " ").trim();
}

export async function exportBulkPdf(ids: string[]): Promise<void> {
  if (!ids?.length) throw new Error("Tidak ada ID invoice yang dipilih");

  try {
    const invoices: Invoice[] = await Promise.all(ids.map((id) => getInvoice(id)));
    if (invoices.length === 0) throw new Error("Invoice tidak ditemukan");

    const doc = new jsPDF({ unit: "pt", format: "a4" });

    invoices.forEach((invoice, idx) => {
      if (idx > 0) doc.addPage();

      const leftMargin = 40;
      const rightMargin = 30;
      const rightColX = 350;

      // --- HEADER: LOGO, JUDUL, INFO PERUSAHAAN ---
      doc.setFontSize(22).setFont("helvetica", "bold").text("INVOICE", leftMargin, 50);
      try {
        doc.addImage("/img/SITRAVEL.png", "PNG", doc.internal.pageSize.getWidth() - rightMargin - 120, 20, 100, 70);
      } catch (logoError) {
        console.warn("Gagal memuat logo:", logoError);
      }
      doc.setFontSize(10).setFont("helvetica", "bold");
      doc.text("SITRAVEL", rightColX - 70, 50);
      doc.setFontSize(9).setFont("helvetica", "normal");
      doc.text("Jl. Soekarno Hatta No.9", rightColX - 70, 65);
      doc.text("081217369484", rightColX - 70, 80);
      doc.text("info@sitravelagent.my.id", rightColX - 70, 95);

      // --- BILL TO ---
      const detailY = 90;
      doc.setFontSize(10).setFont("helvetica", "bold").text("Bill to:", leftMargin, detailY);
      doc.setFont("helvetica", "normal").setFontSize(10);
      doc.text(`Name        :  ${invoice.customer_name || "N/A"}`, leftMargin, detailY + 15);
      doc.text(`Contact     :  ${invoice.reservation_id[0]?.contact || "N/A"}`, leftMargin, detailY + 30);

      // --- TABEL RINCIAN RESERVASI (Logika dari kode aktif) ---
      const tableBody = (invoice.reservation_id || []).map((res) => [
        `#${res.ticket_id}`,
        `${res.carrier_name || "-"}`,
        `${res.hotel_name || "-"}`,
        res.destination,
        res.name,
        formatCurrency(res.total_price),
        formatCurrency(res.total_price),
      ]);

      const grandTotal = (invoice.total_amount || 0) + (invoice.fee || 0);

      autoTable(doc, {
        startY: detailY + 50,
        theme: "grid",
        head: [["ID Tiket", "Remark", "Hotel", "Route", "Pax Name", "Price / Pack", "Total"]],
        body: tableBody,
        headStyles: {
          fontStyle: "bold",
          halign: "center",
          fillColor: [240, 240, 240],
          textColor: [0, 0, 0],
        },
        bodyStyles: {
          fontStyle: "normal",
          halign: "center",
        },
        footStyles: {
          halign: "right",
          fontStyle: "normal",
          fillColor: [240, 240, 240],
          textColor: [0, 0, 0],
        },
        columnStyles: { 3: { halign: "right" } },
        foot: [
          [{ content: "Subtotal", colSpan: 6, styles: { fontStyle: "bold" } }, { content: formatCurrency(invoice.total_amount) }],
          [{ content: "Biaya Tambahan", colSpan: 6, styles: { fontStyle: "bold" } }, { content: formatCurrency(invoice.fee) }],
          [{ content: "Grand Total", colSpan: 6, styles: { fontStyle: "bold" } }, { content: formatCurrency(grandTotal) }],
        ],
      });

      const finalY = (doc as any).lastAutoTable.finalY + 30;

      // --- FOOTER: TERBILANG, INFO BANK, TANDA TANGAN ---
      doc.setFontSize(10).setFont("helvetica", "bold").text("Terbilang :", leftMargin, finalY);
      doc
        .setFont("helvetica", "italic")
        .setFontSize(9)
        .text(numberToWords(grandTotal).toUpperCase() + " RUPIAH", leftMargin, finalY + 15, { maxWidth: 300 });

      const boxY = finalY + 45;
      doc.rect(leftMargin, boxY, 280, 50);
      doc.setFontSize(9).text("Transfer Bank BRI a.n SITRAVEL", leftMargin + 10, boxY + 15);
      doc.text("No. Rekening : 51148 22871 00981", leftMargin + 10, boxY + 30);

      const tanggal = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
      const sigX = 380;
      doc
        .setFontSize(10)
        .setFont("helvetica", "normal")
        .text(`Malang, ${tanggal}`, sigX + 60, boxY);
      doc
        .setFontSize(10)
        .setFont("helvetica", "bold")
        .text("SITRAVEL", sigX + 60, boxY + 60);
    });

    // --- SIMPAN PDF ---
    const customerName = invoices[0]?.customer_name || "customer";
    const sanitizedCustomerName = customerName.toLowerCase().replace(/[^a-z0-9]/gi, "_");
    const filename = `invoice_${sanitizedCustomerName}_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(filename);
  } catch (error) {
    console.error("Gagal mengekspor PDF:", error);
    throw new Error(`Gagal mengekspor PDF: ${error instanceof Error ? error.message : "Kesalahan tidak diketahui"}`);
  }
}
