import re

with open("src/app/(dashboard)/calendar/page.tsx", "r") as f:
    content = f.read()

# 1. Update State to include activeBrandId
old_state = """  // Real Database Posts State
  const [dbPosts, setDbPosts] = useState<any[]>([]);"""
new_state = """  // Real Database Posts State
  const [dbPosts, setDbPosts] = useState<any[]>([]);
  const [activeBrandId, setActiveBrandId] = useState<string | null>(null);"""
content = content.replace(old_state, new_state)

# 2. Update useEffect to fetch by brandId and listen to brandChanged
old_effect = """  // Fetch posts from Supabase on mount
  useEffect(() => {
    async function loadPosts() {
      try {
        const data = await getPosts();
        if (data) {
          setDbPosts(data);
        }
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      }
    }
    async function loadAiHeatmap() {
      try {
        // In a real app we might pass the active account profile context here
        const heatmap = await getBestTimeToPost("Generic social media account");
        setAiHeatmap(heatmap);
      } catch (err) {
        console.error("Failed to fetch AI heatmap:", err);
      }
    }
    loadPosts();
    loadAiHeatmap();
  }, []);"""

new_effect = """  // Fetch posts from Supabase on mount and brand change
  useEffect(() => {
    async function loadPosts() {
      try {
        const brandId = localStorage.getItem("activeBrandId");
        if (!brandId) {
          setDbPosts([]);
          setActiveBrandId(null);
          return;
        }
        setActiveBrandId(brandId);
        const data = await getPosts(brandId);
        if (data) {
          setDbPosts(data);
        }
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      }
    }
    async function loadAiHeatmap() {
      try {
        const heatmap = await getBestTimeToPost("Generic social media account");
        setAiHeatmap(heatmap);
      } catch (err) {
        console.error("Failed to fetch AI heatmap:", err);
      }
    }
    loadPosts();
    loadAiHeatmap();

    const onBrandChanged = () => loadPosts();
    window.addEventListener("brandChanged", onBrandChanged);
    return () => window.removeEventListener("brandChanged", onBrandChanged);
  }, []);"""

content = content.replace(old_effect, new_effect)

# 3. Prevent post saving if no brand is selected
old_save = """  // Handle saving new or updated post to Supabase
  const handleSavePost = async (payload: PostPayload) => {
    try {
      if (payload.id) {"""
new_save = """  // Handle saving new or updated post to Supabase
  const handleSavePost = async (payload: PostPayload) => {
    try {
      if (!payload.brandId) {
        toast.error("Please select a brand first.");
        return;
      }
      if (payload.id) {"""
content = content.replace(old_save, new_save)

with open("src/app/(dashboard)/calendar/page.tsx", "w") as f:
    f.write(content)
print("Updated calendar page.tsx")
