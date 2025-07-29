const  mongoose = require("mongoose");
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken");
const address = require("./address");
const addressSchema = require("./address");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        minlength: [3, "Username must be at least 3 characters long"],
        maxlength: [30, "Username cannot exceed 30 characters"]
    },
    email: {
        type: String,
        required: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            "Please fill a valid email address"
        ]
    },
    password: {
        type: String,
        required: true,
        minlength: [6, "Password must be at least 6 characters long"],
        maxlength: [100, "Password cannot exceed 100 characters"]
    },
    phoneNo: {
        type: String, // string for phone numbers (avoid precision loss)
        required: true,
        match: [/^\d{10}$/, "Phone number must be exactly 10 digits"]
    },
    address: {type: [addressSchema],
        validate: {
        validator: function (value) {
            return value && value.length > 0;
            },
            message: "At least one address is required"
        }
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isRestaurantOwner: {
        type: Boolean,
        default: false
    },
    isDeliveryGuy: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

userSchema.pre("save", async function() {
    const user = this

    if(!user.isModified) {
        next()
    } else {
        try {
            const salt = await bcrypt.genSaltSync(10);
            const hash = await bcrypt.hashSync(user.password, salt);
            user.password = hash
        } catch (error) {
            next(error)
        }
    }
})

userSchema.methods.generateToken = async function () {
    const user = this
    try {
        const token = jwt.sign({ id: user._id.toString(), email: user.email, isAdmin: user.isAdmin }, process.env.JWT_SECRET_KEY, {expiresIn: "1d"});
        return token
    } catch (error) {
        next(error)
    }

}

userSchema.methods.comparePasswords = async function (password) {
    const user = this
     try {
        const token = await bcrypt.compare(password, user.password)
        return token
    } catch (error) {
        next(error)
    }
}

const user = new mongoose.model("user", userSchema)

module.exports = user