require("dotenv").config()
const express = require("express")
const cors = require("cors")
const app = express()
const authRoutes = require("./routes/auth")
const meRoutes = require("./routes/me")
const orderRoutes = require("./routes/order")
const restaurantRoutes = require("./routes/restaurant")
const connectDb = require("./db")

app.use(cors({origin: "http://localhost:1010/"}))
app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/me", meRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/restaurant", restaurantRoutes)

//first the database should be connect after then we will start the server
connectDb().then(() => {
    app.listen(process.env.PORT, () => {
        console.log(`APP STARTED ON PORT ${process.env.PORT}`)
    })
})
