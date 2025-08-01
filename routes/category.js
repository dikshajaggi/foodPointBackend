const express = require("express");
const imageUpload = require("../middlewares/imageUpload");
const getToken = require("../middlewares/auth");
const { restaurantsByCategory, deleteCategory, addNewCategory, updateCategory, getAllCategories } = require("../controllers/category");

const router = express.Router()

router.route("/add-category").post(getToken, imageUpload.single("image"), addNewCategory)
router.route("/all-categories").get(getAllCategories)
router.route("/delete-category/:id").delete(getToken, deleteCategory)
router.route("/update-category").patch(getToken, imageUpload.single("image"), updateCategory)
router.route("/restaurants-by-category/:cuisine").get(restaurantsByCategory)


module.exports = router