const mongoose = require("mongoose");

const addOnSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    cost: { 
        type: Number, 
        required: true 
    },
    sellSeparately: {
        type: Boolean, 
        required: true, 
        validate: {
            validator: function (value) {
                return typeof value === "boolean"
            },
            message: "sellSeparately must be a boolean"
        }
    }
})


module.exports = addOnSchema