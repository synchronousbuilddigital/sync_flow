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
