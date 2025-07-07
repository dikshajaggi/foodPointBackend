const mongoose = require("mongoose");
const addOnSchema = require("./addOn");

const menuItemsSchema = new mongoose.Schema({
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

const menuItem = new mongoose.model("menuItem", menuItemsSchema)

module.exports = {menuItemsSchema, menuItem}