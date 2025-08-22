require("dotenv").config()
const express = require("express") 
const cors = require("cors")
const app = express()
const helmet = require("helmet") 

// importing db
const connectDb = require("./db")

// importing routes 
const authRoutes = require("./routes/auth")
const meRoutes = require("./routes/me")
const orderRoutes = require("./routes/order")
const restaurantRoutes = require("./routes/restaurant")
const menuRoutes = require("./routes/menuItems")
const cartRoutes = require("./routes/cart")
const categoryRoutes = require("./routes/category")

// middlewares 
app.use(cors({origin: "http://localhost:5173"}))
app.use(express.json()) // understand and process JSON data sent by clients in the request body
app.use(express.urlencoded({ extended: true })); // dealing with data submitted through HTML forms, particularly using the application/x-www-form-urlencoded content type
app.use(helmet()) // secure headers

// routes
app.use("/api/auth", authRoutes)
app.use("/api/me", meRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/restaurant", restaurantRoutes)
app.use("/api/menuItems", menuRoutes)
app.use("/api/cart", cartRoutes)
app.use("/api/category", categoryRoutes)

// first connect database and then start the server
connectDb().then(() => {
    app.listen(process.env.PORT, () => {
        console.log(`APP STARTED ON PORT ${process.env.PORT}`)
    })
})
