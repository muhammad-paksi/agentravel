"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useReservationForm } from "@/hooks/useReservationForm";
import { Button } from "@/components/ui/button";

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div>
    <dt className="block text-sm font-medium text-gray-500 mb-1">{label}</dt>
    <dd className="text-gray-900 border border-gray-300 p-2 rounded-lg text-sm font-normal bg-gray-50">
      {value || "-"}
    </dd>
  </div>
);

const formatDate = (date?: Date | string) => {
  if (!date) return '-';
  try {
    return new Date(date).toLocaleDateString("id-ID", {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  } catch (e) {
    return '-';
  }
};

const formatCurrency = (amount?: number) => {
  if (typeof amount !== 'number') return '-';
  return `Rp ${amount.toLocaleString('id-ID')}`;
};

export default function ShowReservation() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : params.id?.[0];
  const router = useRouter();
  const { form: reservation, fetching, error } = useReservationForm({ id });

  if (fetching) return <p className="text-center p-4">Loading reservation...</p>;
  if (error) return <p className="text-red-600 p-4">Error: {error}</p>;
  if (!reservation) return <p className="text-center p-4">No reservation found.</p>;

  const hasHotelInfo = reservation.hotel_name || reservation.room_price;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <section>
        <h2 className="text-xl font-bold mb-3">Customer Information</h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailItem label="Nomor Induk Kependudukan (NIK)" value={reservation.nik} />
          <DetailItem label="Customer Name" value={reservation.name} />
          <DetailItem label="Contact (Phone/Email)" value={reservation.contact} />
        </dl>
      </section>
      
      {/* Conditionally render Hotel Information */}
      {hasHotelInfo && (
        <section>
          <h2 className="text-xl font-bold mb-3">Hotel Information</h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <DetailItem label="Hotel Name" value={reservation.hotel_name} />
            <DetailItem label="Check-in Date" value={formatDate(reservation.checkInDate)} />
            <DetailItem label="Total Persons" value={reservation.total_persons} />
            <DetailItem label="Room Price" value={formatCurrency(reservation.room_price)} />
          </dl>
        </section>
      )}

      <section>
        <h2 className="text-xl font-bold mb-3">Payment & Status</h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailItem label="Booking Status" value={reservation.status} />
          <DetailItem label="Payment Method" value={reservation.payment_method} />
          <DetailItem label="Payment Status" value={reservation.payment_status} />
        </dl>
      </section>

      <div className="flex space-x-2 pt-4 mt-6">
        <Button
          className="text-white bg-gray-500 hover:bg-gray-700"
          onClick={() => router.back()}
        >
          Close Details
        </Button>
      </div>
    </div>
  );
}
