import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { Request } from 'express';

// Set storage engine untuk mengatur lokasi penyimpanan dan penamaan file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Folder tempat file akan disimpan
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
    // Penamaan file dengan format fieldname-timestamp.ext
  },
});

// Mengecek tipe file (misalnya, hanya gambar yang diizinkan)
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const filetypes = /jpeg|jpg|png|gif/; // Tipe file yang diizinkan
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images are allowed!')); // Menolak file yang tidak sesuai
  }
};

// Inisialisasi Multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // Limit ukuran file 1MB
  fileFilter: fileFilter,
});

export default upload;
