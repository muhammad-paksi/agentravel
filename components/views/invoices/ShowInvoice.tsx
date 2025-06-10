"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useInvoiceForm } from "@/hooks/useInvoiceForm";
import { Button } from "@/components/ui/button";
import { getStatusClasses, STATUS_BASE_CLASSES } from "@/components/ui/status-badge";

export default function ShowInvoice() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : params.id?.[0];
  const router = useRouter();
  const { form: invoice, selectedReservations, fetching, error } = useInvoiceForm({ id });

  // Fungsi helper
  const formatCurrency = (amount: number | undefined) => {
    if (typeof amount !== 'number') return 'Rp 0';
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  // Kondisi loading dan error
  if (fetching) return <div className="p-6 text-center">Loading invoice data...</div>;
  if (error) return <div className="p-6 text-center text-red-600">Error: {error}</div>;
  if (!invoice || !invoice._id) return <div className="p-6 text-center">Invoice not found.</div>;
  const grandTotal = (invoice.total_amount || 0) + (invoice.fee || 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      {/* bg-white rounded-lg shadow p-6 space-y-4 */}
      {/* --- Bagian Header --- */}
      <header className="flex justify-between items-start pb-4 border-b">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Invoice Details</h1>
          <p className="text-sm text-gray-500">ID: {invoice._id}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
          <span className={`${STATUS_BASE_CLASSES} ${getStatusClasses(invoice.status)} text-base`}>
            {invoice.status}
          </span>
        </div>
      </header>

      {/* --- Info Pelanggan & Invoice --- */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Bill to:</h2>
          <div className="text-gray-600">
            <p className="font-bold text-lg">Name: {invoice.customer_name}</p>
            <p> Contact: {selectedReservations[0]?.contact || '-'}</p>
          </div>
        </div>
        <div className="text-left md:text-right">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Invoice Information:</h2>
          <div className="text-gray-600 space-y-1">
            <p><span className="font-semibold">Issued Date:</span> {formatDate(invoice.issued_date)}</p>
            <p><span className="font-semibold">Due Date:</span> {formatDate(invoice.due_date)}</p>
          </div>
        </div>
      </section>

      {/* --- Tabel Rincian Reservasi --- */}
      <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Reservation Details</h2>
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left font-semibold">ID Ticket</th>
                <th className="p-3 text-left font-semibold">Customer Name</th>
                <th className="p-3 text-left font-semibold">Destination</th>
                <th className="p-3 text-right font-semibold">Total Price</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {selectedReservations && selectedReservations.length > 0 ? (
                selectedReservations.map(res => (
                  <tr key={res._id}>
                    <td className="p-3">#{res.ticket_id}</td>
                    <td className="p-3">{res.name}</td>
                    <td className="p-3">{res.destination}</td>
                    <td className="p-3 text-right">{formatCurrency(res.total_price)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-500">
                  No reservation details.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* --- Ringkasan Finansial --- */}
      <section className="flex justify-end">
        <div className="w-full md:w-2/5 space-y-2">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>{formatCurrency(invoice.total_amount)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Fee</span>
            <span>{formatCurrency(invoice.fee)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-gray-800 border-t pt-2 mt-2">
            <span>Grand Total</span>
            <span>{formatCurrency(grandTotal)}</span>
          </div>
        </div>
      </section>

      {/* --- Informasi Pembayaran & Tombol Aksi --- */}
      <footer className="border-t pt-6 flex justify-between items-center">
         <div className="text-sm text-gray-600">
            <p><span className="font-semibold">Payment Method:</span> {invoice.payment_method}</p>
            <p><span className="font-semibold">Payment Date:</span> {invoice.status === 'Paid' ? formatDate(invoice.payment_date) : 'Unpaid'}</p>
         </div>
        <div className="flex space-x-4">
          <Button className="border-b border-gray-500 text-gray-500 bg-white hover:bg-gray-200" variant="outline" onClick={() => router.back()}>
            Close Detail
          </Button>
          <Button
            className="text-white bg-[#377dec] hover:bg-[#2e61b5]"
            onClick={() => router.push(`/keuangan/invoice/${invoice._id}/update`)}
          >
            Update Invoice
          </Button>
        </div>
      </footer>
    </div>
  );
}
