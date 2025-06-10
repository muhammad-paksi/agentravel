"use client";
import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ShowReservation from "@/components/views/reservations/ShowReservation";
import ShowReservationHotel from "@/components/views/reservations/ShowReservationHotel";

/**
 * A wrapper component to handle Suspense for hooks like useSearchParams.
 */
function DetailView() {
  const searchParams = useSearchParams();
  // Read the 'view' parameter from the URL, default to 'flight' if not present.
  const activeView = searchParams.get('view') || 'flight';

  return (
    <div>
      {activeView === 'hotel' ? (
        <ShowReservationHotel />
      ) : (
        <ShowReservation />
      )}
    </div>
  );
}


/**
 * The main page component for showing reservation details.
 * It uses React Suspense to handle the loading of URL search parameters.
 */
export default function ReservationDetailPage() {
  return (
    <Suspense fallback={<div className="text-center p-8">Loading Details...</div>}>
      <DetailView />
    </Suspense>
  );
}
