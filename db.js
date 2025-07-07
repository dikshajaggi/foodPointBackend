const mongoose = require("mongoose")

const uri = process.env.MONGODB_URI

const connectDb = async () => {
    try {
        await mongoose.connect(uri)
        console.log("database connected successfully")
    } catch (error) {
        console.error("database connection failed", error)
        process.exit(0)
    }
}

module.exports = connectDb