import { Router } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import path from "path";
import fs from "fs";

const uploadsDir = path.join(process.cwd(), "src", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const router = Router();

let upload;
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    ...(process.env.CLOUDINARY_API_KEY && {
      api_key: process.env.CLOUDINARY_API_KEY,
    }),
    ...(process.env.CLOUDINARY_API_SECRET && {
      api_secret: process.env.CLOUDINARY_API_SECRET,
    }),
  });
  const params = {
    folder: "uploads",
  };
  if (process.env.CLOUDINARY_UPLOAD_PRESET) {
    params.upload_preset = process.env.CLOUDINARY_UPLOAD_PRESET;
  }
  const storage = new CloudinaryStorage({ cloudinary, params });
  upload = multer({ storage });
} else {
  const storage = multer.diskStorage({
    destination: uploadsDir,
    filename: (_req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
    },
  });
  upload = multer({ storage });
}

router.post("/", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  const url = req.file.path.startsWith("http")
    ? req.file.path
    : `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  const secureUrl = req.file.secure_url || url;

  res.json({ url, secure_url: secureUrl });
});

export default router;
