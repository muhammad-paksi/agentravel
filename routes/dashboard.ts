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
                    date: { $gte: nineMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$date' },
                        month: { $month: '$date' }
                    },
                    totalReservations: { $sum: 1 }
                }
            },
            {
                $sort: {
                    '_id.year': 1,
                    '_id.month': 1
                }
            }
        ]);

        // Format monthly data
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        
        const formattedMonthlyReservations = monthlyReservations.map(item => ({
            monthName: monthNames[item._id.month - 1],
            totalReservations: item.totalReservations
        }));

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
                monthlyReservations: formattedMonthlyReservations,
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