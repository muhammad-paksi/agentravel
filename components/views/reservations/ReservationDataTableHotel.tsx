"use client";
import React, { useMemo } from "react";
import { Search, Settings2Icon, BedDouble } from "lucide-react"; // Added BedDouble icon
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShowButton, UpdateButton } from "@/components/ui/btn-action";
import { useRouter } from "next/navigation";
import { useReservationForm } from "@/hooks/useReservationForm";
import { useIsMobile } from "@/hooks/use-mobile";
import { getStatusClasses, STATUS_BASE_CLASSES } from "@/components/ui/status-badge";
import { DeleteReservation } from "@/components/views/reservations/DeleteReservation";

/**
 * A data table component specifically for displaying reservations that include hotel bookings.
 */
export default function ReservationDataTableHotel() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const {
    loading,
    data: filtered, // This is the data filtered by search/status from the hook
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
} = useReservationForm();

  // Further filter the data to only include reservations with a hotel name.
  // This is done client-side after fetching all data.
const hotelReservations = useMemo(() => {
    return filtered.filter(resv => resv.hotel_name && resv.hotel_name.trim() !== '');
}, [filtered]);

return (
    <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
            <div className="flex items-center gap-2">
                <BedDouble className="h-6 w-6 text-blue-600" />
                <h3 className="text-sm text-gray-500">
                    {hotelReservations.length} Hotel Reservations
                </h3>
            </div>
            <div className="flex w-full sm:w-auto gap-2 items-center">
            <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
                placeholder="Search by customer, hotel..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 h-10 w-full"
            />
            </div>
            <div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-10 rounded-md px-3 py-2 flex items-center space-x-2" aria-label="Filter status">
                        <Settings2Icon className="h-5 w-5 text-gray-400" />
                    { !isMobile && <span className="text-gray-400">Filter</span> }
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Booked">Booked</SelectItem>
                        <SelectItem value="Canceled">Canceled</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    </div>

    <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="min-w-full rounded-lg bg-white overflow-hidden">
            <thead className="bg-gray-300">
                <tr>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Hotel Name</th>
                <th className="px-4 py-3 text-left">Check-in Date</th>
                <th className="px-4 py-3 text-left">Guests</th>
                <th className="px-4 py-3 text-left">Room Price</th>
                <th className="px-4 py-3 text-left">Total Price</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
                {loading ? (
                <tr>
                    <td colSpan={8} className="p-4 text-center">
                    Loading data, please wait...
                    </td>
                </tr>
                ) : hotelReservations.length === 0 ? (
                <tr>
                    <td colSpan={8} className="p-4 text-center">
                    No hotel reservation data found.
                    </td>
                </tr>
                ) : (
                hotelReservations.map((resv) => (
                    <tr key={resv._id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-700">{resv.name}</td>
                    <td className="px-4 py-2 text-gray-700">{resv.hotel_name}</td>
                    <td className="px-4 py-2 text-gray-700">{resv.checkInDate ? new Date(resv.checkInDate).toLocaleDateString('id-ID') : '-'}</td>
                    <td className="px-4 py-2 text-center text-gray-700">{resv.total_persons || '-'}</td>
                    <td className="px-4 py-2 text-gray-700">Rp {resv.room_price?.toLocaleString('id-ID') || '0'}</td>
                    <td className="px-4 py-2 text-gray-700 font-semibold">Rp {resv.total_price.toLocaleString('id-ID')}</td>
                    <td className="px-4 py-2">
                        <span className={`${STATUS_BASE_CLASSES} ${getStatusClasses(resv.status)}`}>
                        {resv.status}
                        </span>
                    </td>
                    <td className="px-4 py-2">
                        <div className="flex justify-center items-center gap-2">
                        <ShowButton
                            onClick={() => 
                            router.push(`/dashboard/reservations/${resv._id}?view=hotel`)} 
                        />
                        <UpdateButton onClick={() => router.push(`/dashboard/reservations/${resv._id}/update`)} />
                        <DeleteReservation id={resv._id || ''} onSuccess={() => router.refresh()} />
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
