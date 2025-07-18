const restaurant = require("../models/restaurant");
const uploadOnCloudinary = require("../utils/uploadOnCloudinary");
const menuItem = require("../models/menuItems");
const user = require("../models/user");
const safeParse = require("../utils/safeParse");
const fs = require("fs");
const csvParser = require("csv-parser");

const addMenuItem = async (req, res, next) => {
  try {
      const {restName, label, name, cost, availability, addOns} = req.body

      const userId = req.user.userId
      const userExists = await user.findById(userId)
      if(!userExists)  return res.status(404).json({ msg: "User not found" });

      const restaurantExists = await restaurant.findOne({ verificationStatus: "verified", name: restName})
      if (!restaurantExists) return res.status(409).json({msg: "restaurant with this name is not registered"})    

      let imageURL = "";
      if (req.file) {
        const uploadResult = await uploadOnCloudinary(req.file.path);
        if (uploadResult?.secure_url) {
          imageURL = uploadResult.secure_url;
        } else {
          return res.status(500).json({ msg: "Image upload failed" });
        }
      }
      const newMenuItem = await menuItem.create({ label, name, cost, image: imageURL, availability: safeParse(availability, ""), addOns: safeParse(addOns, [])})
      return res.status(201).json({msg: "Menu item added successfully", data: newMenuItem})

  } catch (error) {
      next(error)
  }
}

const removeMenuItem = async (req, res, next) => {
    try {
        const {restName, name} = req.body

        const userId = req.user.userId
        const userExists = await user.findById(userId)
        if(!userExists)  return res.status(404).json({ msg: "User not found" });

        const restaurantExists = await restaurant.findOne({ verificationStatus: "verified", name: restName})
        if (!restaurantExists) return res.status(409).json({msg: "restaurant with this name is not registered"})    

        const isRemoved = await menuItem.findOneAndDelete({name: name})
        if (isRemoved) return res.status(200).json({msg: "menu-item removed successfully"})

    } catch (error) {
        next(error)
    }
}

// bulk upload menu items through csv

const bulkUploadMenuItems = async (req, res, next) => {
    try {
        const {restName} = req.body
        const userId = req.user.userId
        const userExists = await user.findById(userId)
        if(!userExists)  return res.status(404).json({ msg: "User not found" });

        const restaurantExists = await restaurant.findOne({ verificationStatus: "verified", name: restName})
        if (!restaurantExists) return res.status(409).json({msg: "restaurant with this name is not registered"})
        
        const filePath = req.file.path;
        const items = []; // to hold the menu-items

        fs.createReadStream(filePath) // Open the CSV file for reading (streaming)
        .pipe(csvParser())  // Pipe the data through csv-parser (converts each row to JS object)
        .on("data", (row) => {
            items.push({
            restaurant: restaurantExists._id,
            label: row.label,
            name: row.name,
            cost: Number(row.cost),
            image: row.image || "default-img-url",
            availability: row.availability || "all-day",
            addOns: JSON.parse(row.addOns || "[]"), // if CSV has JSON-like addOns field
            });
        })
        // After reading all rows (on "end")
        .on("end", async () => {
            const inserted = await menuItem.insertMany(items); // Bulk insert all menu items
            fs.unlinkSync(filePath); // clean up -  // Delete the uploaded CSV file after success
            res.status(201).json({ msg: "Menu items uploaded", data: inserted });
        });

    } catch (error) {
        next(error)
    }
}

module.exports = {addMenuItem, removeMenuItem, bulkUploadMenuItems}