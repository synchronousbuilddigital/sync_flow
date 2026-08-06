import re

with open("src/app/(dashboard)/ideas/page.tsx", "r") as f:
    content = f.read()

# 1. Add imports
import_insert = """import { getIdeas, addIdea, updateIdeaColumn, Idea as DBIdea } from "@/app/actions/ideas";\nimport { toast } from "sonner";"""
content = content.replace('import { toast } from "sonner";', import_insert)

# 2. Update Idea interface to map to DB
old_idea = """interface Idea {
  id: string;
  columnId: ColumnId;
  title: string;
  description?: string;
  network?: 'Instagram' | 'Facebook' | 'LinkedIn' | 'Twitter' | 'TikTok' | 'YouTube';
}"""
new_idea = """interface Idea {
  id: string;
  columnId: ColumnId;
  title: string;
  description?: string;
  network?: 'Instagram' | 'Facebook' | 'LinkedIn' | 'Twitter' | 'TikTok' | 'YouTube';
}"""
# Keep it same, we'll map from DBIdea.

# 3. Change state and add useEffect
old_state = """export default function IdeasBoardPage() {
  const [columns, setColumns] = useState<{ id: string; title: string }[]>(INITIAL_COLUMNS);
  const [ideas, setIdeas] = useState<Idea[]>(INITIAL_IDEAS);"""
new_state = """export default function IdeasBoardPage() {
  const [columns, setColumns] = useState<{ id: string; title: string }[]>(INITIAL_COLUMNS);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [activeBrandId, setActiveBrandId] = useState<string | null>(null);

  React.useEffect(() => {
    const loadIdeas = async () => {
      const brandId = localStorage.getItem("activeBrandId");
      if (!brandId) {
        setIdeas([]);
        setActiveBrandId(null);
        return;
      }
      setActiveBrandId(brandId);
      const data = await getIdeas(brandId);
      if (data) {
        setIdeas(data.map(d => ({
          id: d.id,
          columnId: d.column_id,
          title: d.title,
          description: d.description || undefined,
          network: d.network as any || undefined
        })));
      }
    };

    loadIdeas();
    
    const onBrandChanged = () => loadIdeas();
    window.addEventListener("brandChanged", onBrandChanged);
    return () => window.removeEventListener("brandChanged", onBrandChanged);
  }, []);"""
content = content.replace(old_state, new_state)

# 4. Update handleDrop
old_drop = """  const handleDrop = (e: React.DragEvent, columnId: ColumnId) => {
    e.preventDefault();
    const ideaId = e.dataTransfer.getData("text/plain") || draggedIdeaId;
    if (!ideaId) return;

    setIdeas(prev => 
      prev.map(idea => 
        idea.id === ideaId ? { ...idea, columnId } : idea
      )
    );
    setDraggedIdeaId(null);
  };"""
new_drop = """  const handleDrop = async (e: React.DragEvent, columnId: ColumnId) => {
    e.preventDefault();
    const ideaId = e.dataTransfer.getData("text/plain") || draggedIdeaId;
    if (!ideaId) return;

    // Optimistic update
    setIdeas(prev => 
      prev.map(idea => 
        idea.id === ideaId ? { ...idea, columnId } : idea
      )
    );
    setDraggedIdeaId(null);
    
    // DB Update
    if (!ideaId.startsWith("temp-")) {
       await updateIdeaColumn(ideaId, columnId);
    }
  };"""
content = content.replace(old_drop, new_drop)

# 5. Update handleAddIdea
old_add = """  const handleAddIdea = (columnId: ColumnId) => {
    if (!newIdeaTitle.trim()) {
      setAddingToColumn(null);
      return;
    }
    
    const newIdea: Idea = {
      id: `idea-${Date.now()}`,
      columnId,
      title: newIdeaTitle,
    };
    
    setIdeas([...ideas, newIdea]);
    setNewIdeaTitle("");
    setAddingToColumn(null);
  };"""
new_add = """  const handleAddIdea = async (columnId: ColumnId) => {
    if (!newIdeaTitle.trim() || !activeBrandId) {
      setAddingToColumn(null);
      if (!activeBrandId) toast.error("Please select a brand first.");
      return;
    }
    
    const title = newIdeaTitle;
    setNewIdeaTitle("");
    setAddingToColumn(null);
    
    const res = await addIdea(activeBrandId, title);
    if (res.success && res.data) {
      const d = res.data;
      setIdeas(prev => [...prev, {
        id: d.id,
        columnId: d.column_id,
        title: d.title,
        description: d.description || undefined,
        network: d.network as any || undefined
      }]);
      // If added to a specific column and not unassigned, update it immediately
      if (columnId !== 'unassigned') {
        await updateIdeaColumn(d.id, columnId);
        setIdeas(prev => prev.map(i => i.id === d.id ? { ...i, columnId } : i));
      }
    } else {
      toast.error("Failed to save idea to database.");
    }
  };"""
content = content.replace(old_add, new_add)

# 6. Update handleAddAiIdeaToBoard
old_ai_add = """  const handleAddAiIdeaToBoard = (design: any) => {
    const newIdea: Idea = {
      id: `idea-${Date.now()}`,
      columnId: 'unassigned',
      title: design.caption.split('\\n')[0].substring(0, 40) + '...',
      description: design.caption,
      network: design.network as any
    };
    setIdeas([...ideas, newIdea]);
    toast.success("Idea added to Unassigned column!");
  };"""
new_ai_add = """  const handleAddAiIdeaToBoard = async (design: any) => {
    if (!activeBrandId) {
       toast.error("Please select a brand first.");
       return;
    }
    const title = design.caption.split('\\n')[0].substring(0, 40) + '...';
    const res = await addIdea(activeBrandId, title, design.caption, design.network);
    if (res.success && res.data) {
      const d = res.data;
      setIdeas(prev => [...prev, {
        id: d.id,
        columnId: d.column_id,
        title: d.title,
        description: d.description || undefined,
        network: d.network as any || undefined
      }]);
      toast.success("Idea added to Unassigned column!");
    } else {
      toast.error("Failed to save AI idea.");
    }
  };"""
content = content.replace(old_ai_add, new_ai_add)

with open("src/app/(dashboard)/ideas/page.tsx", "w") as f:
    f.write(content)
print("Updated page.tsx")
