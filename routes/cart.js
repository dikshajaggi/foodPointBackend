const express = require("express")
const { addItemToCart, removeItemFromCart, clearCart } = require("../controllers/cart")
const getToken = require("../middlewares/auth")

const Router = express.Router()


Router.route("/add").post(getToken, addItemToCart)
Router.route("/remove").post(getToken, removeItemFromCart)
Router.route("/clear").delete(getToken, clearCart)

// get cart api 

module.exports = Router