"use client"

import * as React from "react"
import {
  FileText,
  Plus,
  BarChart,
  FileBarChart,
  Hash,
  Settings,
  Lightbulb,
  Trash2,
  MessageSquare
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
import { getAccounts, addAccount, deleteAccountByHandle } from "@/app/actions/accounts"
import { getBrands, createBrand, Brand } from "@/app/actions/brands"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu"
import { ChevronDown, Check as CheckIcon } from "lucide-react"


const navItems = {
  main: [
    { title: "Summary", url: "/dashboard", icon: FileText, active: true },
    { title: "Ideas", url: "/ideas", icon: Lightbulb },
    { title: "Content History", url: "/content", icon: MessageSquare },
  ],
  networks: [
    { title: "Instagram", url: "#", color: "text-pink-500", brand: true },
    { title: "Facebook", url: "#", color: "text-blue-600", brand: true },
    { title: "TikTok", url: "#", color: "text-black dark:text-white", brand: true },
    { title: "YouTube", url: "#", color: "text-red-500", brand: true },
    { title: "LinkedIn", url: "#", color: "text-[#0A66C2]", brand: true },
    { title: "Threads", url: "#", color: "text-black dark:text-white", brand: true },
    { title: "X (Twitter)", url: "#", color: "text-black dark:text-white", brand: true },
  ],
  secondary: [
    { title: "Reporting", url: "/reporting", icon: BarChart, badge: "New" },
    { title: "Reports", url: "/reporting/campaigns", icon: FileBarChart },
    { title: "Hashtag Tracker", url: "/reporting/studio", icon: Hash },
    { title: "Brand settings", url: "/settings", icon: Settings },
  ]
}

// Brand SVG icons
const BrandIcon = ({ title, className }: { title: string; className?: string }) => {
  switch (title) {
    case "Instagram":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="ig-grad" r="150%" cx="30%" cy="107%">
              <stop offset="0%" stopColor="#fdf497"/>
              <stop offset="5%" stopColor="#fdf497"/>
              <stop offset="45%" stopColor="#fd5949"/>
              <stop offset="60%" stopColor="#d6249f"/>
              <stop offset="90%" stopColor="#285AEB"/>
            </radialGradient>
          </defs>
          <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#ig-grad)"/>
          <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.8" fill="none"/>
          <circle cx="17.5" cy="6.5" r="1.2" fill="white"/>
        </svg>
      )
    case "Facebook":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )
    case "TikTok":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z"/>
        </svg>
      )
    case "YouTube":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="#FF0000" xmlns="http://www.w3.org/2000/svg">
          <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      )
    case "LinkedIn":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="#0A66C2" xmlns="http://www.w3.org/2000/svg">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      )
    case "Threads":
      return (
        <svg className={className} viewBox="0 0 192 192" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M141.537 88.988a66.667 66.667 0 00-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.34c-14.986 0-27.449 6.396-35.12 18.036l13.779 9.452c5.73-8.695 14.724-10.548 21.348-10.548h.229c8.249.053 14.474 2.452 18.503 7.129 2.932 3.405 4.893 8.111 5.864 14.05-7.314-1.243-15.224-1.626-23.68-1.14-23.82 1.371-39.134 15.264-38.105 34.568.522 9.792 5.4 18.216 13.735 23.719 7.047 4.652 16.124 6.927 25.557 6.412 12.458-.683 22.231-5.436 29.049-14.127 5.178-6.6 8.453-15.153 9.899-25.93 5.937 3.583 10.337 8.298 12.767 13.966 4.132 9.635 4.373 25.468-8.546 38.376-11.319 11.308-24.925 16.2-45.488 16.351-22.809-.169-40.06-7.484-51.275-21.742C35.238 139.966 29.811 120.682 29.619 96c.192-24.682 5.619-43.966 16.124-57.339C57.058 24.397 74.309 17.082 97.118 16.913c22.975.17 40.526 7.52 52.171 21.847 5.71 7.026 10.015 15.86 12.853 26.162l16.147-4.308c-3.44-12.68-8.853-23.606-16.219-32.668C147.036 9.607 125.202.195 97.252 0h-.484C68.924.195 47.294 9.643 32.79 28.08 19.884 44.487 13.226 67.315 13.001 95.932L13 96l.001.068c.225 28.617 6.883 51.445 19.789 67.853 14.504 18.437 36.134 27.885 64.308 28.08h.484c24.957-.173 42.502-6.708 57.022-21.218 19.019-19.007 18.447-42.912 12.133-57.556-4.535-10.573-13.188-19.224-25.2-24.239zm-41.036 39.025c-10.427.568-21.258-4.09-21.811-14.101-.412-7.717 5.476-16.324 23.022-17.332a117.3 117.3 0 013.49-.106c6.868 0 13.306.676 19.108 1.919-2.175 27.205-13.407 29.116-23.81 29.62z"/>
        </svg>
      )
    case "X (Twitter)":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )
    default:
      return null
  }
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const currentNetwork = searchParams.get("network")
  const currentAccount = searchParams.get("account")

  const [brands, setBrands] = React.useState<Brand[]>([])
  const [activeBrandId, setActiveBrandId] = React.useState<string | null>(null)
  const [isBrandModalOpen, setIsBrandModalOpen] = React.useState(false)
  const [newBrandName, setNewBrandName] = React.useState("")

  const [accounts, setAccounts] = React.useState<Record<string, string[]>>({})
  const [activeAccounts, setActiveAccounts] = React.useState<Record<string, string>>({})
  
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [selectedNetwork, setSelectedNetwork] = React.useState<any>(null)
  const [userIdInput, setUserIdInput] = React.useState("")

  React.useEffect(() => {
    async function initData() {
      try {
        const brandsData = await getBrands();
        if (brandsData && brandsData.length > 0) {
          setBrands(brandsData);
          
          // Try to load active brand from local storage, fallback to first brand
          const savedBrandId = localStorage.getItem("activeBrandId");
          const initialBrandId = savedBrandId && brandsData.some(b => b.id === savedBrandId) 
            ? savedBrandId 
            : brandsData[0].id;
            
          setActiveBrandId(initialBrandId);
        }
      } catch (err) {
        console.error("Failed to load brands", err);
      }
    }
    initData();
  }, []);

  React.useEffect(() => {
    if (!activeBrandId) {
      setAccounts({});
      setActiveAccounts({});
      return;
    }

    // Save selection and notify
    localStorage.setItem("activeBrandId", activeBrandId);
    window.dispatchEvent(new Event("brandChanged"));

    async function loadAccounts() {
      try {
        const data = await getAccounts(activeBrandId!); // Pass active brand
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
  }, [activeBrandId]);

  const activeBrand = brands.find(b => b.id === activeBrandId);

  const handleAddAccount = async () => {
    if (!selectedNetwork) return;
    
    if (!activeBrandId || !activeBrand) {
      toast.error("Please create a brand first.");
      return;
    }

    if (selectedNetwork.title === 'YouTube') {
      window.location.href = `/api/auth/youtube?brandId=${activeBrandId}`;
      return;
    }

    if (selectedNetwork.title === 'Threads') {
      window.location.href = `/api/auth/threads?brandId=${activeBrandId}`;
      return;
    }

    if (selectedNetwork.title === 'Instagram') {
      window.location.href = `/api/auth/instagram?brandId=${activeBrandId}`;
      return;
    }

    if (selectedNetwork.title === 'LinkedIn') {
      window.location.href = `/api/auth/linkedin?brandId=${activeBrandId}`;
      return;
    }

    if (!userIdInput.trim()) return;

    const res = await addAccount(selectedNetwork.title, userIdInput, activeBrandId, activeBrand.name);
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
    setIsModalOpen(false);
    toast.success(`${userIdInput} connected to ${selectedNetwork.title} successfully`);
  };

  const handleDeleteAccount = async (networkTitle: string, accHandle: string) => {
    if (!activeBrandId) return;
    const res = await deleteAccountByHandle(networkTitle, accHandle, activeBrandId);
    if (res.success) {
      toast.success(`${accHandle} disconnected successfully`);
      // Soft refresh state instead of hard reload to prevent Turbopack crash
      window.dispatchEvent(new Event("brandChanged"));
      // If we are currently looking at the deleted account, go back to summary
      if (typeof window !== 'undefined' && window.location.href.includes(accHandle)) {
         window.location.href = '/dashboard';
      }
    } else {
      toast.error(`Failed to disconnect: ${res.error}`);
    }
  };

  const getNetworkTheme = (title: string) => {
    switch(title) {
      case 'Instagram': return { bg: 'bg-gradient-to-br from-fuchsia-600/80 via-pink-500/80 to-orange-500/80 backdrop-blur-3xl border-white/20', text: 'text-white', input: 'bg-white/20 border-white/30 text-white placeholder:text-white/60 focus-visible:ring-white/50', btn: 'bg-white text-pink-600 hover:bg-white/90', icon: 'text-white' }
      case 'Facebook': return { bg: 'bg-[#1877F2]/80 backdrop-blur-3xl border-white/20', text: 'text-white', input: 'bg-white/20 border-white/30 text-white placeholder:text-white/60 focus-visible:ring-white/50', btn: 'bg-white text-[#1877F2] hover:bg-white/90', icon: 'text-white' }
      case 'TikTok': return { bg: 'bg-black/75 backdrop-blur-3xl border-white/20', text: 'text-white', input: 'bg-white/20 border-white/30 text-white placeholder:text-white/60 focus-visible:ring-white/50', btn: 'bg-white text-black hover:bg-white/90', icon: 'text-white' }
      case 'YouTube': return { bg: 'bg-[#FF0000]/80 backdrop-blur-3xl border-white/20', text: 'text-white', input: 'bg-white/20 border-white/30 text-white placeholder:text-white/60 focus-visible:ring-white/50', btn: 'bg-white text-[#FF0000] hover:bg-white/90', icon: 'text-white' }
      case 'LinkedIn': return { bg: 'bg-[#0A66C2]/80 backdrop-blur-3xl border-white/20', text: 'text-white', input: 'bg-white/20 border-white/30 text-white placeholder:text-white/60 focus-visible:ring-white/50', btn: 'bg-white text-[#0A66C2] hover:bg-white/90', icon: 'text-white' }
      case 'Threads': return { bg: 'bg-black/80 backdrop-blur-3xl border-white/20', text: 'text-white', input: 'bg-white/20 border-white/30 text-white placeholder:text-white/60 focus-visible:ring-white/50', btn: 'bg-white text-black hover:bg-white/90', icon: 'text-white' }
      case 'X (Twitter)': return { bg: 'bg-black/80 backdrop-blur-3xl border-white/20', text: 'text-white', input: 'bg-white/20 border-white/30 text-white placeholder:text-white/60 focus-visible:ring-white/50', btn: 'bg-white text-black hover:bg-white/90', icon: 'text-white' }
      default: return { bg: 'bg-white/80 backdrop-blur-3xl border-slate-200/50', text: 'text-slate-900', input: 'bg-white/50', btn: 'bg-slate-900 text-white', icon: 'text-slate-900' }
    }
  }

  const handleCreateBrand = async () => {
    if (!newBrandName.trim()) return;
    const res = await createBrand(newBrandName);
    if (!res.success) {
      toast.error(`Failed to create brand: ${res.error}`);
      return;
    }
    const newBrand = res.data;
    setBrands(prev => [newBrand, ...prev]);
    setActiveBrandId(newBrand.id);
    setNewBrandName("");
    setIsBrandModalOpen(false);
    toast.success(`Brand "${newBrand.name}" created!`);
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
          
          {/* Brand Switcher */}
          <SidebarGroup className="px-4 pb-2">
            <DropdownMenu>
              <DropdownMenuTrigger className="w-full flex items-center justify-between bg-white border border-orange-200 shadow-sm rounded-xl px-4 py-2.5 text-sm font-bold text-orange-950 hover:bg-orange-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-orange-600 text-white flex items-center justify-center text-xs">
                      {activeBrand?.name?.charAt(0) || "B"}
                    </div>
                    <span className="truncate max-w-[150px]">{activeBrand?.name || "Select Brand"}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-orange-900/50" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[280px] p-2 rounded-xl border border-orange-100 shadow-xl bg-white" align="start">
                <div className="px-2 py-1.5 text-[11px] uppercase tracking-wider font-bold text-orange-900/50">Your Brands</div>
                {brands.map(brand => (
                  <DropdownMenuItem 
                    key={brand.id} 
                    onClick={() => setActiveBrandId(brand.id)}
                    className="flex items-center gap-2 p-2 mt-1 rounded-lg cursor-pointer font-semibold text-slate-800 focus:bg-orange-50 focus:text-orange-950 transition-colors"
                  >
                    <div className="w-6 h-6 rounded bg-orange-100 text-orange-700 flex items-center justify-center text-xs">
                      {brand.name.charAt(0)}
                    </div>
                    {brand.name}
                    {activeBrandId === brand.id && <CheckIcon className="w-4 h-4 ml-auto text-orange-600" />}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator className="my-1 bg-orange-100" />
                <DropdownMenuItem 
                  onClick={() => setIsBrandModalOpen(true)}
                  className="flex items-center gap-2 p-2 rounded-lg cursor-pointer font-bold text-orange-600 focus:bg-orange-50 focus:text-orange-700"
                >
                  <Plus className="w-4 h-4" /> Create new brand
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarGroup>
          
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
                          <div className={`flex items-center justify-center w-5 h-5`}>
                            <BrandIcon title={item.title} className="w-5 h-5" />
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
                            className={`w-full text-left px-3 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 group/acc ${
                              activeAccounts[item.title] === acc 
                                ? 'bg-orange-200/60 text-orange-950' 
                                : 'text-orange-900/60 hover:bg-orange-100/50 hover:text-orange-950'
                            }`}
                          >
                            <div className={`w-1.5 h-1.5 rounded-full ${activeAccounts[item.title] === acc ? 'bg-orange-600' : 'bg-transparent'}`} />
                            <span className="truncate flex-1">@{acc}</span>
                            <div 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAccount(item.title, acc);
                              }}
                              className="opacity-0 group-hover/acc:opacity-100 hover:bg-red-100 p-1 rounded-md transition-all ml-auto flex-shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            </div>
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
                {selectedNetwork && <BrandIcon title={selectedNetwork.title} className="w-6 h-6" />}
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
      <Dialog open={isBrandModalOpen} onOpenChange={setIsBrandModalOpen}>
        <DialogContent className="sm:max-w-md border-0 shadow-2xl rounded-3xl overflow-hidden p-0 bg-white">
          <div className="p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-extrabold text-slate-900">Create New Brand</DialogTitle>
              <DialogDescription className="text-sm font-medium text-slate-500 mt-2">
                Manage all social accounts for a new client or company.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Brand Name</label>
                <Input 
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  placeholder="e.g. Acme Corp" 
                  className="h-12 bg-slate-50 border-slate-200 text-slate-900 font-semibold focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" onClick={() => setIsBrandModalOpen(false)} className="text-slate-600 font-bold hover:bg-slate-100">Cancel</Button>
                <Button onClick={handleCreateBrand} className="bg-orange-600 text-white font-bold hover:bg-orange-700 px-6">Create Brand</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
