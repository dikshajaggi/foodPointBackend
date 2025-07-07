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

const verificationSchema = new mongoose.Schema({
    gstNo: {
        type: String,
        required: true
    },
    businessType: {
        type: String,
        required: true,
        enum: ["Sole Proprietor", "Partnership", "Pvt Ltd" ]
    },
    fssaiLicenseNumber: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    ownerIdProof: {
        aadhar:{ 
            type: String,
            required: true
        },
        pan: {
            type: String,
            required: true
        },
        photo: {
            type: String,
            required: true
        },
    },
    bankDetails: {
        accountNumber: {
            type: String,
            required: true
        },
        ifsc: {
            type: String,
            required: true
        },
        upiId: {
            type: String,
            required: true
        },
        cancelledCheque: {
            type: String,
            required: true
        },
    },
})

const restaurantSchema = new mongoose.Schema({
   owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true
    },
    name: {
        type: String,
        required: true
    },
    address: {
        type: addressSchema,
        required: true,
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
    rating: Number,
    cuisines: [String],
    tags: {
        type: [String],
        enum: [
            "Pure Veg", "Vegan", "Budget Friendly", "Family Friendly", "New on FoodPoint", "Under ₹200",
            "Fast Delivery", "Top Rated", "Late Night Eats"
        ]
    },
    verificationDetails: {
        type: verificationSchema,
        required: true
    },
    verificationStatus: {
        type: String,
        enum: ["pending", "verified", "rejected"],
        default: "pending"
    }

}, {timestamps: true})

const restaurant = new mongoose.model("restaurant", restaurantSchema)
module.exports = restaurant