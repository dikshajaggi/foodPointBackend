const express = require("express")
const router = express.Router()
const { register, login } = require("../controllers/auth")
const loginLimiter = require("../middlewares/loginRateLimiter.js")

router.route("/register").post(register)
router.route("/login").post(loginLimiter, login)


module.exports = router
