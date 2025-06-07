// app/dashboard/reservations/page.tsx
"use client"

import { HistoryTable } from "@/components/views/history/HistoryTable"

export default function ReservationsPage() {
  return (
    <div className="space-y-4 mt-4">
      <HistoryTable />
    </div>
  )
}
