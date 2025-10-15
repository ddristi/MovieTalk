import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});
    console.log({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? "Loaded" : "Missing",
  api_key: process.env.CLOUDINARY_API_KEY ? "Loaded" : "Missing",
  api_secret: process.env.CLOUDINARY_API_SECRET ? "Loaded" : "Missing"
});
    const uploadOnCloudinary = async(localFilePath) => {     
    try{  
        if(!localFilePath) {
            console.error("No local file path provided!");
            return null;
        }
    
              const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
         console.log("✅ Cloudinary upload success:", response.secure_url);
        fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
        console.error("❌ Cloudinary upload error:", error.message);
       fs.unlinkSync(localFilePath)
        return null;
    }
} 
export {uploadOnCloudinary}  