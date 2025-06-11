"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useIsMobile } from "@/hooks/use-mobile"
import { CalendarDays, Ticket, ReceiptText, CircleDollarSign } from "lucide-react";
import { capitalizeWord } from "@/lib/capitalize";
import { getStatusClasses, STATUS_BASE_CLASSES } from "../ui/status-badge";
import { DashboardData } from "@/types/dashboardData";

let data = [
  { name: "Oct", value: 420 },
  { name: "Nov", value: 300 },
  { name: "Dec", value: 500 },
]

const chartConfig = {
  value: {
    label: "Reservation: ",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function DashboardContent({ user }: { user: { id: string; username: string; email: string } }) {
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalReservations: 0,
    pendingReservations: 0,
    unpaidInvoices: 0,
    monthlyRevenue: 0,
    monthlyReservations: [],
    latestReservations: []
  });

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const response = await fetch('/api/dashboard-stats');
        const json = await response.json();
        
        if (json.status === "berhasil") {
          setDashboardData(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const metrics = [
    {
      title: "Total Reservations",
      value: dashboardData.totalReservations.toString(),
      icon: <CalendarDays className="text-white"/>,
    },
    {
      title: "Ongoing Reservations",
      value: dashboardData.pendingReservations.toString(),
      icon: <Ticket className="text-white"/>,
    },
    {
      title: "Unpaid Invoices",
      value: dashboardData.unpaidInvoices.toString(),
      icon: <ReceiptText className="text-white"/>,
    },
    {
      title: "Revenue This Month",
      value: dashboardData.monthlyRevenue.toLocaleString('id-ID', { 
        style: 'currency', 
        currency: 'IDR', 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 0 
      }),
      icon: <CircleDollarSign className="text-white"/>,
    },
  ];

  // Format chart data
  const chartData = dashboardData.monthlyReservations.length > 0 
    ? dashboardData.monthlyReservations.map(item => ({
        name: item.monthName,
        value: item.totalReservations
      }))
    : data;

  return (
    <main className="bg-background min-h-screen space-y-5">
      {/* Greeting Banner */}
      <div>
        <h1 className="text-xl font-semibold mb-2">Hello! Good morning, {capitalizeWord(user?.username) || 'Musfiq'}</h1>
        <p className="text-sm text-gray-500/70 mb-6">Great service starts with great management. Keep up the good work!</p>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m) => (
          <Card key={m.title} className="bg-white rounded-2xl shadow-md border-0">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">{m.title}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : m.value}
                </p>
              </div>
              <div className={"p-2 rounded-lg bg-[#377dec]"}>{m.icon}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics & Recent Reservations */}
      <div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart Panel */}
          <Card className="bg-white rounded-2xl shadow-md border-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">Monthly Reservations Statistics</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 p-4 overflow-x-auto">
              <div className="h-[300px]">
                <ChartContainer config={chartConfig} className="min-h-[200px] w-full bg-var(--chart-1)">
                  <AreaChart
                    accessibilityLayer
                    data={chartData}
                    margin={{
                      left: 12,
                      right: 12,
                      top: 20,
                      bottom: 10,
                    }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => value.slice(0, 3)}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      allowDecimals={false}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="line" />}
                    />
                    <Area
                      dataKey="value"
                      type="natural"
                      fill="var(--chart-2)"
                      fillOpacity={0.4}
                      stroke="var(--chart-1)"
                    />
                  </AreaChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Reservations Table */}
          <Card className="bg-white rounded-2xl shadow-md border-0">
            <CardHeader className="pb-2 flex justify-between">
              <CardTitle className="text-base font-semibold">Recent Reservations</CardTitle>
              <a href="./dashboard/reservations" className="text-sm text-blue-600 hover:underline text-right">See All</a>
            </CardHeader>
            <CardContent className="pt-0 p-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-800 uppercase">Customer</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-800 uppercase">Destination</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-800 uppercase">Price</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-800 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-sm text-center text-gray-700">
                        Loading...
                      </td>
                    </tr>
                  ) : dashboardData.latestReservations.length > 0 ? (
                    dashboardData.latestReservations.map((reservation, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm text-gray-700">{reservation.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{reservation.destination}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          Rp. {reservation.total_price?.toLocaleString("id-ID") || 0}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`${STATUS_BASE_CLASSES} ${getStatusClasses(
                              reservation.status
                            )}`}
                          >
                            {reservation.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-sm text-center text-gray-700">
                        No recent reservations
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}