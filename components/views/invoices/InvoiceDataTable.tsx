"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search, Settings2Icon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { ShowButton, UpdateButton } from "@/components/ui/btn-action";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useInvoiceForm } from "@/hooks/useInvoiceForm";
import { useIsMobile } from "@/hooks/use-mobile";
import { getStatusClasses, STATUS_BASE_CLASSES } from "@/components/ui/status-badge";
import { DeleteInvoice } from "@/components/views/invoices/DeleteInvoice";
import * as reservationService from "@/services/reservationService";
import { ReservationFormValues } from "@/types/reservationType";

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

  // Refresh data only once when component mounts
  useEffect(() => {
    refreshData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch reservation details for all invoices
  useEffect(() => {
    if (!invoices || invoices.length === 0) return;
    
    // Get unique reservation IDs
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
    
    // Fallback to existing methods
    if (invoice.reservation?.ticket_id) {
      return `#${invoice.reservation.ticket_id}`;
    }
    
    if (invoice.reservation_id && typeof invoice.reservation_id === 'object' && invoice.reservation_id.ticket_id) {
      return `#${invoice.reservation_id.ticket_id}`;
    }
    
    return 'Loading...';
  }, [reservationDetails]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
        <h3 className="text-sm text-gray-500">
          {invoices.length} Invoices
        </h3>
        <div className="flex gap-2 items-center">
          {/* Unified Search */}
          <div className={`relative ${isMobile ? 'w-10 me-3' : ''}`}>
            <Search className="absolute left-2 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder={isMobile ? "" : "Search customer, date, status..."}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={`ps-10 h-10 ${isMobile ? 'w-10 pe-2' : 'w-full'}`}
              aria-label="Search"
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
              <th className="px-4 py-2 text-left">Total Amount</th>
              <th className="px-4 py-2 text-left">Due Date</th>
              <th className="px-4 py-2 text-left">Payment Date</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Total Price</th>
              <th className="px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading || loadingReservations ? (
              <tr>
                <td colSpan={8} className="px-4 py-2 text-center">
                  Please wait, loading...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-2 text-center">
                  Data Invoice tidak ditemukan
                </td>
              </tr>
            ) : (
              filtered.map((invoice) => (
                <tr key={invoice._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">
                    {getTicketId(invoice)}
                  </td>
                  <td className="px-4 py-2">
                    {getCustomerName(invoice)}
                  </td>
                  <td className="px-4 py-2">{formatCurrency(invoice.total_amount)}</td>
                  <td className="px-4 py-2">{formatDate(invoice.due_date)}</td>
                  <td className="px-4 py-2">
                    {invoice.status === 'Paid' ? 
                      formatDate(invoice.payment_date) : 
                      '-'}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`${STATUS_BASE_CLASSES} ${getStatusClasses(
                        invoice.status
                      )}`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {formatCurrency(invoice.total_amount + (invoice.fee || 0))}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex flex-row gap-2 justify-center">
                      <ShowButton
                        onClick={() =>
                          router.push(`/dashboard/invoices/${invoice._id}`)
                        }
                      />
                      <UpdateButton
                        onClick={() =>
                          router.push(`/dashboard/invoices/${invoice._id}/update`)
                        }
                      />
                      <DeleteInvoice 
                        id={invoice._id || ''}
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