const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    image: { 
        type: String, 
        default: "default-img-url"
    },
    isNew: {
        type: Boolean,
        default: false
    }

})


const category = new mongoose.model("category", categorySchema)
module.exports = category