import { v2 as cloudinary } from 'cloudinary'
import fs from "fs"

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});
   
const cloudinaryfileupload=async (filepath)=>{
    try {
        if(!filepath) return null;
        const response=await cloudinary.uploader.upload(filepath,{
            resource_type:"auto"
        })
        console.log("file has been uploaded")
        console.log(response.url)
        return response
    } catch (error) {
        fs.unlinksync(filepath) // remove locally saved temporary file as upload is failed
        return null;
    }
}

export {cloudinaryfileupload}