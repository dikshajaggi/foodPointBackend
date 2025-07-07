const express = require("express")
const { addItem, removeItem, placeOrder } = require("../controllers/order")

const Router = express.Router()

Router.route("/add-item").post(addItem)
Router.route("/remove-item").post(removeItem)
Router.route("/place-order").post(placeOrder)

module.exports = Router