const multer = require("multer")
const path = require("path")

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/restData')
    },
    filename: function (req, file, cb) {
       cb(null, Date.now() + "-" + file.originalname);
    }
})

const fileFilter = function (req, file, cb) {
    if (path.extname(file.originalname) !== ".csv") {
      return cb(new Error("Only CSV files are allowed"));
    }
    cb(null, true);
}

  
const limits = {
    files: 3 // Limit number of files per request
}

const csvUpload = multer({
  storage: storage,
  limits,
  fileFilter
});

module.exports = csvUpload;