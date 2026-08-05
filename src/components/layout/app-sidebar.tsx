"use client"

import * as React from "react"
import {
  FileText,
  Camera,
  Globe,
  Play as Youtube,
  Briefcase,
  Music,
  Plus,
  BarChart,
  FileBarChart,
  Hash,
  Settings,
  Lightbulb
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator
} from "@/components/ui/sidebar"
import Link from "next/link"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { toast } from "sonner"
import { getAccounts, addAccount } from "@/app/actions/accounts"

const navItems = {
  main: [
    { title: "Summary", url: "/dashboard", icon: FileText, active: true },
    { title: "Ideas", url: "/ideas", icon: Lightbulb },
  ],
  networks: [
    { title: "Instagram", url: "#", icon: Camera, color: "text-pink-500", brand: true },
    { title: "Facebook", url: "#", icon: Globe, color: "text-blue-600", brand: true },
    { title: "TikTok", url: "#", icon: Music, color: "text-black dark:text-white", brand: true },
    { title: "YouTube", url: "#", icon: Youtube, color: "text-red-500", brand: true },
    { title: "LinkedIn", url: "#", icon: Briefcase, color: "text-[#0A66C2]", brand: true },
  ],
  secondary: [
    { title: "Reporting", url: "/reporting", icon: BarChart, badge: "New" },
    { title: "Reports", url: "/reporting/campaigns", icon: FileBarChart },
    { title: "Hashtag Tracker", url: "/reporting/studio", icon: Hash },
    { title: "Brand settings", url: "/settings", icon: Settings },
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const currentNetwork = searchParams.get("network")
  const currentAccount = searchParams.get("account")

  const [accounts, setAccounts] = React.useState<Record<string, string[]>>({})
  
  const [activeAccounts, setActiveAccounts] = React.useState<Record<string, string>>({})
  
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [selectedNetwork, setSelectedNetwork] = React.useState<any>(null)
  const [userIdInput, setUserIdInput] = React.useState("")

  React.useEffect(() => {
    async function loadAccounts() {
      try {
        const data = await getAccounts();
        if (data) {
          const accs: Record<string, string[]> = {};
          const active: Record<string, string> = {};
          data.forEach(acc => {
            if (!accs[acc.network]) accs[acc.network] = [];
            accs[acc.network].push(acc.account_handle);
            if (!active[acc.network]) active[acc.network] = acc.account_handle;
          });
          setAccounts(accs);
          setActiveAccounts(active);
        }
      } catch (err) {
        console.error("Failed to load accounts", err);
      }
    }
    loadAccounts();

    const handleOpenBrandModal = (e: any) => {
      const title = e.detail?.title;
      const network = navItems.networks.find(n => n.title === title);
      if (network) {
        setSelectedNetwork(network);
        setIsModalOpen(true);
      }
    };
    
    window.addEventListener('open-brand-modal', handleOpenBrandModal);
    return () => window.removeEventListener('open-brand-modal', handleOpenBrandModal);
  }, []);

  const handleAddAccount = async () => {
    if (!userIdInput.trim() || !selectedNetwork) return;
    
    const res = await addAccount(selectedNetwork.title, userIdInput);
    if (!res.success) {
      toast.error(`Failed to add account: ${res.error}`);
      return;
    }

    setAccounts(prev => ({
      ...prev,
      [selectedNetwork.title]: [...(prev[selectedNetwork.title] || []), userIdInput]
    }))
    
    setActiveAccounts(prev => ({
      ...prev,
      [selectedNetwork.title]: userIdInput
    }))
    
    setUserIdInput("")
    setIsModalOpen(false)
    toast.success(`Connected account @${userIdInput} to ${selectedNetwork.title}`)
    
    // Automatically navigate to the new account's dashboard
    router.push(`/dashboard?network=${selectedNetwork.title}&account=${userIdInput}`)
  }

  const getNetworkTheme = (title: string) => {
    switch(title) {
      case 'Instagram': return { bg: 'bg-gradient-to-br from-fuchsia-600/80 via-pink-500/80 to-orange-500/80 backdrop-blur-3xl border-white/20', text: 'text-white', input: 'bg-white/20 border-white/30 text-white placeholder:text-white/60 focus-visible:ring-white/50', btn: 'bg-white text-pink-600 hover:bg-white/90', icon: 'text-white' }
      case 'Facebook': return { bg: 'bg-[#1877F2]/80 backdrop-blur-3xl border-white/20', text: 'text-white', input: 'bg-white/20 border-white/30 text-white placeholder:text-white/60 focus-visible:ring-white/50', btn: 'bg-white text-[#1877F2] hover:bg-white/90', icon: 'text-white' }
      case 'TikTok': return { bg: 'bg-black/75 backdrop-blur-3xl border-white/20', text: 'text-white', input: 'bg-white/20 border-white/30 text-white placeholder:text-white/60 focus-visible:ring-white/50', btn: 'bg-white text-black hover:bg-white/90', icon: 'text-white' }
      case 'YouTube': return { bg: 'bg-[#FF0000]/80 backdrop-blur-3xl border-white/20', text: 'text-white', input: 'bg-white/20 border-white/30 text-white placeholder:text-white/60 focus-visible:ring-white/50', btn: 'bg-white text-[#FF0000] hover:bg-white/90', icon: 'text-white' }
      case 'LinkedIn': return { bg: 'bg-[#0A66C2]/80 backdrop-blur-3xl border-white/20', text: 'text-white', input: 'bg-white/20 border-white/30 text-white placeholder:text-white/60 focus-visible:ring-white/50', btn: 'bg-white text-[#0A66C2] hover:bg-white/90', icon: 'text-white' }
      default: return { bg: 'bg-white/80 backdrop-blur-3xl border-slate-200/50', text: 'text-slate-900', input: 'bg-white/50', btn: 'bg-slate-900 text-white', icon: 'text-slate-900' }
    }
  }

  const activeTheme = selectedNetwork ? getNetworkTheme(selectedNetwork.title) : getNetworkTheme('')

  return (
    <>
      <Sidebar 
        {...props} 
        collapsible="none"
        className="border-r border-orange-200/50 bg-orange-50/40 w-[320px] backdrop-blur-xl"
      >
        <SidebarContent className="bg-transparent gap-0 py-4 overflow-y-auto">
          
          {/* Summary Tab */}
          <SidebarGroup className="py-2">
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.main.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      render={<Link href={item.url} />}
                      className={`h-11 rounded-xl px-4 font-medium transition-colors ${
                        item.active 
                          ? 'bg-orange-200/70 text-orange-950 hover:bg-orange-200' 
                          : 'text-orange-950/70 hover:bg-orange-100/50 hover:text-orange-950'
                      }`}
                    >
                      <item.icon className={`w-5 h-5 mr-3 ${item.active ? 'text-orange-700' : 'text-orange-900/60'}`} />
                      <span className="text-base font-bold">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator className="mx-4 my-2 border-orange-200/50" />

          {/* Networks List */}
          <SidebarGroup className="py-2">
            <SidebarGroupContent>
              <SidebarMenu className="gap-1.5">
                {navItems.networks.map((item) => (
                  <div key={item.title}>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        onClick={(e) => { e.preventDefault(); /* Could expand/collapse here */ }}
                        className="h-12 px-4 group hover:bg-orange-100/50 hover:text-orange-950 justify-between font-semibold text-orange-950/80 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`flex items-center justify-center w-5 h-5 ${item.color}`}>
                            <item.icon className="w-5 h-5" />
                          </div>
                          <span className="text-base">{item.title}</span>
                        </div>
                        <div 
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setSelectedNetwork(item)
                            setIsModalOpen(true)
                          }}
                          className="w-6 h-6 rounded-full border border-orange-200 flex items-center justify-center opacity-40 group-hover:opacity-100 transition-all bg-white hover:bg-orange-100"
                        >
                          <Plus className="w-3 h-3 text-orange-600" />
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    
                    {/* Render Connected Accounts for this Network */}
                    {accounts[item.title] && accounts[item.title].length > 0 && (
                      <div className="ml-[42px] mr-4 mt-1 mb-2 space-y-1 border-l-2 border-orange-200/60 pl-2">
                        {accounts[item.title].map(acc => (
                          <button
                            key={acc}
                            onClick={() => {
                              setActiveAccounts(prev => ({...prev, [item.title]: acc}))
                              router.push(`/dashboard?network=${item.title}&account=${acc}`)
                            }}
                            className={`w-full text-left px-3 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                              activeAccounts[item.title] === acc 
                                ? 'bg-orange-200/60 text-orange-950' 
                                : 'text-orange-900/60 hover:bg-orange-100/50 hover:text-orange-950'
                            }`}
                          >
                            <div className={`w-1.5 h-1.5 rounded-full ${activeAccounts[item.title] === acc ? 'bg-orange-600' : 'bg-transparent'}`} />
                            <span className="truncate">@{acc}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                
                <div className="px-4 mt-4">
                  <Button 
                    onClick={() => toast.success("Social network connection APIs will be connected here.")}
                    variant="ghost" 
                    className="w-[90%] mx-auto mt-2 h-9 rounded-xl flex items-center justify-center text-xs font-bold bg-orange-50/80 text-orange-600 hover:bg-orange-100 hover:text-orange-700 transition-all border border-orange-200 border-dashed hover:border-orange-400 hover:shadow-sm"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    More connections
                  </Button>
                </div>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator className="mx-4 my-4 border-orange-200/50" />

          {/* Secondary Navigation */}
          <SidebarGroup className="py-2 mt-auto">
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {navItems.secondary.map((item) => {
                  // Determine if this secondary item is currently active
                  // Handle edge case where item.url is '/' to prevent it always matching
                  const isActive = pathname?.startsWith(item.url) && item.url !== '#';

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        render={<Link href={item.url} />}
                        className={`h-12 px-4 font-semibold justify-between transition-colors ${
                          isActive
                            ? 'bg-orange-200/70 text-orange-950 hover:bg-orange-200'
                            : 'text-orange-950/70 hover:bg-orange-100/50 hover:text-orange-950'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className={`w-5 h-5 ${isActive ? 'text-orange-700' : 'text-orange-900/50'}`} />
                          <span className="text-base">{item.title}</span>
                        </div>
                        {item.badge && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-orange-100 text-orange-700 rounded border border-orange-200 shadow-sm">
                            {item.badge}
                          </span>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

        </SidebarContent>
        <SidebarRail />
      </Sidebar>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className={`sm:max-w-md ${activeTheme.bg} shadow-2xl transition-all duration-300`}>
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                {selectedNetwork && <selectedNetwork.icon className={`w-6 h-6 ${activeTheme.icon}`} />}
              </div>
              <DialogTitle className={`text-2xl font-bold ${activeTheme.text}`}>Connect {selectedNetwork?.title}</DialogTitle>
            </div>
            <DialogDescription className={`${activeTheme.text} opacity-90 font-medium`}>
              Enter your App User ID or Handle to connect this account. The API connection is simulated for now.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className={`text-sm font-bold ${activeTheme.text}`}>App User ID</label>
              <Input 
                value={userIdInput}
                onChange={e => setUserIdInput(e.target.value)}
                placeholder="@username or ID" 
                className={`h-12 font-medium shadow-inner ${activeTheme.input}`}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleAddAccount()}
              />
            </div>
            <Button 
              onClick={handleAddAccount}
              className={`w-full h-12 text-base font-bold shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] ${activeTheme.btn}`}
            >
              Connect Account
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
