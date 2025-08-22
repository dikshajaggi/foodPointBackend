const express = require("express")
const { search } = require("./menuItems")
const getToken = require("../middlewares/auth")

const router = express.Router()

router.route("/search").get(getToken, search)
