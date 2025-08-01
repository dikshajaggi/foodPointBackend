const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
    building: { 
        type: String,
        minlength: [3, "Building must be at least 3 characters long"],
        maxlength: [30, "Building cannot exceed 30 characters"]
    },
    street: { 
        type: String,
        minlength: [3, "Street must be at least 3 characters long"],
        maxlength: [30, "Street cannot exceed 30 characters"]
    },
    city: { 
        type: String, 
        required: true,
        minlength: [2, "City must be at least 3 characters long"],
        maxlength: [50, "City cannot exceed 30 characters"]
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
        minlength: [3, "State must be at least 3 characters long"],
        maxlength: [30, "State cannot exceed 30 characters"]
    },
    country: { 
        type: String, 
        required: true,
        minlength: [2, "Country must be at least 3 characters long"],
        maxlength: [50, "Country cannot exceed 30 characters"]
    },
    nearby: { 
        type: String,
        maxlength: [100, "Nearby landmark cannot exceed 100 characters"]
    }
})

const outletSchema = new mongoose.Schema({
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "restaurant",
        required: true,
        validate: {
            validator: async function (value) {
                const Restaurant = require("./restaurant"); // or wherever your model is
                const exists = await Restaurant.exists({ _id: value });
                return exists;
            },
            message: "Invalid restaurant ID — no such restaurant exists."
        }
    },
    name: {
        type: String,
        required: true,
        minlength: [3, "Name must be at least 3 characters long"],
        maxlength: [30, "Name cannot exceed 30 characters"]
    },
    address: {
        type: addressSchema,
        required: true
    },
    phoneNo: {
        type: Number,
        required: true,
        match: [/^\d{10}$/, "Phone number must be exactly 10 digits"]
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
})

const outlet = new mongoose.model("outlet", outletSchema)

module.exports = offer