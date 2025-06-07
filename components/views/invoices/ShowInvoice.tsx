"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useInvoiceForm } from "@/hooks/useInvoiceForm";
import { Button } from "@/components/ui/button";

export default function ShowInvoice() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : params.id?.[0];
  const router = useRouter();
  const { form: invoice, fetching, error } = useInvoiceForm({ id });

  if (fetching) return <p>Loading invoice...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (!invoice) return <p>No invoice found.</p>;

  // Format currency
  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  // Format date
  const formatDate = (dateString: string | Date) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      {/* Reservation Information */}
      <section>
        <h2 className="text-lg font-bold mb-2">Reservation Information</h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {invoice.reservation_ref ? (
            <>
              <div>
                <dt className="block text-sm font-medium mb-1">Ticket ID</dt>
                <dd className="text-black border border-gray-400 p-1 rounded-lg text-sm font-normal">
                  #{invoice.reservation_ref.ticket_id}
                </dd>
              </div>
              <div>
                <dt className="block text-sm font-medium mb-1">Customer Name</dt>
                <dd className="text-black border border-gray-400 p-1 rounded-lg text-sm font-normal">
                  {invoice.reservation_ref.name}
                </dd>
              </div>
              <div>
                <dt className="block text-sm font-medium mb-1">Destination</dt>
                <dd className="text-black border border-gray-400 p-1 rounded-lg text-sm font-normal">
                  {invoice.reservation_ref.destination}
                </dd>
              </div>
            </>
          ) : (
            <div className="md:col-span-2">
              <dt className="block text-sm font-medium mb-1">Reservation ID</dt>
              <dd className="text-black border border-gray-400 p-1 rounded-lg text-sm font-normal">
                {invoice.reservation_id}
              </dd>
            </div>
          )}
        </dl>
      </section>

      {/* Invoice Information */}
      <section>
        <h2 className="text-lg font-bold mb-2">Invoice Information</h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="block text-sm font-medium mb-1">Total Amount</dt>
            <dd className="text-black border border-gray-400 p-1 rounded-lg text-sm font-normal">
              {formatCurrency(invoice.total_amount)}
            </dd>
          </div>
          <div>
            <dt className="block text-sm font-medium mb-1">Fee</dt>
            <dd className="text-black border border-gray-400 p-1 rounded-lg text-sm font-normal">
              {formatCurrency(invoice.fee)}
            </dd>
          </div>
          <div>
            <dt className="block text-sm font-medium mb-1">Total Price</dt>
            <dd className="text-black border border-gray-400 p-1 rounded-lg text-sm font-normal">
              {formatCurrency(invoice.total_amount + invoice.fee)}
            </dd>
          </div>
        </dl>
      </section>

      {/* Payment Information */}
      <section>
        <h2 className="text-lg font-bold mb-2">Payment Information</h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="block text-sm font-medium mb-1">Payment Method</dt>
            <dd className="text-black border border-gray-400 p-1 rounded-lg text-sm font-normal">
              {invoice.payment_method}
            </dd>
          </div>
          <div>
            <dt className="block text-sm font-medium mb-1">Payment Date</dt>
            <dd className="text-black border border-gray-400 p-1 rounded-lg text-sm font-normal">
              {invoice.status === 'Paid' ? formatDate(invoice.payment_date) : '-'}
            </dd>
          </div>
          <div>
            <dt className="block text-sm font-medium mb-1">Issued Date</dt>
            <dd className="text-black border border-gray-400 p-1 rounded-lg text-sm font-normal">
              {formatDate(invoice.issued_date)}
            </dd>
          </div>
          <div>
            <dt className="block text-sm font-medium mb-1">Due Date</dt>
            <dd className="text-black border border-gray-400 p-1 rounded-lg text-sm font-normal">
              {formatDate(invoice.due_date)}
            </dd>
          </div>
        </dl>
      </section>

      {/* Invoice Status */}
      <section>
        <h2 className="text-lg font-bold mb-2">Invoice Status</h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="block text-sm font-medium mb-1">Status</dt>
            <dd className="text-black border border-gray-400 p-1 rounded-lg text-sm font-normal">
              {invoice.status}
            </dd>
          </div>
        </dl>
      </section>

      <div className="flex space-x-2 pt-4">
        <Button
          className="text-white bg-[#377dec] hover:bg-[#2e61b5]"
          onClick={() => router.back()}
        >
          Close Details
        </Button>
        <Button
          className="text-white bg-[#377dec] hover:bg-[#2e61b5]"
          onClick={() => router.push(`/dashboard/invoices/${invoice._id}/update`)}
        >
          Edit Invoice
        </Button>
      </div>
    </div>
  );
}