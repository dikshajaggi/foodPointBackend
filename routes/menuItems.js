const express = require("express")
const { removeMenuItem, addMenuItem, bulkUploadMenuItems, updateMenuItems, showAllMenuItems } = require("../controllers/menuItems")
const getToken = require("../middlewares/auth")
const imageUpload = require("../middlewares/imageUpload")
const csvUpload = require("../middlewares/csvUpload")
const isRestOwner = require("../middlewares/isRestOwner");

const Router = express.Router()

Router.route("/add").post(getToken, isRestOwner, imageUpload.single("image"), addMenuItem)
Router.route("/remove").delete(getToken, isRestOwner, removeMenuItem)
Router.route("/update").patch(getToken, isRestOwner, imageUpload.single("image"), updateMenuItems)
Router.route("/all").get(getToken, showAllMenuItems)
Router.route("/bulk-upload").post(getToken, isRestOwner, csvUpload.single("file"), bulkUploadMenuItems)


module.exports = Router

// Multer doesn't allow multiple .single() calls in one middleware chain (even if one is image and the other is csv). Each one overwrites the previous req.file, so the second one (image) wins, and you lose the first (CSV).
// Also, this prevents req.body from being populated correctly — and causes req.body to be undefined.

