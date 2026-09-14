import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

export const uploadResume = multer({
  storage,
  limits: {
    fileSize: Number(process.env.MAX_RESUME_SIZE_MB || 5) * 1024 * 1024
  },
  fileFilter: (req, file, callback) => {
    const allowed = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (allowed.includes(file.mimetype) && /\.(pdf|docx)$/i.test(file.originalname || "")) return callback(null, true);
    callback(Object.assign(new Error("Only PDF and DOCX files are supported."), { statusCode: 400 }));
  }
});
