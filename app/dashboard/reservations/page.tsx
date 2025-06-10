"use client"

import { useState } from "react"
import ReservationsDataTable from "@/components/views/reservations/ReservationDataTable"
import ReservationsDataTableHotel from "@/components/views/reservations/ReservationDataTableHotel"
import { Button } from "@/components/ui/button"
import { Plane, House } from "lucide-react"

export default function ReservationsPage() {
  const [activeTab, setActiveTab] = useState<"flight" | "hotel">("flight")

  return (
    <div className="space-y-4">
      <div className="flex w-full mb-4 bg-white rounded-md p-1">
        <Button
          variant="ghost"
          onClick={() => setActiveTab("flight")}
          className={`flex-1 font-semibold text-lg rounded-md ${
            activeTab === "flight" ? "bg-[#377dec] text-white hover:bg-blue-600" : "text-gray-500 hover:text-gray-400"
          }`}
        >
          <Plane className="mr-2 h-4 w-4" />
          Flight
        </Button>
        <Button
          variant="ghost"
          onClick={() => setActiveTab("hotel")}
          className={`flex-1 font-semibold text-lg rounded-md ${
            activeTab === "hotel" ? "bg-[#377dec] text-white hover:bg-blue-600" : "text-gray-500 hover:text-gray-400"
          }`}
        >
          <House className="mr-2 h-4 w-4" />
          Hotel
        </Button>
      </div>

      <div className="mt-4">
        <h2 className="text-lg font-semibold mt-7 mb-2">
          {activeTab === "flight" ? "Flight Reservations" : "Hotel Reservations"}
        </h2>

        {/* Menampilkan komponen berdasarkan tab aktif */}
        {activeTab === "flight" ? (
          <ReservationsDataTable />
        ) : (
          <ReservationsDataTableHotel />
        )}

        {/* Catatan tentang tab yang dipilih */}
        <p className="text-sm text-gray-500 mt-2">
        Displays {activeTab === "flight" ? "trip" : "hotel"} reservation data.
        </p>
      </div>
    </div>
  )
}
