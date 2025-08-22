const mongoose = require("mongoose");
const addOnSchema = require("./addOn");

const menuItemsSchema = new mongoose.Schema({
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "restaurant",
        required: true
    },
    label: {
        type: String,
        enum: ["veg", "non-veg", "vegan"],
        required: true
    },
    name: {
        type: String,
        required: true
    },
    cost: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        default: "default-img-url"
    },
    availability: {
        type: String,
        required: true,
        default: "all-day",
        enum: ["all-day", "breakfast", "fasting", "not-available", "seasonal"]
    },
    addOns: {
        type: [addOnSchema]
    }
})

menuItemsSchema.index({ name: "text" });

const menuItem = new mongoose.model("menuItem", menuItemsSchema)

module.exports = menuItem