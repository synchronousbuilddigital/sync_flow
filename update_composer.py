import re

with open("src/components/dashboard/post-composer.tsx", "r") as f:
    content = f.read()

# Add isPublishing state
old_state = "  const [isUploading, setIsUploading] = useState(false)"
new_state = """  const [isUploading, setIsUploading] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)"""
content = content.replace(old_state, new_state)

# Modify handlePostNow to be async and call the upload API for YouTube
old_post = """  const handlePostNow = () => {
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
    
    if (onSavePost) onSavePost(payload)
    toast.success(`${postType} published instantly to ${network}!`)
    onClose()
  }"""

new_post = """  const handlePostNow = async () => {
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
            title: content.split('\\n')[0].substring(0, 50) || "SyncFlow Video", // Extract title from first line of caption
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
  }"""

content = content.replace(old_post, new_post)

# Update the publish button to show spinner
old_btn = """              <Button 
                onClick={handlePostNow}
                className={`font-bold text-white px-8 h-12 shadow-md transition-all ${networkData.color.split(' ')[0]} ${networkData.color.split(' ')[0].replace('bg-', 'hover:bg-')}`}
              >
                <Send className="w-4 h-4 mr-2" />
                Publish Now
              </Button>"""

new_btn = """              <Button 
                onClick={handlePostNow}
                disabled={isPublishing}
                className={`font-bold text-white px-8 h-12 shadow-md transition-all ${networkData.color.split(' ')[0]} ${networkData.color.split(' ')[0].replace('bg-', 'hover:bg-')}`}
              >
                {isPublishing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Publish Now
                  </>
                )}
              </Button>"""

content = content.replace(old_btn, new_btn)

with open("src/components/dashboard/post-composer.tsx", "w") as f:
    f.write(content)
print("Updated post composer for YouTube Upload")
