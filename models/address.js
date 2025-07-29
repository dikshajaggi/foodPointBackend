const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
    label: {
        type: String,
        enum: ["home", "work", "other"],
        required: true
    },
    house: { 
        type: String,  
        maxlength: [50, "House name/number cannot exceed 50 characters"]
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
        min: [100000, "Pincode must be at least 6 digits"],
        max: [999999, "Pincode must be at most 6 digits"]
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
        minlength: [2, "Country must be at least 2 characters"],
        maxlength: [50, "Country name cannot exceed 50 characters"]
    },
    nearby: { 
        type: String,
        maxlength: [100, "Nearby landmark cannot exceed 100 characters"]
    }
})

module.exports = addressSchema