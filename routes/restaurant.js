const express = require("express")
const { RegisterRestaurant } = require("../controllers/restaurant")
const imageUpload = require("../middlewares/imageUpload")
const getToken = require("../middlewares/auth")

const Router = express.Router()

Router.route("/resgister-restaurant").post(getToken, imageUpload.single("thumbnail"), RegisterRestaurant)

module.exports = Router