import { DashboardContent } from "@/components/views/dashboard-content";
import { cookies } from "next/headers";
import { Suspense } from "react";

export default async function Dashboard() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
  const dashboardRes = await fetch(`${baseUrl}/api/dashboard-stats`, {
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
          <DashboardContent user={user} />
      </Suspense>
  );
}