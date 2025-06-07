// app/dashboard/reservations/page.tsx
"use client"

import { useState } from "react"
import { ReportsTableIncome } from "@/components/views/reports/reports-table-income"
import { ReportsTableExpense } from "@/components/views/reports/reports-table-expense"
import { ReportsMetrics } from "@/components/views/reports/reports-metrics"

export default function ReportsPage() {
  return (
    <div className="space-y-4 mt-4">
      <ReportsMetrics />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ReportsTableIncome />
        <ReportsTableExpense />
      </div>
    </div>
  )
}