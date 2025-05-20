"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search, Settings2Icon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { ShowButton, UpdateButton, DeleteButton } from "@/components/ui/btn-action";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useReservationForm } from "@/hooks/useReservationForm";
import { useIsMobile } from "@/hooks/use-mobile";
import { getStatusClasses, STATUS_BASE_CLASSES } from "@/components/ui/status-badge";
import { DeleteReservation } from "@/components/views/reservations/DeleteReservation";

export default function ReservationDataTable() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const {
    loading,
    data: reservations,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    filtered
  } = useReservationForm();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
        <h3 className="text-sm text-gray-500">
          {/* Total Reservasi */}
          {reservations.length} Reservations
        </h3>
        <div className="flex gap-2 items-center">
          <div className={`relative ${isMobile ? 'w-10 me-3' : ''}`}>
            <Search className="absolute left-2 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder={isMobile ? "" : "Search ticket, customer, destination.."}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={`ps-10 h-10 ${isMobile ? 'w-10 pe-2' : 'w-full'}`}
              aria-label="Search"
            />
          </div>
          {/* Filter berdasarkan Status Reservasi */}
          <div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10 rounded-md px-3 py-2 flex items-center space-x-2" aria-label="Filter status">
                <Settings2Icon className="h-5 w-5 text-gray-400" />
                { !isMobile && <span className="text-gray-400">Filter</span> }
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Reset</SelectItem>
                <SelectItem value="Booked">Booked</SelectItem>
                <SelectItem value="Canceled">Canceled</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Add Reservasi */}
          <div>
            <Link href="/dashboard/reservations/add">
              <Button className="h-10 text-white bg-[#377dec] hover:bg-[#2e61b5] flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                { !isMobile && <span>Add Reservation</span> }
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="min-w-full rounded-lg bg-white overflow-hidden">
          <thead className="bg-gray-300">
            <tr>
              <th className="px-4 py-2 text-left">Ticket ID</th>
              <th className="px-4 py-2 text-left">Customer</th>
              <th className="px-4 py-2 text-left">Destination</th>
              <th className="px-4 py-2 text-left">Departure Date</th>
              <th className="px-4 py-2 text-left">Estimated Budget</th>
              <th className="px-4 py-2 text-left">Total Price</th>
              <th className="px-4 py-2 text-left">Booking Status</th>
              <th className="px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-2 text-center">
                  Please wait, loading...
                </td>
              </tr>
            ) : (
              filtered.map((resv) => (
                <tr key={resv._id} className="hover:bg-gray-50 ">
                  <td className="px-4 py-2">{resv.ticket_id}</td>
                  <td className="px-4 py-2">{resv.name}</td>
                  <td className="px-4 py-2">{resv.destination}</td>
                  <td className="px-4 py-2">{new Date(resv.date).toLocaleDateString()}</td>
                  <td className="px-4 py-2">Rp {resv.estimated_budget.toLocaleString('id-ID')}</td>
                  <td className="px-4 py-2">Rp {resv.total_price.toLocaleString('id-ID')}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`${STATUS_BASE_CLASSES} ${getStatusClasses(
                        resv.status
                      )}`}
                    >
                      {resv.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex flex-row gap-2">
                      <ShowButton
                        onClick={() =>
                          router.push(`/dashboard/reservations/${resv._id}`)
                        }
                      />
                      <UpdateButton
                        onClick={() =>
                          router.push(`/dashboard/reservations/${resv._id}/update`)
                        }
                      />
                      <DeleteReservation 
                        id={resv._id || ''}
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