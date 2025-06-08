import { HistoryTable } from "@/components/views/history/HistoryTable"

export default function ReservationsPage() {
  return (
    <>
      <div className="space-y-4 mt-4">
        <HistoryTable />
      </div>
      <div>
        <p className="text-sm text-gray-500 mt-2">
          Menampilkan data history.
        </p>
      </div>
    </>
  )
}