const express = require("express")
const { addItemToCart, decItemQty, incItemQty, clearCart } = require("../controllers/cart")
const getToken = require("../middlewares/auth")

const Router = express.Router()


Router.route("/add").post(getToken, addItemToCart)
Router.route("/incQty/:id").patch(getToken, incItemQty)
Router.route("/decQty/:id").patch(getToken, decItemQty)
Router.route("/clear").delete(getToken, clearCart)

// get cart api 

module.exports = Router