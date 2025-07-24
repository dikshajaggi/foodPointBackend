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


// middleware (pre('save')) to calculate total cost before saving

cartSchema.pre("save", function(next) {
    const cart = this
     if(!cart.isModified()) {
        return next()
    } else {
        try {
            const totalCost = cart.items.reduce((acc, curr) => {
                return acc + (curr.price * curr.qty)
            } , 0)
            cart.totalCost = totalCost;
            next();
        } catch(error) {
            next(error);
        }
    }
})
const cart = new mongoose.model("cart", cartSchema)

module.exports = cart