"use client"

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useIsMobile } from "@/hooks/use-mobile"
import { CalendarDays, Ticket, ReceiptText, CircleDollarSign, TrendingUp } from "lucide-react";
// import { useUser } from '@/app/context/UserContext';
import { capitalizeWord } from "@/lib/capitalize";
import { DashboardData } from "@/types/dashboardData";
import { User } from "@/types/userType";
import { getStatusClasses, STATUS_BASE_CLASSES } from "../ui/status-badge";

let data = [
  // { name: "Apr", value: 20 },
  // { name: "May", value: 120 },
  // { name: "Jun", value: 280 },
  // { name: "Jul", value: 240 },
  // { name: "Aug", value: 480 },
  // { name: "Sep", value: 360 },
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

export function DashboardContent(
  { dashboardData, user } : 
  { dashboardData: DashboardData, user: { id: string; username: string; email: string;} } // Replace 'any' with the actual type of user if available
) {
  // const user = useUser();
  const isMobile = useIsMobile();
  // new Promise((resolve) => setTimeout(resolve, 3000));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  let dataSales = [];
  dataSales = dashboardData.monthlyReservations.map((item) => ({
    name: item.monthName,
    value: item.totalReservations,
  }))
  data = dataSales;
  // console.log(dataSales)
  // 🚀 Fetch live reservation count
  // const [totalReservations, setTotalReservations] = useState(0);
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
      value: dashboardData.monthlyRevenue.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }),
      icon: <CircleDollarSign className="text-white"/>,
    },
  ]

  return (
    <main className="bg-background min-h-screen space-y-5">
      {/* Greeting Banner (no card) */}
      <div>
        <h1 className="text-xl font-semibold mb-2">Hello! Good morning, { capitalizeWord(user?.username) || 'Musfiq'}</h1>
        <p className="text-sm text-gray-500/70 mb-6">Great service starts with great management. Keep up the good work!</p>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m) => (
          <Card key={m.title} className="bg-white rounded-2xl shadow-md border-0">
              <CardContent className="flex items-center justify-between p-4">
                
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">{m.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{m.value}</p>
                  </div>
                  <div className={"p-2 rounded-lg bg-[#377dec]"}>{m.icon}</div>
                
              </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics & Recent Reservations */}
      {/* <Card className="bg-grey-100 border-0"> */}
        
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
                      data={data}
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
                        tickLine={false}       // Mengatur apakah garis tick kecil terlihat
                        axisLine={false}       // Mengatur apakah garis sumbu Y utama terlihat
                        tickMargin={8}         // Jarak antara tick label dan garis sumbu
                        allowDecimals={false}
                        // domain={['dataMin - 50', 'dataMax + 50']} // Opsional: Mengatur rentang nilai minimum dan maksimum
                        padding={{ top: 20, bottom: 10 }} // Memberi ruang di atas dan bawah nilai data
                        // ticks={[0, 5, 10, 15, 20, 25]} // Opsional: Menentukan secara manual nilai tick yang ditampilkan
                        tickCount={5} // Opsional: Menyarankan jumlah tick yang diinginkan
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
                      {/* <tr>
                        <td className="px-4 py-3 text-sm text-gray-800">Satria Abrar</td>
                        <td className="px-4 py-3 text-sm text-gray-800">Bali</td>
                        <td className="px-4 py-3 text-sm text-gray-800">Rp. 250.000</td>
                        <td className="px-4 py-3">
                          <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Booked</span>
                        </td>
                      </tr> */}
                      { dashboardData.latestReservations.map(( reservation, index ) => (
                        <tr key={ index }>
                          <td className="px-4 py-3 text-sm text-gray-700">{ reservation.name }</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{ reservation.destination }</td>
                          <td className="px-4 py-3 text-sm text-gray-700">Rp. { reservation.total_price.toLocaleString("id-ID") || 0 }</td>
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
                      ))}
                    </tbody>
                  </table>
                </CardContent>
            </Card>
          </div>
        </div>
      {/* </Card> */}
    </main>
  )
}
