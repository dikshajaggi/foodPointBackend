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