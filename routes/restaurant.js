const express = require("express")
const { RegisterRestaurant, getSpecificRestaurant, getAllRestaurants, updateRestaurant, addMenuItem, removeMenuItem } = require("../controllers/restaurant")
const imageUpload = require("../middlewares/imageUpload")
const getToken = require("../middlewares/auth")

const Router = express.Router()

Router.route("/resgister-restaurant").post(getToken, imageUpload.single("thumbnail"), RegisterRestaurant)
Router.route("/update-restaurant").patch(getToken, imageUpload.single("thumbnail"), updateRestaurant)
Router.route("/all-restaurants").get(getToken, getAllRestaurants)
Router.route("/:name").get(getToken, getSpecificRestaurant)
Router.route("/add-menu-item").post(getToken, imageUpload.single("image"), addMenuItem)
Router.route("/remove-menu-item").delete(getToken, removeMenuItem)

module.exports = Router