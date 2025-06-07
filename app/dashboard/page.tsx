// 'use client';

import { DashboardContent } from "@/components/views/dashboard-content";
import { cookies } from "next/headers";
import { Suspense } from "react";

// import { useState, useEffect } from 'react';

export default async function Dashboard() {
    // const [dashboardData, setDashboardData] = useState({
    //     totalReservations: 0,
    //     pendingReservations: 0,
    //     unpaidInvoices: 0,
    //     monthlyRevenue: 0, 
    //     monthlyReservations: [],
    //     latestReservations: [],
    // });
    // const [loading, setLoading] = useState(true);
    // const [error, setError] = useState<string | null>(null);
    // const stored = localStorage.getItem('user');
    // const user = stored ? JSON.parse(stored) : null;

    // useEffect(() => {
        // console.log("Dashboard useEffect called");
        // const fetchData = async () => {
            // try {
            //     setLoading(true);
            //     setError(null);
            const dashboardRes = await fetch('http://localhost:3000/api/dashboard-stats', {
                credentials: 'include',
            });
            // if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const dashboardData = await dashboardRes.json();
            // console.log("DashboarData: ", dashboardData)
            const cookie = await cookies();
            // const data = (await cookies()).get('token')?.value
            const user = {
                id: cookie.get('id')?.value || '',
                username: cookie.get('username')?.value || '',
                email: cookie.get('email')?.value || '',
            }
                // setDashboardData(data); // Langsung ganti state
            // } catch (err) {
            //     console.error('Failed to fetch dashboard data:', err);
            //     setError('Failed to fetch data');
            // } finally {
            //     setLoading(false);
            // }
        // };
    
        // fetchData();
    // }, []); // [] => hanya dipanggil sekali setelah render pertama
    
    // if (loading) return <p>Loading...</p>;
    // if (error) return <p>Error: {error}</p>;
    
    return (
        <Suspense fallback={<p>Loading dashboard...</p>}>
            <DashboardContent dashboardData={dashboardData} user={user} />
        </Suspense>
    );
}