const express = require("express")
const { removeMenuItem, addMenuItem, bulkUploadMenuItems } = require("../controllers/menuItems")
const getToken = require("../middlewares/auth")
const imageUpload = require("../middlewares/imageUpload")
const csvUpload = require("../middlewares/csvUpload")

const Router = express.Router()

Router.route("/add-menu-item").post(getToken, imageUpload.single("image"), addMenuItem)
Router.route("/remove-menu-item").delete(getToken, removeMenuItem)
Router.route("/bulk-upload-menu-items").post(getToken, csvUpload.single("file"), bulkUploadMenuItems)


module.exports = Router

// Multer doesn't allow multiple .single() calls in one middleware chain. Each one overwrites the previous req.file, so the second one (image) wins, and you lose the first (CSV).
// Also, this prevents req.body from being populated correctly — and causes req.body to be undefined.

