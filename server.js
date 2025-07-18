require("dotenv").config()
const express = require("express")
const cors = require("cors")
const app = express()
const helmet = require("helmet")

//db
const connectDb = require("./db")

// routes 
const authRoutes = require("./routes/auth")
const meRoutes = require("./routes/me")
const orderRoutes = require("./routes/order")
const restaurantRoutes = require("./routes/restaurant")
const menuRoutes = require("./routes/menuItems")


app.use(cors({origin: "http://localhost:1010/"}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(helmet())

app.use("/api/auth", authRoutes)
app.use("/api/me", meRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/restaurant", restaurantRoutes)
app.use("/api/menuItems", menuRoutes)


//first connect database and then start the server
connectDb().then(() => {
    app.listen(process.env.PORT, () => {
        console.log(`APP STARTED ON PORT ${process.env.PORT}`)
    })
})
