const express = require("express")
const { addItemToCart, removeItemFromCart, clearCart, checkSingleRestaurant } = require("../controllers/cart")

const Router = express.Router()


Router.route("/add-item-to-cart").post(addItemToCart)
Router.route("/remove-item-from-cart").post(removeItemFromCart)
Router.route("/clear-cart").delete(clearCart)
Router.route("/check-single-restaurant").post(checkSingleRestaurant)

module.exports = Router