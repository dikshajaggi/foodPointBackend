const mongoose = require("mongoose");

const addOnSchema = new mongoose.Schema({
    name: { type: String, required: true },
    cost: { type: Number, required: true }
})


module.exports = addOnSchema