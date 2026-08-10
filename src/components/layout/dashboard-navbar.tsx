"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BarChart2, FileText, Inbox, Calendar, Menu, User, Settings, LogOut, Sparkles, MessageSquare } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export function DashboardNavbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Fetch user profile
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        setUserEmail(user.email)
      }
    }
    fetchUser()

    // Scroll listener on the layout's scroll container
    const scrollContainer = document.getElementById("dashboard-scroll-area")
    if (!scrollContainer) return

    const handleScroll = () => {
      setIsScrolled(scrollContainer.scrollTop > 20)
    }

    scrollContainer.addEventListener("scroll", handleScroll)
    return () => scrollContainer.removeEventListener("scroll", handleScroll)
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const initial = userEmail ? userEmail.charAt(0).toUpperCase() : "U"

  const navLinks = [
    { name: "Analytics", href: "/dashboard", icon: BarChart2 },
    { name: "Content", href: "/content", icon: MessageSquare },
    { name: "Planning", href: "/calendar", icon: Calendar },
    { name: "Reporting", href: "/reporting", icon: FileText },
    { name: "Inbox", href: "/inbox", icon: Inbox },
  ]

  return (
    <header className="sticky top-0 z-50 w-full pt-4 px-4 pb-2 md:px-6">
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={cn(
          "relative flex items-center justify-between h-16 w-full px-6 rounded-2xl transition-all duration-500 ease-in-out",
          isScrolled 
            ? "bg-orange-50/80 backdrop-blur-xl shadow-lg border border-orange-200/50"
            : "bg-orange-50/40 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-orange-200/30"
        )}
      >
        
        {/* Left - Logo and Name */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md shadow-orange-200/50">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
            SyncFlow
          </span>
        </div>

        {/* Middle - Navigation (Floating Island) */}
        <nav className="hidden lg:flex items-center absolute left-1/2 -translate-x-1/2 bg-slate-100/50 p-1.5 rounded-xl border border-slate-200/50">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link 
                key={link.name}
                href={link.href} 
                className={cn(
                  "relative flex items-center gap-2 h-10 px-5 rounded-lg font-medium text-[15px] transition-colors duration-300 z-10",
                  isActive ? "text-orange-600" : "text-slate-500 hover:text-slate-800"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="navbar-active-pill"
                    className="absolute inset-0 bg-white rounded-lg shadow-sm border border-slate-200/50 -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <link.icon className={cn("w-4 h-4", isActive ? "text-orange-500" : "opacity-70")} />
                {link.name}
              </Link>
            )
          })}
        </nav>

        {/* Right - Profile & Mobile Menu */}
        <div className="flex items-center gap-4">
          <Button 
            onClick={() => toast("Upgrade modal coming soon!")} 
            className="hidden sm:flex bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white font-semibold rounded-full px-5 h-9 text-[13px] shadow-md shadow-slate-200 hover:shadow-lg transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-300" />
            Upgrade
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-orange-700 font-bold overflow-hidden border border-orange-200 shadow-sm hover:ring-2 hover:ring-orange-500/30 hover:scale-105 transition-all outline-none">
              {initial}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl p-2 shadow-xl" style={{ background: "rgba(255,255,255,0.25)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)", border: "1px solid rgba(249,115,22,0.4)", boxShadow: "0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(249,115,22,0.15) inset" }}>
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-normal px-2 py-1.5">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold leading-none text-gray-900">My Account</p>
                    <p className="text-xs leading-none text-gray-700 truncate font-medium">
                      {userEmail || "Loading..."}
                    </p>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="my-1.5 bg-orange-200/50" />
              <DropdownMenuItem onClick={() => toast("Profile page coming soon!")} className="cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold text-gray-900 focus:bg-white/40">
                <User className="mr-2 h-4 w-4 text-orange-500" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast("Settings coming soon!")} className="cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold text-gray-900 focus:bg-white/40">
                <Settings className="mr-2 h-4 w-4 text-orange-500" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1.5 bg-orange-200/50" />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600 focus:bg-red-50/50 cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold">
                <LogOut className="mr-2 h-4 w-4 opacity-90" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={() => toast("Mobile menu coming soon!")} variant="ghost" size="icon" className="text-slate-600 hover:text-slate-900 lg:hidden hover:bg-slate-100 rounded-full">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </motion.div>
    </header>
  )
}
