"use client"

import { Search, Settings2Icon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { useReportForm } from "@/hooks/useReportForm"
import { useIsMobile } from "@/hooks/use-mobile"
import { format } from "date-fns"
import { id } from "date-fns/locale"

export function ReportsTableExpense() {
    const isMobile = useIsMobile();
    const {
        loading,
        searchQuery,
        setSearchQuery,
        amountRange,
        setAmountRange,
        filteredReports
    } = useReportForm("Expense")

    const formatCurrency = (amount: number) => 
        `Rp${amount.toLocaleString("id-ID")}`

    const formatDate = (dateString: string) => {
        const d = new Date(dateString)
        const day = d.getDate()
        const month = d.getMonth() + 1
        const year = d.getFullYear()
        return `${day}/${month}/${year}`
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-2">Expense Reports</h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
                <h3 className="text-sm text-gray-500 mb-2 sm:mb-0">
                    {filteredReports.length} Expense Reports
                </h3>
                <div className="flex items-center space-x-2">
                    <div className="relative inline-block">
                        <Search className="absolute left-2 top-3 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-10 h-10 w-30"
                        />
                    </div>
                    <Select value={amountRange} onValueChange={setAmountRange}>
                        <SelectTrigger className="h-10 border border-gray-300 px-3 py-2 flex items-center space-x-2">
                            <Settings2Icon className="h-5 w-5 text-gray-400" />
                            { !isMobile && <span className="text-gray-400">Filter</span> }
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Amounts</SelectItem>
                            <SelectItem value="lt1jt">Less than Rp1.000.000</SelectItem>
                            <SelectItem value="1to5jt">Rp1.000.000 – Rp5.000.000</SelectItem>
                            <SelectItem value="gt5jt">More than Rp5.000.000</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="overflow-x-auto bg-white rounded-xl shadow">
                <table className="min-w-full rounded-lg bg-white overflow-hidden">
                    <thead className="bg-gray-300">
                        <tr>
                            <th className="px-4 py-2 text-left">Date</th>
                            <th className="px-4 py-2 text-left">Amount</th>
                            <th className="px-4 py-2 text-left">Description</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={3} className="px-4 py-2 text-center">Please wait, loading...</td>
                            </tr>
                        ) : filteredReports.length ? (
                            filteredReports.map(r => (
                                <tr key={r._id}>
                                    <td className="px-4 py-2 h-13">{r.createdAt ? formatDate(r.createdAt) : '-'}</td>
                                    <td className="px-4 py-2 h-13">{formatCurrency(r.amount)}</td>
                                    <td className="px-4 py-2 h-13">{r.description}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={3} className="px-4 py-2 text-center">No expense reports found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}