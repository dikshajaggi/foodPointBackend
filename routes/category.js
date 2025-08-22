const express = require("express");
const imageUpload = require("../middlewares/imageUpload");
const getToken = require("../middlewares/auth");
const isAdmin = require("../middlewares/isAdmin");

const { restaurantsByCategory, deleteCategory, addNewCategory, updateCategory, getAllCategories } = require("../controllers/category");

const router = express.Router()

router.route("/add").post(getToken, isAdmin, imageUpload.single("image"), addNewCategory)
router.route("/all").get(getAllCategories)
router.route("/delete/:id").delete(getToken, isAdmin, deleteCategory)
router.route("/update/:id").patch(getToken, isAdmin, imageUpload.single("image"), updateCategory)
router.route("/rest/:cuisine").get(restaurantsByCategory)


module.exports = router