const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
    building: { type: String },
    street: { type: String },
    city: { type: String, required: true },
    pincode: { type: Number, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    nearby: { type: String }
})

const outletSchema = new mongoose.Schema({
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "restaurant",
        required: true
    },
    name: {
        type: String,
        required: true
    },
    address: {
        type: addressSchema,
        required: true
    },
    phoneNo: {
        type: Number,
        required: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
})

const outlet = new mongoose.model("outlet", outletSchema)

module.exports = offer