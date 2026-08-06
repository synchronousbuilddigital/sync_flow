"use client"

import * as React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Camera, Image as ImageIcon, Video, X, Check, Clock, Globe, Briefcase, PlayCircle, Play as Youtube, MessageCircle as Twitter, Calendar as CalendarIcon, Send, Sparkles, Wand2, SendHorizontal, RefreshCw, Bot, Bookmark } from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { getCloudinarySignature } from "@/app/actions/cloudinary"

export type Network = 'Instagram' | 'Facebook' | 'TikTok' | 'YouTube' | 'LinkedIn' | 'Twitter'
export type PostType = 'Post' | 'Story' | 'Reel' | 'Video' | 'Short'

export interface PostPayload {
  id?: string
  network: Network
  postType: PostType
  content: string
  mediaUrls: string[]
  scheduledTimestamp: string | null // ISO string if scheduled, null if instant
  accountName?: string
  brandId: string
}

interface PostComposerProps {
  isOpen: boolean
  onClose: () => void
  onSavePost?: (post: PostPayload) => void
  initialData?: PostPayload
}

const NETWORKS: { id: Network; icon: React.ElementType; color: string }[] = [
  { id: 'Instagram', icon: Camera, color: 'text-pink-500 bg-pink-50 border-pink-200' },
  { id: 'Facebook', icon: Globe, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { id: 'TikTok', icon: PlayCircle, color: 'text-slate-800 bg-slate-100 border-slate-200' },
  { id: 'YouTube', icon: Youtube, color: 'text-red-500 bg-red-50 border-red-200' },
  { id: 'LinkedIn', icon: Briefcase, color: 'text-[#0A66C2] bg-sky-50 border-sky-200' },
  { id: 'Twitter', icon: Twitter, color: 'text-black bg-slate-100 border-slate-200' },
]

import { format, parseISO } from "date-fns"
import { getAccounts } from "@/app/actions/accounts"

export function PostComposer({ isOpen, onClose, onSavePost, initialData }: PostComposerProps) {
  const [network, setNetwork] = useState<Network>('Instagram')
  const [accountName, setAccountName] = useState("@brand_official")
  const [postType, setPostType] = useState<PostType>('Post')
  const [content, setContent] = useState("")
  const [mediaUrl, setMediaUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)

  // Scheduling State
  const [isScheduling, setIsScheduling] = useState(false)
  const [scheduleDate, setScheduleDate] = useState("")
  const [scheduleTime, setScheduleTime] = useState("")

  // AI Mode State
  const [isAiMode, setIsAiMode] = useState(false)
  const [chatInput, setChatInput] = useState("")
  const [isAiLoading, setIsAiLoading] = useState(false)
  
  // Real Database Accounts
  const [dbAccounts, setDbAccounts] = useState<Record<string, string[]>>({})

  React.useEffect(() => {
    if (!isOpen) return;
    async function loadAccounts() {
      try {
        const data = await getAccounts();
        if (data) {
          const accs: Record<string, string[]> = {};
          data.forEach(acc => {
            if (!accs[acc.network]) accs[acc.network] = [];
            accs[acc.network].push(acc.account_handle);
          });
          setDbAccounts(accs);
          
          // Auto-select first account if available
          if (accs[network] && accs[network].length > 0) {
            setAccountName(accs[network][0]);
          } else {
            setAccountName("");
          }
        }
      } catch (err) {
        console.error("Failed to load accounts", err);
      }
    }
    loadAccounts();
  }, [isOpen]);

  // Update selected account when network changes
  React.useEffect(() => {
    if (dbAccounts[network] && dbAccounts[network].length > 0) {
      setAccountName(dbAccounts[network][0]);
    } else {
      setAccountName("");
    }
  }, [network, dbAccounts]);
  
  interface AiDesign {
    id: string
    network: Network
    caption: string
    mediaUrl?: string
    promptUsed: string
  }
  
  const [aiDesigns, setAiDesigns] = useState<AiDesign[]>([
    {
      id: "ai-1",
      network: "Instagram",
      caption: "🎉 BIG SUMMER SALE! 🎉\n\nGet ready for the hottest deals of the year. ☀️\n\nUp to 50% OFF the entire store. Tap the link in bio to shop now! 🛍️✨\n\n#SummerSale #Discount #ShopNow #SummerVibes",
      mediaUrl: "https://images.unsplash.com/photo-1573855619003-97b4799dcd8b?auto=format&fit=crop&q=80&w=600",
      promptUsed: "Give me an exciting summer sale post for Instagram"
    },
    {
      id: "ai-2",
      network: "Twitter",
      caption: "The Summer Sale is officially LIVE! 🏖️☀️\n\nDon't walk, RUN to our website to get up to 50% off select items. What are you picking up?\n\nShop here: link.com/sale",
      promptUsed: "Give me an exciting summer sale post for Twitter"
    }
  ])
  
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
    { role: 'assistant', content: 'Hi there! I am your AI Design Assistant. What kind of post would you like to create today? You can say things like "Give me 3 Instagram post ideas for a summer sale".' }
  ])

  const handleAiChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if(!chatInput.trim()) return
    
    const userMsg = chatInput
    setChatInput("")
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setIsAiLoading(true)
    
    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMsg })
      })
      const data = await res.json()
      
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
      
      if (data.designs && data.designs.length > 0) {
        setAiDesigns(prev => [...data.designs, ...prev])
      }
    } catch (err) {
      toast.error("Failed to connect to AI server.")
    } finally {
      setIsAiLoading(false)
    }
  }

  const handleUseAiDesign = (design: AiDesign) => {
    setNetwork(design.network)
    setContent(design.caption)
    setMediaUrl(design.mediaUrl || null)
    setIsAiMode(false)
    toast.success("AI Design loaded into the editor!")
  }

  React.useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setNetwork(initialData.network)
        setAccountName(initialData.accountName || "@brand_official")
        setPostType(initialData.postType)
        setContent(initialData.content)
        setMediaUrl(initialData.mediaUrls?.[0] || null)
        if (initialData.scheduledTimestamp) {
          setIsScheduling(true)
          const d = parseISO(initialData.scheduledTimestamp)
          setScheduleDate(format(d, "yyyy-MM-dd"))
          setScheduleTime(format(d, "HH:mm"))
        } else {
          setIsScheduling(false)
          setScheduleDate("")
          setScheduleTime("")
        }
      } else {
        setNetwork('Instagram')
        setAccountName("@brand_official")
        setPostType('Post')
        setContent("")
        setMediaUrl(null)
        setIsScheduling(false)
        setScheduleDate("")
        setScheduleTime("")
      }
    }
  }, [isOpen, initialData])

  const getPostTypes = (net: Network): PostType[] => {
    switch(net) {
      case 'Instagram': return ['Post', 'Story', 'Reel']
      case 'Facebook': return ['Post', 'Story', 'Reel']
      case 'TikTok': return ['Video', 'Story']
      case 'YouTube': return ['Video', 'Short']
      case 'LinkedIn': return ['Post']
      case 'Twitter': return ['Post']
    }
  }

  // Handle network change and reset post type if invalid
  const handleNetworkChange = (net: Network) => {
    setNetwork(net)
    const validTypes = getPostTypes(net)
    if (!validTypes.includes(postType)) {
      setPostType(validTypes[0])
    }
  }

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
      const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY

      if (!cloudName || !apiKey) {
        toast.error("Cloudinary Cloud Name or API Key is missing in .env.local")
        setIsUploading(false)
        return
      }

      // Get secure signature from our backend
      const { timestamp, signature } = await getCloudinarySignature()

      const formData = new FormData()
      formData.append("file", file)
      formData.append("api_key", apiKey)
      formData.append("timestamp", timestamp.toString())
      formData.append("signature", signature)
      
      const resourceType = file.type.startsWith('video/') ? 'video' : 'image'

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
        method: "POST",
        body: formData,
      })

      const data = await response.json()
      
      if (data.secure_url) {
        // Apply compression and shrinking transformations
        let optimizedUrl = data.secure_url
        if (resourceType === 'image') {
          optimizedUrl = optimizedUrl.replace('/upload/', '/upload/q_auto,f_auto,w_1080/')
        } else {
          optimizedUrl = optimizedUrl.replace('/upload/', '/upload/q_auto,f_auto/')
        }
        
        setMediaUrl(optimizedUrl)
        toast.success("Media uploaded and compressed successfully!")
      } else {
        toast.error("Upload failed: " + (data.error?.message || "Unknown error"))
      }
    } catch (error) {
      console.error(error)
      toast.error("Upload failed. Please check your internet connection.")
    } finally {
      setIsUploading(false)
      // Reset input so the same file can be uploaded again if removed
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleTriggerUpload = () => {
    if (!isUploading && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const validatePost = () => {
    if (!content && !mediaUrl) {
      toast.error("Please add some text or media before posting.")
      return false
    }
    return true
  }

  const handlePostNow = async () => {
    if (!validatePost()) return
    
    const payload: PostPayload = {
      id: initialData?.id,
      network,
      postType,
      content,
      mediaUrls: mediaUrl ? [mediaUrl] : [],
      scheduledTimestamp: null,
      accountName,
      brandId: localStorage.getItem("activeBrandId") || "",
    }
    
    if (network === 'YouTube' && mediaUrl) {
      setIsPublishing(true);
      try {
        const response = await fetch('/api/youtube/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            brandId: payload.brandId,
            accountHandle: accountName,
            title: content.split('\n')[0].substring(0, 50) || "SyncFlow Video",
            description: content,
            mediaUrl: mediaUrl,
          }),
        });
        const result = await response.json();
        setIsPublishing(false);

        if (!response.ok) {
          toast.error(`YouTube Upload Failed: ${result.error}`);
          return;
        }

        toast.success(`Video successfully uploaded to YouTube! (ID: ${result.videoId})`);
      } catch (err: any) {
        setIsPublishing(false);
        toast.error(`Upload error: ${err.message}`);
        return;
      }
    } else {
      toast.success(`${postType} published instantly to ${network}!`)
    }
    
    if (onSavePost) onSavePost(payload)
    onClose()
  }

  const handleScheduleConfirm = () => {
    if (!validatePost()) return
    if (!scheduleDate || !scheduleTime) {
      toast.error("Please select both a date and a time to schedule.")
      return
    }

    const scheduledDateObj = new Date(`${scheduleDate}T${scheduleTime}`)
    
    const payload: PostPayload = {
      id: initialData?.id,
      network,
      postType,
      content,
      mediaUrls: mediaUrl ? [mediaUrl] : [],
      scheduledTimestamp: scheduledDateObj.toISOString(),
      accountName
    }
    
    if (onSavePost) onSavePost(payload)
    toast.success(`${postType} scheduled for ${network}!`)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[1200px] sm:max-w-[1200px] w-[95vw] h-[90vh] p-0 overflow-hidden bg-[#F9FAFB] flex flex-col rounded-3xl border-slate-200/60 shadow-2xl">
        
        {/* Header */}
        <div className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0 z-10 shadow-sm relative">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm transition-colors ${isAiMode ? 'bg-orange-500' : 'bg-slate-800'}`}>
              {isAiMode ? <Sparkles className="w-5 h-5" /> : <PlusIcon className="w-5 h-5" />}
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-800">{isAiMode ? "AI Ideas Generator" : (initialData ? "Edit Post" : "Create New Post")}</h2>
          </div>
          
          {/* AI Toggle */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex bg-slate-100 p-1 rounded-full shadow-inner border border-slate-200">
            <button 
              onClick={() => setIsAiMode(false)}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${!isAiMode ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Manual Mode
            </button>
            <button 
              onClick={() => setIsAiMode(true)}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${isAiMode ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-sm' : 'text-slate-500 hover:text-orange-500'}`}
            >
              <Wand2 className="w-4 h-4" />
              AI Ideas
            </button>
          </div>

          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-100">
            <X className="w-5 h-5 text-slate-500" />
          </Button>
        </div>

        {/* Two Column Layout */}
        <div className="flex flex-1 overflow-hidden">
          
          {!isAiMode ? (
            <>
              {/* Left Column: Editor */}
              <div className="w-full lg:w-1/2 border-r border-slate-200 bg-white flex flex-col overflow-y-auto">
            <div className="p-6 space-y-8 flex-1">
              
              {/* Network Selection */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">1. Select Network</label>
                <div className="flex flex-wrap gap-3">
                  {NETWORKS.map(net => {
                    const isSelected = network === net.id
                    return (
                      <button
                        key={net.id}
                        onClick={() => handleNetworkChange(net.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-semibold transition-all ${
                          isSelected 
                            ? `${net.color} shadow-sm ring-1 ring-black/5` 
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <net.icon className={`w-4 h-4 ${isSelected ? '' : 'opacity-70'}`} />
                        {net.id}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Account Selection */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">2. Account</label>
                <Select value={accountName} onValueChange={(val) => setAccountName(val || "")}>
                  <SelectTrigger className="bg-white text-slate-900 border-slate-200 w-full max-w-sm shadow-sm h-10">
                    <SelectValue placeholder="Select an account" />
                  </SelectTrigger>
                  <SelectContent>
                    {dbAccounts[network] && dbAccounts[network].length > 0 ? (
                      dbAccounts[network].map(acc => (
                        <SelectItem key={acc} value={acc}>{acc}</SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>No accounts connected</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Post Type Selection */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">3. Format</label>
                <div className="flex flex-wrap gap-2">
                  {getPostTypes(network).map(type => (
                    <button
                      key={type}
                      onClick={() => setPostType(type)}
                      className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                        postType === type
                          ? 'bg-slate-800 text-white shadow-md'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Editor */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">4. Caption</label>
                <Textarea 
                  placeholder="What do you want to share?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[150px] resize-none text-base p-4 rounded-xl border-slate-200 focus-visible:ring-orange-500 bg-white text-slate-900 shadow-sm"
                />
              </div>

              {/* Media Upload */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">5. Media</label>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="image/*,video/*"
                  className="hidden" 
                />

                {mediaUrl ? (
                  <div className="relative rounded-xl border-2 border-slate-200 overflow-hidden group bg-slate-100 aspect-video flex items-center justify-center">
                    {mediaUrl.includes('/video/') ? (
                      <video src={mediaUrl} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                    ) : (
                      <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="destructive" onClick={() => setMediaUrl(null)} className="shadow-lg">Remove Media</Button>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={handleTriggerUpload}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                      isUploading ? 'border-orange-300 bg-orange-50' : 'border-slate-300 hover:border-orange-400 hover:bg-orange-50/30 bg-white shadow-sm'
                    }`}
                  >
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
                        <p className="text-sm font-bold text-orange-600">Uploading & Compressing...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-slate-500">
                        <div className="flex gap-4">
                          <ImageIcon className="w-8 h-8 opacity-60" />
                          <Video className="w-8 h-8 opacity-60" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700">Click to browse files</p>
                          <p className="text-xs font-medium text-slate-400 mt-1">Upload images or videos directly to Cloudinary</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>

            {/* Footer / Actions */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col shrink-0 gap-4">
              
              <AnimatePresence>
                {isScheduling && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden flex gap-4"
                  >
                    <div className="flex-1 space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date</label>
                      <Input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} className="bg-white" />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Time</label>
                      <Input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} className="bg-white" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={onClose} className="font-semibold text-slate-600 hover:bg-slate-200">
                  Cancel
                </Button>
                
                {isScheduling ? (
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setIsScheduling(false)} className="font-semibold border-slate-300">
                      Cancel Scheduling
                    </Button>
                    <Button onClick={handleScheduleConfirm} className="font-semibold bg-orange-500 hover:bg-orange-600 text-white shadow-md">
                      <Check className="w-4 h-4 mr-2" /> {initialData ? "Update Schedule" : "Confirm Schedule"}
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => setIsScheduling(true)} className="font-semibold bg-white border border-slate-200 shadow-sm text-slate-700 hover:bg-slate-100">
                      <Clock className="w-4 h-4 mr-2" /> Schedule for Later
                    </Button>
                    <Button onClick={handlePostNow} className="font-semibold bg-orange-500 hover:bg-orange-600 text-white shadow-md">
                      <Send className="w-4 h-4 mr-2" /> {initialData ? "Update Now" : "Post Now"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Live Preview */}
          <div className="hidden lg:flex flex-1 items-center justify-center p-8 bg-[#F3F4F6] relative overflow-y-auto">
            
            <div className="absolute top-6 left-6">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Live Preview</h3>
            </div>

            {/* Phone Frame */}
            <div className="w-[340px] h-[680px] bg-white rounded-[40px] shadow-2xl border-[8px] border-slate-800 overflow-hidden relative flex flex-col">
              
              {/* Dynamic Top Bar */}
              <div className="h-14 border-b border-slate-100 flex items-center px-4 shrink-0 bg-white z-10 justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center ${NETWORKS.find(n=>n.id===network)?.color}`}>
                    {React.createElement(NETWORKS.find(n=>n.id===network)?.icon || Globe, { className: 'w-3.5 h-3.5' })}
                  </div>
                  <span className="font-bold text-sm text-slate-800">{network} {postType}</span>
                </div>
                <MoreHorizontalIcon className="w-5 h-5 text-slate-400" />
              </div>

              {/* Preview Content Area */}
              <div className="flex-1 overflow-y-auto bg-white flex flex-col">
                
                {/* Header (User profile) */}
                <div className="p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0"></div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 leading-none mb-1">Your Brand</p>
                    <p className="text-[10px] font-medium text-slate-500 leading-none">Just now</p>
                  </div>
                </div>

                {/* Post Text (if network places text before media, like FB/LinkedIn/Twitter) */}
                {['Facebook', 'LinkedIn', 'Twitter'].includes(network) && (
                  <div className="px-3 pb-3 text-[13px] text-slate-800 whitespace-pre-wrap">
                    {content || <span className="text-slate-400">Your caption will appear here...</span>}
                  </div>
                )}

                {/* Media */}
                {mediaUrl ? (
                  <div className={`w-full bg-slate-100 relative ${postType === 'Story' || postType === 'Reel' || postType === 'Short' ? 'aspect-[9/16]' : 'aspect-square'}`}>
                    {mediaUrl.includes('/video/') ? (
                      <video src={mediaUrl} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                    ) : (
                      <img src={mediaUrl} alt="Preview Media" className="w-full h-full object-cover" />
                    )}
                  </div>
                ) : (
                  <div className={`w-full bg-slate-50 flex items-center justify-center border-y border-slate-100 ${postType === 'Story' || postType === 'Reel' || postType === 'Short' ? 'aspect-[9/16]' : 'aspect-square'}`}>
                    <ImageIcon className="w-8 h-8 text-slate-300" />
                  </div>
                )}

                {/* Post Text (if network places text after media, like Instagram) */}
                {['Instagram', 'TikTok', 'YouTube'].includes(network) && postType !== 'Story' && (
                  <div className="p-3 text-[13px] text-slate-800 whitespace-pre-wrap">
                    <span className="font-bold mr-2">your_brand</span>
                    {content || <span className="text-slate-400">Your caption will appear here...</span>}
                  </div>
                )}

                {/* Fake action bar */}
                <div className="mt-auto p-3 flex gap-4 text-slate-400 border-t border-slate-50">
                  <HeartIcon className="w-5 h-5" />
                  <MessageCircleIcon className="w-5 h-5" />
                  <ShareIcon className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
          </>
          ) : (
          <>
            {/* AI Left Column: Generated Designs */}
            <div className="w-full lg:w-[60%] border-r border-slate-200 bg-slate-50 flex flex-col overflow-y-auto p-6 relative">
              <div className="max-w-3xl mx-auto w-full space-y-6 pb-20">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold tracking-tight text-slate-800">Generated Ideas</h3>
                  <p className="text-slate-500">Pick a design generated by the AI to load it into the editor.</p>
                </div>
                {aiDesigns.map(design => (
                  <div key={design.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row hover:border-orange-300 hover:shadow-md transition-all group">
                    {design.mediaUrl && (
                      <div className="w-full md:w-48 shrink-0 bg-slate-100 aspect-square md:aspect-auto">
                        <img src={design.mediaUrl} alt="Generated" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">
                          {design.network}
                        </span>
                        <span className="text-xs text-slate-400 font-medium line-clamp-1 flex-1">Prompt: {design.promptUsed}</span>
                      </div>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap flex-1 mb-4 line-clamp-4">{design.caption}</p>
                      
                      <div className="flex gap-2 mt-auto pt-4 border-t border-slate-100">
                        <Button 
                          onClick={() => handleUseAiDesign(design)}
                          className="flex-1 bg-orange-50 text-orange-700 hover:bg-orange-100 font-bold border border-orange-200"
                        >
                          <Check className="w-4 h-4 mr-2" /> Use this Design
                        </Button>
                        <Button variant="outline" className="text-slate-500 font-semibold border-slate-200">
                          <Bookmark className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Right Column: Chatbot */}
            <div className="w-full lg:w-[40%] bg-white flex flex-col overflow-hidden relative">
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-3 shrink-0">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">AI Assistant</h3>
                  <p className="text-xs text-slate-500">Powered by advanced LLMs</p>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-3 text-[13px] ${
                      msg.role === 'user' 
                        ? 'bg-orange-500 text-white rounded-br-none' 
                        : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isAiLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 text-slate-500 rounded-2xl rounded-bl-none p-4 flex gap-1.5 border border-slate-200">
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-white border-t border-slate-200 shrink-0">
                <form onSubmit={handleAiChatSubmit} className="relative flex items-end gap-2">
                  <div className="relative flex-1">
                    <Textarea 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask the AI to generate a post idea..."
                      className="min-h-[50px] max-h-[150px] resize-none pr-12 text-sm bg-white text-slate-900 border-slate-200 rounded-xl py-3 shadow-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAiChatSubmit(e);
                        }
                      }}
                    />
                    <Button 
                      type="submit" 
                      disabled={isAiLoading || !chatInput.trim()}
                      size="icon" 
                      className="absolute right-2 bottom-2 w-8 h-8 rounded-lg bg-orange-500 hover:bg-orange-600 text-white shadow-sm disabled:opacity-50"
                    >
                      <SendHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </form>
                <div className="mt-2 text-center text-[10px] text-slate-400">
                  AI can make mistakes. Consider verifying important information.
                </div>
              </div>
            </div>
          </>
          )}

        </div>
      </DialogContent>
    </Dialog>
  )
}

function PlusIcon(props: React.ComponentProps<"svg">) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 12h14"/><path d="M12 5v14"/></svg>
}
function MoreHorizontalIcon(props: React.ComponentProps<"svg">) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
}
function HeartIcon(props: React.ComponentProps<"svg">) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
}
function MessageCircleIcon(props: React.ComponentProps<"svg">) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
}
function ShareIcon(props: React.ComponentProps<"svg">) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>
}
