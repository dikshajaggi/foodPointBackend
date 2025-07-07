const mongoose = require("mongoose");
const {menuItemsSchema} = require("./menuItems");
const {offersSchema} = require("./offers");
const outletSchema = require("./outlet");

const addressSchema = new mongoose.Schema({
    building: { type: String },
    street: { type: String },
    city: { type: String, required: true },
    pincode: { type: Number, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    nearby: { type: String }
})

const restaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    address: {
        type: addressSchema,
        required: true,
    },
    outlets: {
        type: [outletSchema],
    },
    deliveryRadius: {
        type: Number, // in kilometers
        required: true
    },
    phoneNo: {
        type: String, // string for phone numbers (avoid precision loss)
        required: true,
        match: [/^\d{10,15}$/, "Invalid phone number"]
    },
    thumbnail: {
        type: String,
        default: "default-img-url"
    },
    costForTwo: {
        type: Number,
        required: true
    },
    etd: {
        type: Number,
        required: true
    },
    isAvailable: {
        type: Boolean,
        default: true,
        required: true
    },
    offers: {
        type: [offersSchema],
    },
    deliveryChargeRules: {
        freeDeliveryUptoKm: {
        type: Number,
        default: 3 // free up to 3km
        },
        perKmChargeBeyondFree: {
        type: Number,
        default: 10 // ₹10/km after free radius
        }
    },
    menu: {
        type: [menuItemsSchema],
        required: true,
        validate: {
        validator: function (value) {
            return value && value.length > 0;
            },
            message: "Menu should contain at least one item"
        }
    },
    rating: Number,
    cuisines: [String],
    tags: {
        type: String,
        enum: [
            "Pure Veg", "Halal", "Vegan", "Budget Friendly", "Family Friendly", "New on FoodPoint", "Under ₹200",
            "Fast Delivery", "New", "Top Rated", "South Indian", "Chinese", "Italian", "Late Night Eats"
        ]
    }

}, {timestamps: true})

const restaurant = new mongoose.model("restaurant", restaurantSchema)
module.exports = restaurant