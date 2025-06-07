"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, CalendarClock, FileText, History, BarChart3, Settings, LogOut, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"

export function Sidebar() {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const [isOpen, setIsOpen] = useState(false)

  // Close the mobile sidebar when navigating to a new page
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Reservations", href: "/dashboard/reservations", icon: CalendarClock },
    { name: "Invoices", href: "/dashboard/invoices", icon: FileText },
    { name: "History", href: "/dashboard/history", icon: History },
    { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
  ]

  const isActiveRoute = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href
    }
    
    // For other routes, check if pathname starts with the href
    // This ensures sub-routes like /dashboard/reservations/add still highlight the Reservations nav item
    return pathname.startsWith(href)
  }

  const SidebarContent = () => (
    <div className="w-full h-full flex flex-col bg-[#377dec] text-white">
      <div className="p-4 mt-3 mb-5 flex items-center justify-center gap-3">
        <img src="/img/logo.svg" alt="Logo" className="h-7 w-7" />
        <span className="font-bold text-xl">SITRAVEL</span>
      </div>

      <nav className="flex-1 p-2 overflow-y-auto flex flex-col items-center">
        <ul className="flex flex-col space-y-2 w-full max-w-[200px]">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center text-bold gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive ? "bg-white text-[#377dec] font-bold" : "hover:bg-white/10"
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-[#5a93e8]">
        <button className="flex items-center gap-3 px-3 py-2 w-full rounded-md hover:bg-white/10 transition-colors"
          onClick={() => {
            // Handle logout logic here
            fetch('/api/signout', {
              method: 'GET',
            })
            .then(res => res.json())
            .then((res) => {
              if (!res.loggedIn) {
                window.location.href = '/' // Redirect to home after logout
              } else {
                console.error("Logout failed:", res.message)
              }
            })
          }}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )

  // Mobile sidebar using Sheet component
  if (isMobile) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-3 left-3 z-50 text-[#377dec] bg-white rounded-full shadow-md"
          onClick={() => setIsOpen(true)}
        >
          <Menu size={20} />
          <span className="sr-only">Open menu</span>
        </Button>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent side="left" className="p-0 w-[250px] border-r-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </>
    )
  }

  // Desktop sidebar
  return (
    <div className="hidden md:block w-[220px] h-full">
      <SidebarContent />
    </div>
  )
}