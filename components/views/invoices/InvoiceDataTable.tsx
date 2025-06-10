"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useInvoiceForm } from "@/hooks/useInvoiceForm";
import { Invoice } from "@/types/invoiceType";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShowButton, UpdateButton } from "@/components/ui/btn-action";
import { DeleteInvoice } from "@/components/views/invoices/DeleteInvoice";
import { getStatusClasses, STATUS_BASE_CLASSES } from "@/components/ui/status-badge";
import { Plus, Search, Settings2Icon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { DownloadButton } from "@/components/ui/download";

export default function InvoiceDataTable() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const {
    loading,
    filteredInvoices,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    exportingId,
    setExportingId,
    handleExportSinglePdf
  } = useInvoiceForm();

  
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };
  
  const formatCurrency = (amount?: number) => {
    if (typeof amount !== 'number') return 'Rp 0';
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const renderReservationSummary = (invoice: Invoice) => {
    const reservations = invoice.reservation_id;
    if (!reservations || reservations.length === 0) return "-";
    
    const count = reservations.length;
    const tooltipText = reservations.map(r => `#${r.ticket_id} - ${r.name}`).join('\n');

    return (
      <span className="cursor-default" title={tooltipText}>
        {count} Reservations
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Bagian Filter dan Tombol Aksi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
        <div className="flex gap-2 items-center">
          <h3 className="text-sm text-gray-500">{filteredInvoices.length} Invoices</h3>
        </div>
        <div className="flex sm:flex-row items-left gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search for customer names..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 h-10"
          />
        </div>
        <div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 rounded-md px-3 py-2 flex items-center space-x-2" aria-label="Filter status">
              <Settings2Icon className="h-5 w-5 text-gray-400" />
              {!isMobile && <span className="text-gray-400">Filter</span>}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Unpaid">Unpaid</SelectItem>
            </SelectContent>
          </Select>
        </div>
          <Link href="/dashboard/invoices/new">
            <Button className="h-10 text-white bg-[#377dec] hover:bg-[#2e61b5] flex items-center">
              <Plus className="h-4 w-4 "/>
              {!isMobile && <span>Create Invoice</span>}
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabel Data Invoice */}
      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-300">
            <tr>
              {/* <th className="p-3 text-left">ID Invoice</th> */}
              <th className="p-3 text-left">Customer name</th>
              <th className="p-3 text-left">Issued Date</th>
              <th className="p-3 text-left">Reservations</th>
              <th className="p-3 text-left">Total Payment</th>
              <th className="p-3 text-left">Payment Date</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Export</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={8} className="p-4 text-center text-gray-500">Loading invoice data...</td></tr>
            ) : filteredInvoices.length === 0 ? (
              <tr><td colSpan={8} className="p-4 text-center text-gray-500">No invoice was found.</td></tr>
            ) : (
              filteredInvoices.map(inv => {
                const totalTagihan = (inv.total_amount || 0) + (inv.fee || 0);
                const isExporting = exportingId === inv._id;
                return (
                  <tr key={inv._id} className="hover:bg-gray-50">
                    {/* <td className="p-3 text-gray-500 font-mono text-xs">#{inv._id.slice(-6)}</td> */}
                    <td className="p-3 font-medium">{inv.customer_name}</td>
                    <td className="p-3">{formatDate(inv.createdAt)}</td>
                    <td className="p-3">{renderReservationSummary(inv)}</td>
                    <td className="p-3 font-semibold">{formatCurrency(totalTagihan)}</td>
                    <td className="px-4 py-2">{inv.status === 'Paid' ? formatDate(inv.payment_date) : '-'}</td>
                    <td className="p-3">
                      <span className={`${STATUS_BASE_CLASSES} ${getStatusClasses(inv.status)}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <DownloadButton
                          size="sm"
                          isLoading={isExporting}
                          onClick={() => handleExportSinglePdf(inv._id)}
                          title="Export Invoice to PDF"
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex justify-center gap-2">
                        <ShowButton onClick={() => router.push(`/dashboard/invoices/${inv._id}`)} />
                        <UpdateButton onClick={() => router.push(`/dashboard/invoices/${inv._id}/update`)} />
                        <DeleteInvoice id={inv._id} onSuccess={() => router.refresh()} />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
