"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search, Settings2Icon, FileUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { ShowButton, UpdateButton, DeleteButton } from "@/components/ui/btn-action";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useInvoiceForm } from "@/hooks/useInvoiceForm";
import { useIsMobile } from "@/hooks/use-mobile";
import { getStatusClasses, STATUS_BASE_CLASSES } from "@/components/ui/status-badge";
import { DeleteInvoice } from "@/components/views/invoices/DeleteInvoice";
import * as reservationService from "@/services/reservationService";
import { ReservationFormValues } from "@/types/reservationType";
import { exportBulkPdf } from '@/services/invoiceService';
import { Checkbox } from '@/components/ui/checkbox';
import { Invoice } from "@/types/invoiceType";

export default function InvoiceDataTable() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const {
    loading,
    data: invoices,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    filtered,
    refreshData
  } = useInvoiceForm();

  // State to store reservation details
  const [reservationDetails, setReservationDetails] = useState<{[key: string]: ReservationFormValues}>({});
  const [loadingReservations, setLoadingReservations] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const toggle = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x!==id) : [...prev, id]);
  const allSelected = selectedIds.length === invoices.length;
  const partially = selectedIds.length>0 && !allSelected;

  // Refresh data saat komponen dimount
  useEffect(() => {
    refreshData();
  }, []);

  // Fetch reservation details for all invoices
  useEffect(() => {
    if (!invoices.length) return;
    
    const reservationIds = [...new Set(invoices.map(invoice => invoice.reservation_id).filter(Boolean))];
    
    if (!reservationIds.length) {
      setLoadingReservations(false);
      return;
    }
    
    setLoadingReservations(true);
    
    // Fetch each reservation
    const fetchReservations = async () => {
      const details: {[key: string]: ReservationFormValues} = {};
      
      for (const id of reservationIds) {
        try {
          if (id) {
            const reservation = await reservationService.getReservation(id);
            details[id] = reservation;
          }
        } catch (error) {
          console.error(`Failed to fetch reservation ${id}:`, error);
        }
      }
      
      setReservationDetails(details);
      setLoadingReservations(false);
    };
    
    fetchReservations();
  }, [invoices]);

  // Helper function to get customer name from invoice
  const getCustomerName = useCallback((invoice: any): string => {
    if (invoice.reservation_id && reservationDetails[invoice.reservation_id]) {
      return reservationDetails[invoice.reservation_id].name;
    }
    
    if (invoice.reservation?.name) {
      return invoice.reservation.name;
    }
    
    return "-";
  }, [reservationDetails]);

  // Format currency
  const formatCurrency = (amount: number) => {
    if (typeof amount !== 'number') return 'Rp 0';
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  // Format date
  const formatDate = (dateString: string | Date) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  // Get ticket ID from reservation details
  const getTicketId = useCallback((invoice: any) => {
    // If we have the reservation details for this invoice
    if (invoice.reservation_id && reservationDetails[invoice.reservation_id]) {
      const reservation = reservationDetails[invoice.reservation_id];
      return `#${reservation.ticket_id}`;
    }
    if (invoice.reservation?.ticket_id) {
      return `#${invoice.reservation.ticket_id}`;
    }
    return 'Loading...';
  }, [reservationDetails]);

  // function getDestination(inv: Invoice): React.ReactNode {
  //   throw new Error("Function not implemented.");
  // }
  // const getDestination = useCallback((inv: Invoice): React.ReactNode => {
  //   if (inv.reservation_id && reservationDetails[inv.reservation_id]) {
  //     return reservationDetails[inv.reservation_id].destination || '-'
  //   }
  //   if (inv.reservation?.destination) {
  //     return inv.reservation.destination
  //   }
  //   return '-'
  // }, [reservationDetails])

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
        <div className="flex gap-2 items-center">
          <h3 className="text-sm text-gray-500">
            {invoices.length} Invoices
          </h3>
          <Button className="h-10 text-white bg-[#377dec] hover:bg-[#2e61b5]" disabled={!selectedIds.length} onClick={()=>exportBulkPdf(selectedIds)} >
            <FileUp/> ({selectedIds.length})
          </Button>
        </div>
        <div className="flex gap-2 items-center">
          <div className="relative">
            <Search className="absolute left-2 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder={isMobile ? "" : "Search customer, etc..."}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 h-10 w-full"
            />
          </div>
          {/* Filter by Status */}
          <div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10 rounded-md px-3 py-2 flex items-center space-x-2" aria-label="Filter status">
                <Settings2Icon className="h-5 w-5 text-gray-400" />
                { !isMobile && <span className="text-gray-400">Filter</span> }
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Add Invoice */}
          <div>
            <Link href="/dashboard/invoices/new">
              <Button className="h-10 text-white bg-[#377dec] hover:bg-[#2e61b5] flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                { !isMobile && <span>Add Invoice</span> }
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="min-w-full rounded-lg bg-white overflow-hidden">
          <thead className="bg-gray-300">
            <tr>
              <th className="px-4 py-2 text-left">Reservation ID</th>
              <th className="px-4 py-2 text-left">Customer Name</th>
              <th className="px-4 py-2 text-left">Due Date</th>
              {/* <th className="px-4 py-2 text-left">Destination</th> */}
              {/* <th className="px-4 py-2 text-left">Issued Date</th> */}
              <th className="px-4 py-2 text-left">Payment Date</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Total Amount</th>
              <th className="px-4 py-2 text-left">Total Price</th>
              <th className="px-4 py-2 text-left">Export</th>
              <th className="px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading || loadingReservations ? (
              <tr>
                <td colSpan={9} className="px-4 py-2 text-center">
                  Please wait, loading...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-2 text-center">
                  No invoice data found
                </td>
              </tr>
            ) : (
              filtered.map((inv) => (
                <tr key={inv._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">
                    {getTicketId(inv)}
                  </td>
                  <td className="px-4 py-2">
                    {getCustomerName(inv)}
                  </td>
                  <td className="px-4 py-2">{formatDate(inv.due_date)}</td>
                  {/* <td className="px-4 py-2">
                    {getDestination(inv)}
                  </td> */}
                  {/* <td className="px-4 py-2">{formatDate(inv.issued_date)}</td> */}
                  <td className="px-4 py-2">{inv.status === 'Paid' ? formatDate(inv.payment_date) : '-'}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`${STATUS_BASE_CLASSES} ${getStatusClasses(
                        inv.status
                      )}`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">{formatCurrency(inv.total_amount)}</td>
                  <td className="px-4 py-2">{formatCurrency(inv.total_price || (inv.total_amount + (inv.fee || 0)))}</td>
                  <td className="flex flex-row gap-2 justify-center">
                    <Checkbox checked={selectedIds.includes(inv._id)} indeterminate={false} onCheckedChange={()=>toggle(inv._id)} />
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex flex-row gap-2 justify-center">
                      <ShowButton
                        onClick={() =>
                          router.push(`/dashboard/invoices/${inv._id}`)
                        }
                      />
                      <UpdateButton
                        onClick={() =>
                          router.push(`/dashboard/invoices/${inv._id}/update`)
                        }
                      />
                      <DeleteInvoice 
                        id={inv._id || ''}
                        onSuccess={() => router.refresh()}
                      />
                    </div>
                  </td>
                </tr>
              ))                        
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}