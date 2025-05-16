"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { Bell, User, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useIsMobile } from "@/hooks/use-mobile"

// Using the same navItems from sidebar.tsx
const navItems = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Reservations", href: "/dashboard/reservations" },
  { name: "Invoices", href: "/dashboard/invoices" },
  { name: "History", href: "/dashboard/history" },
  { name: "Reports", href: "/dashboard/reports" },
  { name: "Settings", href: "/dashboard/settings" },
  { name: "Add Flight Reservation", href: "/dashboard/reservations/add" },
  { name: "Details Reservation", href: "/dashboard/reservations/${r._id}" },
  { name: "Edit Reservation", href: "/dashboard/reservations/edit/${r._id}" },
]

export function Header() {
  const pathname = usePathname()
  const [date] = useState(() => new Date())
  const [relativeTime, setRelativeTime] = useState("")
  const isMobile = useIsMobile()

  // Determine the active nav item's title
  const activeItem = navItems.find(item => item.href === pathname)
  const title = activeItem ? activeItem.name : "SITRAVEL"

  // Format the current date
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date)

  // Update relative time every minute
  useEffect(() => {
    const updateRelative = () => {
      setRelativeTime(
        formatDistanceToNow(date, { addSuffix: true })
      )
    }

    updateRelative()
    const interval = setInterval(updateRelative, 60_000)
    return () => clearInterval(interval)
  }, [date])

  return (
    <header className="h-20 border-b border-[#e7e7e7] bg-white flex items-center justify-between px-4 md:px-6">
      <div className={isMobile ? "ml-10" : ""}>
        <h1 className="text-xl font-bold truncate">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Moved the formatted date here, to the left of the notification button */}
        <p className="text-sm text-[#888888] hidden sm:block">
          {formattedDate}
        </p>

        <button className="p-2 rounded-full bg-[#f5f5f5] hover:bg-[#5D5D5D]" title="Notification">
          <Bell size={20} className="text-[#3D3D3D]" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-[#377dec] text-white">ST</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium hidden md:inline">Admin</span>
            <ChevronDown size={16} className="text-[#888888] hidden md:inline" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}