const express = require("express")
const { RegisterRestaurant, getSpecificRestaurant, getAllRestaurants, updateRestaurant, addMenuItem, removeMenuItem } = require("../controllers/restaurant")
const imageUpload = require("../middlewares/imageUpload")
const getToken = require("../middlewares/auth")

const Router = express.Router()

Router.route("/resgister-restaurant").post(getToken, imageUpload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "photo", maxCount: 1 },
    { name: "cancelledCheque", maxCount: 1 }
  ]), RegisterRestaurant)   
  
  //in postman while testing just mention "photo" and "cancelledCheque" and not like this ---> verificationDetails[bankDetails][cancelledCheque]
  //same for frontend also---> the field names should match with multer

Router.route("/update-restaurant").patch(getToken, updateRestaurant)
Router.route("/all-restaurants").get(getAllRestaurants)
Router.route("/:name").get(getSpecificRestaurant)
Router.route("/add-menu-item").post(getToken, imageUpload.single("image"), addMenuItem)
Router.route("/remove-menu-item").delete(getToken, removeMenuItem)

module.exports = Router