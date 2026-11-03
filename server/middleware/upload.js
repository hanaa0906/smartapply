const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Vercel's deployment filesystem is read-only; /tmp is writable but ephemeral.
const uploadDir = process.env.VERCEL
  ? path.join('/tmp', 'smartapply-uploads')
  : path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file format. Please upload PDF, PNG or JPEG files.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: (process.env.VERCEL ? 4 : 5) * 1024 * 1024 }, // Leave room for multipart overhead on Vercel.
  fileFilter: fileFilter
});

module.exports = upload;
