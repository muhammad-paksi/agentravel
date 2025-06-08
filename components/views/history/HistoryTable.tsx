"use client"

import { useMemo, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search, Settings2Icon } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useHistoryForm } from "@/hooks/useHistoryForm"
import { getTypeClasses, TYPE_BASE_CLASSES } from "@/components/ui/status-badge"

export function HistoryTable() {
  const { histories, loading } = useHistoryForm()
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const isMobile = useIsMobile()

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return histories
      .filter((h) => {
        const refId = String(h.reference_id).toLowerCase()
        const matchesSearch =
          refId.includes(q) ||
          h.description.toLowerCase().includes(q) ||
          h.actor.toLowerCase().includes(q)
        const matchesType = typeFilter === "all" || h.reference_type === typeFilter
        return matchesSearch && matchesType
      })
      // Urutkan berdasarkan tanggal (terbaru ke terlama)
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime()
        const dateB = new Date(b.date).getTime()
        return dateB - dateA
      })
  }, [histories, searchQuery, typeFilter])

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
        <h3 className="text-sm text-gray-500 mb-2 sm:mb-0">
          {histories.length} History
        </h3>
        <div className="flex items-center space-x-2">
          <div className="relative inline-block">
            <Search className="absolute left-2 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search reference, description, actor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 w-fit"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-10 border border-gray-300 px-3 py-2 flex items-center space-x-2">
              <Settings2Icon className="h-5 w-5 grayscale-50" />
              <span>Filter</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Type</SelectItem>
              <SelectItem value="Reservation">Reservation</SelectItem>
              <SelectItem value="Invoice">Invoice</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="min-w-full rounded-lg bg-white overflow-hidden">
          <thead className="bg-gray-300">
            <tr>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">Description</th>
              <th className="px-4 py-2 text-left">Actor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-2 text-center">Please wait, loading...</td>
              </tr>
            ) : filtered.length ? (
              filtered.map((h, index) => (
                <tr key={h._id}>
                  <td className="px-4 py-2 h-13">{formatDate(h.date)}</td>
                  <td className="px-4 py-2 h-13">
                    <span className={`${TYPE_BASE_CLASSES} ${getTypeClasses(h.reference_type)}`}>
                      {h.reference_type}
                    </span>
                  </td>
                  <td className="px-4 py-2 h-13">{h.description}</td>
                  <td className="px-4 py-2 h-13">{h.actor}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-2 text-center">No history found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}