const express = require("express")
const { RegisterRestaurant, getSpecificRestaurant, getAllRestaurants, updateRestaurant, restaurantVerification, deleteRestaurant } = require("../controllers/restaurant")
const imageUpload = require("../middlewares/imageUpload")
const getToken = require("../middlewares/auth")
const isAdmin = require("../middlewares/isAdmin");
const isRestOwner = require("../middlewares/isRestOwner");

const Router = express.Router()

Router.route("/add").post(getToken, isRestOwner, imageUpload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "photo", maxCount: 1 },
    { name: "cancelledCheque", maxCount: 1 }
  ]), RegisterRestaurant)   
  
  //in postman while testing just mention "photo" and "cancelledCheque" and not like this ---> verificationDetails[bankDetails][cancelledCheque]
  //same for frontend also---> the field names should match with multer
  
Router.route("/all").get(getAllRestaurants)
Router.route("/specific/:name").get(getSpecificRestaurant)
Router.route("/update").patch(getToken, isRestOwner, updateRestaurant)
Router.route("/verify").post(getToken, isAdmin, restaurantVerification)
Router.route("/delete/:id").delete(getToken, isRestOwner, deleteRestaurant)

module.exports = Router