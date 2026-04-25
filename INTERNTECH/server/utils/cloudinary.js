import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Setup Cloudinary storage for Multer
export const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "interntech/resumes", // Folder name in Cloudinary
    allowed_formats: ["pdf", "doc", "docx", "png", "jpg", "jpeg"],
    resource_type: "auto", // Allows non-image files like PDFs
    public_id: (req, file) => {
      return `${Date.now()}-${file.originalname.replace(/\.\w+$/, "").replace(/\s+/g, "-").toLowerCase()}`;
    }
  }
});

// Setup a separate storage for general uploads (like profile pictures) if needed
export const generalCloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "interntech/uploads",
    allowed_formats: ["png", "jpg", "jpeg", "webp"],
    public_id: (req, file) => {
      return `${Date.now()}-${file.originalname.replace(/\.\w+$/, "").replace(/\s+/g, "-").toLowerCase()}`;
    }
  }
});
