import re

# 1. Append delete action to accounts.ts
with open("src/app/actions/accounts.ts", "a") as f:
    f.write("""
export async function deleteAccountByHandle(network: string, accountHandle: string, brandId: string) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: "Unauthorized" }
  }

  const { error } = await supabase
    .from('social_accounts')
    .delete()
    .eq('user_id', user.id)
    .eq('brand_id', brandId)
    .eq('network', network)
    .eq('account_handle', accountHandle)

  if (error) {
    console.error("Supabase delete account error:", error)
    return { success: false, error: error.message }
  }

  return { success: true }
}
""")

# 2. Modify app-sidebar.tsx to import the delete action and add the trash icon
with open("src/components/layout/app-sidebar.tsx", "r") as f:
    content = f.read()

# Import the action
content = content.replace("import { getAccounts, addAccount } from \"@/app/actions/accounts\"", 
                          "import { getAccounts, addAccount, deleteAccountByHandle } from \"@/app/actions/accounts\"")

# Add the delete handler
old_handler = "  const [isUploading, setIsUploading] = useState(false)"
new_handler = """  const [isUploading, setIsUploading] = useState(false)
  
  const handleDeleteAccount = async (networkTitle: string, accHandle: string) => {
    if (!activeBrandId) return;
    const res = await deleteAccountByHandle(networkTitle, accHandle, activeBrandId);
    if (res.success) {
      toast.success(`${accHandle} disconnected successfully`);
      fetchAccounts(activeBrandId);
      if (activeAccounts[networkTitle] === accHandle) {
        // Clear active selection if they deleted the currently viewed account
        setActiveAccounts(prev => ({...prev, [networkTitle]: ''}));
        router.push('/dashboard');
      }
    } else {
      toast.error(`Failed to disconnect: ${res.error}`);
    }
  }"""
if old_handler in content:
    content = content.replace(old_handler, new_handler)
else:
    # try another place
    content = content.replace("  const [activeBrandId, setActiveBrandId] = useState<string | null>(null)", 
"""  const [activeBrandId, setActiveBrandId] = useState<string | null>(null)
  
  const handleDeleteAccount = async (networkTitle: string, accHandle: string) => {
    if (!activeBrandId) return;
    const res = await deleteAccountByHandle(networkTitle, accHandle, activeBrandId);
    if (res.success) {
      toast.success(`${accHandle} disconnected successfully`);
      fetchAccounts(activeBrandId);
      if (activeAccounts[networkTitle] === accHandle) {
        // Clear active selection if they deleted the currently viewed account
        setActiveAccounts(prev => ({...prev, [networkTitle]: ''}));
        router.push('/dashboard');
      }
    } else {
      toast.error(`Failed to disconnect: ${res.error}`);
    }
  }""")

# Add the trash icon
old_map = """                            <div className={`w-1.5 h-1.5 rounded-full ${activeAccounts[item.title] === acc ? 'bg-orange-600' : 'bg-transparent'}`} />
                            <span className="truncate">@{acc}</span>
                          </button>"""

new_map = """                            <div className={`w-1.5 h-1.5 rounded-full ${activeAccounts[item.title] === acc ? 'bg-orange-600' : 'bg-transparent'}`} />
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
                          </button>"""

content = content.replace(old_map, new_map)
# ensure the button has the group class for the hover effect
content = content.replace("flex items-center gap-2 ${", "flex items-center gap-2 group/acc ${")

with open("src/components/layout/app-sidebar.tsx", "w") as f:
    f.write(content)

print("Updated sidebar with delete account logic")
