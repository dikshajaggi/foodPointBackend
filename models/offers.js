const mongoose = require("mongoose");

const offersSchema = new mongoose.Schema({
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "restaurant",
        required: true
    },
    title: { // no cook wednesday, ipl, diwali, payday sale
        type: String,
        required: true,
        trim: true
    },

    description: String, //tnc

    offerType: {
        type: String,
        required: true,
        enum: ["percentage", "flat", "bogo", "free_delivery"],
    },
    discountValue: Number,

    minOrderValue: {
        type: Number,
        default: 0
    },

    applicableDays: {
        type: [String],
        default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    },

    validFrom: {
        type: Date
    },

    validTo: {
        type: Date
    },

    paymentMethods: {
        type: [String],
        enum: ["Cash", "Card", "UPI"],
        default: ["Cash", "Card", "UPI"]
    },

    isActive: {
        type: Boolean,
        default: true
    }
})

const offer = new mongoose.model("offer", offersSchema)

module.exports = offer