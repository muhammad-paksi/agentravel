import Reservasi from '@/database/model/reservasi';
import Invois from '@/database/model/invois';
import Laporan from '@/database/model/laporan';
import { Hono } from 'hono';

const dashboard = new Hono();

dashboard.get('/dashboard-stats', async (c) => {
    try {
        // 1. Total Reservations
        const totalReservations = await Reservasi.countDocuments();

        // 2. Ongoing Reservations (status = Booked)
        const pendingReservations = await Reservasi.countDocuments({ 
            status: 'Booked' 
        });

        // 3. Unpaid Invoices
        const unpaidInvoices = await Invois.countDocuments({ 
            status: 'Unpaid' 
        });

        // 4. Monthly Revenue (from income reports)
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        const monthlyRevenueResult = await Laporan.aggregate([
            {
                $match: {
                    type: 'Income',
                    createdAt: {
                        $gte: new Date(currentYear, currentMonth, 1),
                        $lt: new Date(currentYear, currentMonth + 1, 1)
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$amount' }
                }
            }
        ]);
        const monthlyRevenue = monthlyRevenueResult.length > 0 ? monthlyRevenueResult[0].totalRevenue : 0;

        // 5. Monthly Reservations Data
        const nineMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);
        nineMonthsAgo.setHours(0, 0, 0, 0);
        
        let monthlyReservations = await Reservasi.aggregate([
          {
            $match: {
              departure_date: { $gte: nineMonthsAgo },
              status: { $ne: "Canceled" } // ambil yang status-nya BUKAN Canceled
            }
          },
          {
            $group: {
              _id: {
                year: { $year: '$departure_date' },
                month: { $month: '$departure_date' }
              },
              totalReservations: { $sum: 1 }
            }
          },
          {
            $project: {
              _id: 0,
              year: '$_id.year',
              month: '$_id.month',
              totalReservations: 1,
              monthName: {
                $switch: {
                  branches: [
                    { case: { $eq: ['$_id.month', 1] }, then: 'Januari' },
                    { case: { $eq: ['$_id.month', 2] }, then: 'Februari' },
                    { case: { $eq: ['$_id.month', 3] }, then: 'Maret' },
                    { case: { $eq: ['$_id.month', 4] }, then: 'April' },
                    { case: { $eq: ['$_id.month', 5] }, then: 'Mei' },
                    { case: { $eq: ['$_id.month', 6] }, then: 'Juni' },
                    { case: { $eq: ['$_id.month', 7] }, then: 'Juli' },
                    { case: { $eq: ['$_id.month', 8] }, then: 'Agustus' },
                    { case: { $eq: ['$_id.month', 9] }, then: 'September' },
                    { case: { $eq: ['$_id.month', 10] }, then: 'Oktober' },
                    { case: { $eq: ['$_id.month', 11] }, then: 'November' },
                    { case: { $eq: ['$_id.month', 12] }, then: 'Desember' }
                  ],
                  default: 'Tidak Diketahui'
                }
              }
            }
          },
          {
            $sort: {
              year: 1,
              month: 1
            }
          }
        ]);
        
        // Mengisi bulan yang tidak ada data dengan totalSales 0
        const reservationMap = new Map();
        monthlyReservations.forEach(reservasi => {
          const key = `${reservasi.year}-${reservasi.month}`;
          reservationMap.set(key, reservasi.totalReservations);
        });
    
        const result = [];
        for (let i = 0; i < 9; i++) {
          const date = new Date(today.getFullYear(), today.getMonth() - (8 - i), 1);
          const year = date.getFullYear();
          const month = date.getMonth() + 1; // getMonth() is 0-indexed
          const monthName = new Date(year, month - 1).toLocaleString('id-ID', { month: 'short' });
          const key = `${year}-${month}`;
          const totalReservations = reservationMap.get(key) || 0; // Jika tidak ada data, anggap 0
    
          result.push({
            year,
            monthName,
            totalReservations,
          });
        }
      monthlyReservations = result;

        // 6. Latest Reservations
        const latestReservations = await Reservasi.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        return c.json({
            status: "berhasil",
            data: {
                totalReservations,
                pendingReservations,
                unpaidInvoices,
                monthlyRevenue,
                monthlyReservations,
                latestReservations
            }
        });

    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        return c.json({ 
            status: "gagal",
            message: "Gagal mengambil data dashboard" 
        }, 500);
    }
});

export default dashboard;