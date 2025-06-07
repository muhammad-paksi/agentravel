import { DashboardContent } from "@/components/views/dashboard-content";
import { cookies } from "next/headers";
import { Suspense } from "react";

export default async function Dashboard() {
    const dashboardRes = await fetch('http://localhost:3000/api/dashboard-stats', {
        credentials: 'include',
    });

    const dashboardData = await dashboardRes.json(); 
    const cookie = await cookies();
            
    const user = {
        id: cookie.get('id')?.value || '',
        username: cookie.get('username')?.value || '',
        email: cookie.get('email')?.value || '',
    }
    
    return (
        <Suspense fallback={<p>Loading dashboard...</p>}>
            <DashboardContent dashboardData={dashboardData} user={user} />
        </Suspense>
    );
}