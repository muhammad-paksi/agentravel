"use client"

import { Card, CardContent } from "@/components/ui/card"
import { CalendarDays, ClipboardList, ArrowUp, ArrowDown } from "lucide-react"
import { useReportForm } from "@/hooks/useReportForm"

export function ReportsMetrics() {
    const { loading, reports } = useReportForm("Income")

    const totalTransactions = reports.length;

    const totalIncome = reports
        .filter(r => r.type === "Income")
        .reduce((sum, r) => sum + r.amount, 0)

    const totalExpenses = reports
        .filter(r => r.type === "Expense")
        .reduce((sum, r) => sum + r.amount, 0)

    const revenueThisMonth = (() => {
        const now = new Date()
        const currentMonth = now.getMonth()
        const currentYear = now.getFullYear()

        return reports
            .filter(r => {
                if (r.type !== "Income") return false
                const date = new Date(r.createdAt || 0)
                return date.getMonth() === currentMonth && date.getFullYear() === currentYear
            })
            .reduce((sum, r) => sum + r.amount, 0)
    })()

    const formatCurrency = (amount: number) =>
        "Rp " + amount.toLocaleString("id-ID")

    const metrics = [
        {
            title: "Total Transactions",
            value: (totalTransactions),
            icon: <ClipboardList className="text-white" />,
        },
        {
            title: "Revenue This Month",
            value: formatCurrency(revenueThisMonth),
            icon: <CalendarDays className="text-white" />,
        },
        {
            title: "Income",
            value: formatCurrency(totalIncome),
            icon: <ArrowDown className="text-white" />,
        },
        {
            title: "Expense",
            value: formatCurrency(totalExpenses),
            icon: <ArrowUp className="text-white" />,
        },
    ]

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {metrics.map(m => (
                <Card key={m.title} className="bg-white rounded-2x2 shadow-md border-0">
                    <CardContent className="flex items-center justify-between p-4">
                        <div>
                            <p className="text-xs font-medium text-gray-600 mb-1">{m.title}</p>
                            <p className="text-2xl font-bold text-gray-900">{loading ? "..." : m.value}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-[#377dec]">{m.icon}</div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}