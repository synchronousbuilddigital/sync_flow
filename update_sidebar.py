import re

with open("src/components/layout/app-sidebar.tsx", "r") as f:
    content = f.read()

# 1. Add imports
import_insert = """import { getBrands, createBrand, Brand } from "@/app/actions/brands"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu"
import { ChevronDown, Check as CheckIcon } from "lucide-react"
"""

content = content.replace('import { getAccounts, addAccount } from "@/app/actions/accounts"', 
                          'import { getAccounts, addAccount } from "@/app/actions/accounts"\n' + import_insert)

# 2. Add state and logic
old_logic = """  const [accounts, setAccounts] = React.useState<Record<string, string[]>>({})
  
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
    loadAccounts();"""

new_logic = """  const [brands, setBrands] = React.useState<Brand[]>([])
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

    // Save selection
    localStorage.setItem("activeBrandId", activeBrandId);

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
    loadAccounts();"""

content = content.replace(old_logic, new_logic)

# 3. Update handleAddAccount to pass activeBrandId
old_add_account = """    const res = await addAccount(selectedNetwork.title, userIdInput);"""
new_add_account = """    if (!activeBrandId) {
      toast.error("Please create a brand first.");
      return;
    }
    const res = await addAccount(selectedNetwork.title, userIdInput, activeBrandId);"""
content = content.replace(old_add_account, new_add_account)

# 4. Add handleCreateBrand logic
add_brand_logic = """  const handleCreateBrand = async () => {
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

  const activeBrand = brands.find(b => b.id === activeBrandId);

  const activeTheme = selectedNetwork"""
content = content.replace("  const activeTheme = selectedNetwork", add_brand_logic)

# 5. Insert Brand Switcher UI
old_ui_start = """        <SidebarContent className="bg-transparent gap-0 py-4 overflow-y-auto">"""
new_ui_start = """        <SidebarContent className="bg-transparent gap-0 py-4 overflow-y-auto">
          
          {/* Brand Switcher */}
          <SidebarGroup className="px-4 pb-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center justify-between bg-white border border-orange-200 shadow-sm rounded-xl px-4 py-2.5 text-sm font-bold text-orange-950 hover:bg-orange-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-orange-600 text-white flex items-center justify-center text-xs">
                      {activeBrand?.name?.charAt(0) || "B"}
                    </div>
                    <span className="truncate max-w-[150px]">{activeBrand?.name || "Select Brand"}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-orange-900/50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[280px] p-2 rounded-xl border-orange-100 shadow-xl" align="start">
                <DropdownMenuLabel className="text-xs font-bold text-slate-400">Your Brands</DropdownMenuLabel>
                {brands.map(brand => (
                  <DropdownMenuItem 
                    key={brand.id} 
                    onClick={() => setActiveBrandId(brand.id)}
                    className="flex items-center gap-2 p-2 rounded-lg cursor-pointer font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-900"
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
                  className="flex items-center gap-2 p-2 rounded-lg cursor-pointer font-bold text-orange-600 hover:bg-orange-50"
                >
                  <Plus className="w-4 h-4" /> Create new brand
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarGroup>"""
content = content.replace(old_ui_start, new_ui_start)

# 6. Add Brand Modal at the bottom
old_end = """    </>
  )
}
"""
new_end = """      <Dialog open={isBrandModalOpen} onOpenChange={setIsBrandModalOpen}>
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
"""
content = content.replace(old_end, new_end)

with open("src/components/layout/app-sidebar.tsx", "w") as f:
    f.write(content)
print("Updated app-sidebar.tsx successfully")
