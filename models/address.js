const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
    label: {
        type: String,
        enum: ["home", "work", "other"],
        required: true
    },
    house: { type: String },
    street: { type: String },
    city: { type: String, required: true },
    pincode: { type: Number, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    nearby: { type: String }
})

module.exports = addressSchema