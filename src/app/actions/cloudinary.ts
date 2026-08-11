"use server"

import crypto from "crypto"

export async function getCloudinarySignature() {
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  if (!apiSecret) {
    throw new Error("CLOUDINARY_API_SECRET is not set in .env.local")
  }
  
  const timestamp = Math.round(new Date().getTime() / 1000)
  
  const signature = crypto.createHash('sha1')
    .update(`timestamp=${timestamp}${apiSecret}`)
    .digest('hex')
    
  return { timestamp, signature }
}

export async function deleteCloudinaryMedia(secureUrl: string) {
  try {
    const apiSecret = process.env.CLOUDINARY_API_SECRET
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

    if (!apiSecret || !apiKey || !cloudName) {
      console.error("Missing Cloudinary credentials for deletion");
      return false;
    }

    // Extract public_id and resource_type from URL
    // e.g. https://res.cloudinary.com/cloudName/image/upload/v12345/public_id.jpg
    const urlParts = secureUrl.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    if (uploadIndex === -1) return false;

    // Resource type is typically the part before 'upload'
    const resourceType = urlParts[uploadIndex - 1]; // 'image' or 'video'

    // The public_id is everything after the version number (if present), minus the file extension
    // Find the first part after 'upload' that doesn't start with 'v' (versioning)
    let publicIdPart = urlParts.slice(uploadIndex + 1);
    if (publicIdPart[0].startsWith('v') && !isNaN(parseInt(publicIdPart[0].substring(1)))) {
      publicIdPart = publicIdPart.slice(1);
    }
    
    // Rejoin parts in case public_id has folders, and remove file extension
    let publicId = publicIdPart.join('/');
    publicId = publicId.substring(0, publicId.lastIndexOf('.')) || publicId;

    const timestamp = Math.round(new Date().getTime() / 1000)
    
    const signature = crypto.createHash('sha1')
      .update(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)
      .digest('hex')

    const formData = new URLSearchParams();
    formData.append("public_id", publicId);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp.toString());
    formData.append("signature", signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });

    const data = await response.json();
    return data.result === 'ok';

  } catch (error) {
    console.error("Failed to delete Cloudinary media:", error);
    return false;
  }
}
