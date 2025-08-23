const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
   name: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true,
        lowercase: true
    },
    image: { 
        type: String, 
        default: "default-img-url"
    },
    isNew: {
        type: Boolean,
        default: false,
        validate: {
            validator: function (value) {
                return typeof value === "boolean"
            },
            message: "isNew must be a boolean"
        }
    }

}, { timestamps: true })


const category = new mongoose.model("category", categorySchema)
module.exports = category