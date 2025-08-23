const  mongoose = require("mongoose");
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken");
const address = require("./address");
const addressSchema = require("./address");

// Normally in Mongoose, if you want to reference another collection, you write:
// itemId: { type: mongoose.Schema.Types.ObjectId, ref: "restaurant" }
// This means itemId is always pointing to a restaurant document.
// But in your case, a recent search could be either: restaurant OR a menuItem
// So we can’t hardcode ref: "restaurant" or ref: "menuItem".
// That’s where refPath comes in.

const recentSearchSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["restaurant", "menuItem"],
        required: true
    },
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: "recentSearches.type"  //refPath lets Mongoose decide dynamically which model to reference, based on another field in the same schema.
    },
    name: {
        type: String,
        required: true
    },
    searchedAt: { type: Date, default: Date.now }
}, { timestamps: true });

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
        unique: [true, 'email already exists'],
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
        unique: [true, 'phoneNo already exists'],
        match: [/^\d{10}$/, "Phone number must be exactly 10 digits"]
    },
    address: {type: [addressSchema],
        validate: {
        validator: function (addresses) {
            const labels = addresses.map(addr => addr.label);
            return labels.length === new Set(labels).size; // no duplicates
        },
        message: "Duplicate address labels are not allowed"
    }},
    isAdmin: {
        type: Boolean,
        default: false,
        validate: {
            validator: function (value){
                return typeof value === 'boolean'
            },
            message: "isAdmin must be a boolean"
        } 
    },
    isRestaurantOwner: {
        type: Boolean,
        default: false,
        validate: {
            validator: function (value) {
                return typeof value === "boolean"
            },
            message: "isRestaurantOwner must be a boolean"
        }
    },
    isDeliveryGuy: {
        type: Boolean,
        default: false,
        validate: {
            validator: function (value) {
                return typeof value === "boolean"
            },
            message: "isDeliveryGuy must be a boolean"
        }
    },
    recentSearches: {
        type: [recentSearchSchema],
        default: []
    }

}, { timestamps: true })

userSchema.pre("save", async function() {
    const user = this

    if (!user.isModified("password")) return next();
    else {
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