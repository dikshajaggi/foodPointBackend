const mongoose = require("mongoose");
const addressSchema = require("./address");

const orderSchema = new mongoose.Schema({
    user_details: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "restaurant", 
        required: true
    },
    items : [
        {
            menuItem: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "menuItem"
            },
            quantity: Number,
            price: Number 
        }
    ],
    totalAmount: {
        type: Number,
        required: true,
        validate: {
            validator :  function (value) {
                return typeof value === 'number' && !isNaN(value)
            }
        }
    },
    deliveryAddress: {type: [addressSchema],
        validate: {
        validator: function (value) {
            return value && value.length > 0;
            },
            message: "At least one address is required"
        }
    },
    paymentMode: {
        type: String,
        enum: ["Cash on Delivery", "Card", "UPI"],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ["Pending", "Paid", "Failed"],
        default: "Pending"
    },
    orderStatus: {
        type: String,
        enum: ["Pending", "Confirmed", "Preparing", "Out for Delivery", "Delivered", "Cancelled"],
        default: "Pending"
    }
}, {timestamps: true})


const order = new mongoose.model("order", orderSchema)
module.exports = order