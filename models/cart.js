const mongoose = require("mongoose");

const MenuItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    qty: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
})

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
        unique: true // One cart per user
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "restaurant", 
        required: true
    },
    items: {
        type: [MenuItemSchema],
        default: []
    },
    totalCost: {
        type: Number,
        required: true,
        default: 0
    }
}, { timestamps: true })

const cart = new mongoose.model("cart", cartSchema)

// middleware (pre('save')) to calculate total cost before saving

cart.pre("save", function() {
    const cart = this
     if(!cart.isModified()) {
        return next()
    } else {
        try {
            const totalCost = cart.items.reduce((acc, curr) => {
                acc + (curr.price * curr.qty)
            } , 0)
            cart.totalCost = totalCost;
            next();
        } catch(error) {
            next(error);
        }
    }
})

module.exports = cart