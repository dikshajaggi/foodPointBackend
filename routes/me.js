const express = require("express")
const getToken = require("../middlewares/auth")
const { changePassword, updateProfile, getDetails, deleteSingleAddress, addAddress } = require("../controllers/me")
const router = express.Router()

router.route("/change-password").put(getToken, changePassword)
router.route("/update-profile").put(getToken, updateProfile)
router.route("/details").get(getToken, getDetails)
router.route("/delete-single-address").post(getToken, deleteSingleAddress)
router.route("/add-address").post(getToken, addAddress)

module.exports = router
