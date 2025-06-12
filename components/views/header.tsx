"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { Bell, User, ChevronDown, CircleUserRound } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useIsMobile } from "@/hooks/use-mobile"
import { User as UserType } from "@/types/userType";
// import { useUser } from "@/app/context/UserContext"

// Using the same navItems from sidebar.tsx but with proper route patterns
const navItems = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Reservations", href: "/dashboard/reservations" },
  { name: "Invoices", href: "/dashboard/invoices" },
  { name: "History", href: "/dashboard/history" },
  { name: "Reports", href: "/dashboard/reports" },
  { name: "Settings", href: "/dashboard/settings" },
  { name: "Add Reservation", href: "/dashboard/reservations/add" },
]
// type userData = {
//     id: string;
//     username: string;
//     email: string;
//     role: string;
//     exp: number;
// } | null;
export function Header({user} : { user: UserType }) {
  const pathname = usePathname()
  const [date] = useState(() => new Date())
  const [relativeTime, setRelativeTime] = useState("")
  const isMobile = useIsMobile()
  // const user = useUser()
  // localStorage.setItem("user", JSON.stringify(user)) // Store user data in localStorage for debugging
  // Determine the active nav item's title with support for dynamic routes
  const getPageTitle = () => {
    // Check for exact matches first
    const exactMatch = navItems.find(item => item.href === pathname)
    if (exactMatch) return exactMatch.name

    // Check for reservation detail page
    if (pathname.match(/^\/dashboard\/reservations\/[^\/]+$/)) {
      return "Reservation Details"
    }
    
    // Check for reservation update page
    if (pathname.match(/^\/dashboard\/reservations\/[^\/]+\/update$/)) {
      return "Update Reservation"
    }
    // Check for reservation detail page
    if (pathname.match(/^\/dashboard\/invoices\/[^\/]+$/)) {
      return "Invoice Details"
    }
    
    // Check for reservation update page
    if (pathname.match(/^\/dashboard\/invoices\/[^\/]+\/update$/)) {
      return "Update Invoice"
    }

    // Default title
    return "SITRAVEL"
  }

  const title = getPageTitle()

  // Format the current date
  const formattedDate = new Intl.DateTimeFormat("id-ID", {
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
  // console.log("User data: ", user);

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

        {/* <button className="p-2 rounded-full bg-[#f5f5f5] hover:bg-[#5D5D5D]">
          <Bell size={20} className="text-[#3D3D3D]" />
        </button> */}
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-[#377dec]">
            <CircleUserRound className="text-white h-8 w-8" />
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium hidden md:inline">{ user?.username }</span>

        {/* <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-[#377dec]">
                <CircleUserRound className="text-white h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium hidden md:inline">{ user?.username }</span>
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
        </DropdownMenu> */}
      </div>
    </header>
  )
}
