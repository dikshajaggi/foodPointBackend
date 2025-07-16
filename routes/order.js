const express = require("express")
const { placeOrder, cancelOrder, changeDeliveryAddress } = require("../controllers/order")

const Router = express.Router()


Router.route("/place-order").post(placeOrder)
Router.route("/cancel-order").post(cancelOrder)
Router.route("/update-delivery-address").patch(changeDeliveryAddress)

module.exports = Router