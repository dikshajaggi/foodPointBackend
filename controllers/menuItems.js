const restaurant = require("../models/restaurant");
const uploadOnCloudinary = require("../utils/uploadOnCloudinary");
const menuItem = require("../models/menuItems");
const user = require("../models/user");
const safeParse = require("../utils/safeParse");
const fs = require("fs");
const csvParser = require("csv-parser");

//-------------------------------------------------------------------------------------------------------------------
// ****important*****  match the rest with the user connected and the signed in user then only add / remove / update
//-------------------------------------------------------------------------------------------------------------------

const addMenuItem = async (req, res, next) => {
  try {
      const {restName, label, name, cost, availability, addOns} = req.body

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
        const newMenuItem = await menuItem.create({restaurant: restaurantExists._id, label, name, cost, image: imageURL, availability: safeParse(availability, ""), addOns: safeParse(addOns, [])})
        return res.status(201).json({msg: "Menu item added successfully", data: newMenuItem})
  } catch (error) {
      next(error)
  }
}

const removeMenuItem = async (req, res, next) => {
    try {
        const {restName, id} = req.body

        const restaurantExists = await restaurant.findOne({ verificationStatus: "verified", name: restName})
        if (!restaurantExists)  return res.status(404).json({msg: "Restaurant not found"}) 

        const isRemoved = await menuItem.findOneAndDelete({_id: id})
        if (isRemoved) return res.status(200).json({msg: "menu-item removed successfully"})
    } catch (error) {
        next(error)
    }
}


const updateMenuItems = async(req, res, next) => {
    try {
        const {restName, menuItemId, name, cost, availability, addOns} = req.body

        const restaurantExists = await restaurant.findOne({ verificationStatus: "verified", name: restName})
        if (!restaurantExists)  return res.status(404).json({msg: "Restaurant not found"}) 

        const menuItemExists = await menuItem.findById(menuItemId)
        if (!menuItemExists) return res.status(404).json("Menu item not found")    
        
        if (req.file) {
            const uploadResult = await uploadOnCloudinary(req.file.path);
            if (uploadResult?.secure_url) {
                const imageURL = uploadResult.secure_url;
                menuItemExists.image = imageURL
            } else {
                return res.status(500).json({ msg: "Image upload failed" });
            }
        }

        if (name) menuItemExists.name = name
        if (cost) menuItemExists.cost = cost
        if (availability) menuItemExists.availability = availability
        if (addOns) {
            try {
                menuItemExists.addOns = typeof addOns === "string" ? JSON.parse(addOns) : addOns;
            } catch (err) {
                return res.status(400).json({ msg: "Invalid addOns format" });
            }
        }

        await menuItemExists.save();
        return res.status(200).json({ msg: "Menu item details updated successfully", data: menuItemExists });
    } catch (error) {
        next(error)
    }
}

// bulk upload menu items through csv
const bulkUploadMenuItems = async (req, res, next) => {
    try {
        const {restName} = req.body

        const restaurantExists = await restaurant.findOne({ verificationStatus: "verified", name: restName})
        if (!restaurantExists)  return res.status(404).json({msg: "Restaurant not found"}) 
       
        const filePath = req.file.path
        const items = []; // to hold the menu-items
        fs.createReadStream(filePath) // Open the CSV file for reading (streaming)
        .pipe(csvParser())  // Pipe the data through csv-parser (converts each row to JS object) ---> pipe is used to convert readable stream (the csv file) to writable stream and here the csv-parser is acting as transform-stream both writable (this line) and readable (next line)
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
        // Multer is needed when user is uploading the file
        // When the file is present locally then multer is not required like in the case of a csv file
        .on("end", async () => {
            for (let item of items) {
                // if there is a local image (From system) upload it on cloudinary
                if (item.image && !item.image.startsWith("http")) {
                    try {
                        const cloudRes = await uploadOnCloudinary(item.image);
                        item.image = cloudRes.url;
                    } catch (err) {
                        console.error("Cloudinary Upload Error:", err);
                        item.image = ""; // fallback if failed
                    }
                } else if (!item.image) {
                    item.image = "https://your-default-image-url.com/image.jpg";
                }
            }
            const inserted = await menuItem.insertMany(items); // Bulk insert all menu items
            fs.unlinkSync(filePath); // clean up -  // Delete the uploaded CSV file after success
            res.status(201).json({ msg: "Menu items uploaded", data: inserted });
        })
        .on("error", (err) => {
            fs.unlinkSync(filePath);
            console.error("CSV Read Error:", err);
            res.status(500).json({ msg: "CSV Read failed" });
        })
    } catch (error) {
        next(error)
    }
}

const showAllMenuItems = async (req, res, next) => {
    try {
        const {restId, restName, pageLimit, lastId} = req.body
        
        const limit = parseInt(pageLimit) || 10;

        const restaurantExists = await restaurant.findOne({ verificationStatus: "verified", name: restName})
        if (!restaurantExists) return res.status(404).json({msg: "Restaurant not found"}) 

        const query = lastId
            ? { restaurant: restId, _id: { $gt: lastId } }
            : { restaurant: restId };


        const items = await menuItem.find(query).sort({ _id: 1 }).limit(limit); 

        const newLastId = items.length ? items[items.length - 1]._id : null;

         if (!items || items.length === 0) {
            return res.status(200).json({ msg: "No more menu items", data: [], nextCursor: null });
        }
        
        res.status(200).json({ msg: "Menu items fetched successfully", data: items, nextcursor: newLastId });  
    } catch (error) {
        next(error)
    }
}

module.exports = {addMenuItem, removeMenuItem, updateMenuItems, bulkUploadMenuItems, showAllMenuItems}