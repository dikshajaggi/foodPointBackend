const multer = require("multer")

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.originalname + '-' + uniqueSuffix)
  }
})

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, JPG, and PNG files are allowed"), false);
  }
};

const limits = {
    // fileSize: 5 * 1024 * 1024, // Limit file size to 5 MB
    files: 3 // Limit number of files per request
  }

const imageUpload = multer({ storage: storage, limits, fileFilter }); //uploading all types like pdf and images


// const imageUpload = multer({ storage: storage })

module.exports  = imageUpload