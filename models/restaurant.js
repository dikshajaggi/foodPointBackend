const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
    building: { 
        type: String,
        maxlength: [10, "Building name/number cannot exceed 50 characters"]
    },
    street: { 
        type: String,
        maxlength: [100, "Street cannot exceed 100 characters"]
    },
    city: { 
        type: String,
        required: true,
        minlength: [2, "City must be at least 2 characters"],
        maxlength: [50, "City name cannot exceed 50 characters"]
    },
    pincode: { 
        type: Number, 
        required: true,
        min: [100000, "Pincode must be 6 digits"],
        max: [999999, "Pincode must be 6 digits"]
    },
    state: { 
        type: String,
        required: true,
        minlength: [2, "State must be at least 2 characters"],
        maxlength: [50, "State name cannot exceed 50 characters"]
    },
    country: { 
        type: String,
        required: true, 
        default: "India", 
        minlength: [2, "State must be at least 2 characters"],
        maxlength: [50, "State name cannot exceed 50 characters"]
    },
    nearby: { 
        type: String,
        maxlength: [100, "Nearby landmark cannot exceed 100 characters"]
    }
})

const verificationSchema = new mongoose.Schema({
    gstNo: {
        type: String,
        required: true,
        match: [/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/, "Invalid GST Number"]
    },
    businessType: {
        type: String,
        required: true,
        enum: ["Sole Proprietor", "Partnership", "Pvt Ltd" ]
    },
    fssaiLicenseNumber: {
        type: String,
        required: true,
        match: [/^\d{14}$/, "Invalid FSSAI License Number (must be 14 digits)"]
    },
    email: {
        type: String,
        required: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            "Please fill a valid email address"
        ]
    },
    ownerIdProof: {
        aadhar:{ 
            type: String,
            required: true,
            match: [/^\d{12}$/, "Invalid Aadhar number (must be 12 digits)"]
        },
        pan: {
            type: String,
            required: true,
            match: [/^[A-Z]{5}\d{4}[A-Z]{1}$/, "Invalid PAN number"]
        },
        photo: {
            type: String,
            required: true
        },
    },
    bankDetails: {
        accountNumber: {
            type: String,
            required: true,
            match: [/^\d{9,18}$/, "Invalid Account Number"]
        },
        ifsc: {
            type: String,
            required: true,
            match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code"]
        },
        upiId: {
            type: String,
            required: true,
            match: [/^[\w.\-]{2,256}@[a-z]{2,64}$/, "Invalid UPI ID"]
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
        required: true,
        minlength: [3, "Username must be at least 3 characters long"],
        maxlength: [30, "Username cannot exceed 30 characters"]
    },
    address: {
        type: addressSchema,
    },
    deliveryRadius: {
        type: Number, // in kilometers
        required: true,
        min: [1, "Minimum delivery radius must be at least 1 km"],
        max: [50, "Delivery radius cannot exceed 50 km"]
    },
    phoneNo: {
        type: String, // string for phone numbers (avoid precision loss)
        required: true,
        match: [/^\d{10}$/, "Phone number must be exactly 10 digits"]
    },
    thumbnail: {
        type: String
        // default: "default-img-url"
    },
    costForTwo: {
        type: Number,
        required: true,
        min: [50, "Cost for two must be at least ₹50"],
        max: [20000, "Cost for two cannot exceed ₹20,000"]
    },
    etd: {
        type: Number,
        required: true,
        min: [1, "ETD must be at least 1 min"],
        max: [120, "ETD can't exceed 120 mins"]
    },
    isAvailable: {
        type: Boolean,
        default: true,
        required: true
    },
    deliveryChargeRules: {
        freeDeliveryUptoKm: {
            type: Number,
            default: 3, // free up to 3km
            min: [0, "Minimum delivery radius can be 0"],
            max: [50, "Delivery radius cannot exceed 50 km"]
        },
        perKmChargeBeyondFree: {
            type: Number,
            default: 10, // ₹10/km after free radius
            min: [0, "Minimum delivery charge can be 0"],
            max: [100, "Delivery charge cannot exceed 500"]
        }
    },
    rating: {
        type: Number,
        min: [0, "Minimum rating can be 0"],
        max: [5, "Rating cannot exceed 5"]
    },
    cuisines: {
        type: [String],
        validate: [arr => arr.length > 0, "At least one cuisine must be specified"]
    },
    tags: {
        type: [String],
        enum: [
            "Pure Veg", "Vegan", "Budget Friendly", "Family Friendly", "New on FoodPoint", "Under ₹200",
            "Fast Delivery", "Top Rated", "Late Night Eats"
        ]
    },
    verificationDetails: {
        type: verificationSchema,
    },
    verificationStatus: {
        type: String,
        enum: ["pending", "verified", "rejected", "discontinued"],
        default: "pending"
    }

}, {timestamps: true})

const restaurant = new mongoose.model("restaurant", restaurantSchema)
module.exports = restaurant