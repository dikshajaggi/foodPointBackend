const express = require("express")
const { addItemToCart, removeItemFromCart, clearCart } = require("../controllers/cart")
const getToken = require("../middlewares/auth")

const Router = express.Router()


Router.route("/add-item-to-cart").post(getToken, addItemToCart)
Router.route("/remove-item-from-cart").post(getToken, removeItemFromCart)
Router.route("/clear-cart").delete(getToken, clearCart)

module.exports = Router