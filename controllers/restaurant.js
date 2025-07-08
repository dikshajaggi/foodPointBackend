const menuItem = require("../models/menuItems");
const restaurant = require("../models/restaurant");
const user = require("../models/user");
const safeParse = require("../utils/safeParse");
const uploadOnCloudinary = require("../utils/uploadOnCloudinary"); 

const RegisterRestaurant = async(req, res, next) => {
    const {name, address, deliveryRadius, phoneNo, costForTwo, etd, isAvailable, deliveryChargeRules, cuisines, tags, verificationDetails} = req.body
    try {
        const userId = req.user.userId;
        const userExists = await user.findById(userId)

        if(!userExists)  return res.status(404).json({ msg: "User not found" });

        if(!userExists.isRestaurantOwner) {
            return res.status(401).json({msg: "user is not a restaurant partner. contact support team"})
        }

        const alreadyRegistered = await restaurant.findOne({ owner: userId });
        if (alreadyRegistered)  return res.status(401).json({msg: "more than one restaurants cannot be register for a single user"})

        const restaurantExists = await restaurant.findOne({name: name})
        if (restaurantExists) return res.status(409).json({msg: "restaurant with this name is already registered"})

        if (!name || !address || !deliveryRadius || !phoneNo || !costForTwo || !etd || !isAvailable || !verificationDetails) {
            return res.status(400).json({ msg: "Missing required fields" });
        }
        
            let thumbnailUrl = "";
            if (req.file) {
                const cloudinaryResponse = await uploadOnCloudinary(req.file.path);
                if (cloudinaryResponse) thumbnailUrl = cloudinaryResponse.secure_url;
                const newRestaurant = await restaurant.create({name, address, deliveryRadius, phoneNo, thumbnail: thumbnailUrl, costForTwo, etd, isAvailable, deliveryChargeRules: safeParse(deliveryChargeRules, {}), cuisines: safeParse(cuisines, []), tags: safeParse(tags, []), owner: userId, verificationDetails})
                return res.status(201).json({ msg: "Restaurant registered", data: newRestaurant });
            }

        const newRestaurant = await restaurant.create({name, address, deliveryRadius, phoneNo, costForTwo, etd, isAvailable, deliveryChargeRules: safeParse(deliveryChargeRules, {}), cuisines: safeParse(cuisines, []), tags: safeParse(tags, []), owner: userId, verificationDetails})
        return res.status(201).json({ msg: "Restaurant registered", data: newRestaurant });

    } catch (error) {
        next(error)
    }
}

const updateRestaurant = async  (req, res, next) => {
    try {
        const {name, address, deliveryRadius, phoneNo, costForTwo, etd, isAvailable, deliveryChargeRules, cuisines, tags, replaceCuisines, replaceTags} = req.body
        const userId = req.user.userId
        const userExists = await user.findById(userId)
        if(!userExists)  return res.status(404).json({ msg: "User not found" });

        const restaurantExists = await restaurant.findOne({name: name})
        if (!restaurantExists) return res.status(409).json({msg: "restaurant with this name is not registered"})    
        
        if (req.file) {
            const cloudinaryResponse = await uploadOnCloudinary(req.file.path);
            if (cloudinaryResponse?.secure_url) {
                restaurantExists.thumbnail = cloudinaryResponse.secure_url;
            }
        }

        if (address) restaurantExists.address = address
        if (deliveryRadius) restaurantExists.deliveryRadius = deliveryRadius
        if (phoneNo) restaurantExists.phoneNo = phoneNo
        if (costForTwo) restaurantExists.costForTwo = costForTwo
        if (etd) restaurantExists.etd = etd
        if (typeof isAvailable === "boolean") restaurantExists.isAvailable = isAvailable
        if (deliveryChargeRules) restaurantExists.deliveryChargeRules = deliveryChargeRules
        if (cuisines) {
            if (replaceCuisines) {
                restaurantExists.cuisines = cuisines;
            } else {
                restaurantExists.cuisines.push(...cuisines);
            }
        }
        // Tags update
        if (tags) {
            if (replaceTags) {
                restaurantExists.tags = tags;
            } else {
                restaurantExists.tags.push(...tags);
            }
        }

        await restaurantExists.save();
        return res.status(200).json({ msg: "Restaurant details updated successfully", data: restaurantExists });
        } catch (error) {
            next(error)
    }
}

const getSpecificRestaurant = async  (req, res, next) => {
    try {
        const {name} = req.params
        const userId = req.user.userId
        const userExists = await user.findById(userId)
        if(!userExists)  return res.status(404).json({ msg: "User not found" });

        const restaurantExists = await restaurant.findOne({name: name})
        if (!restaurantExists) return res.status(409).json({msg: "restaurant with this name is not registered"})    
        return res.status(200).json({msg: "restaurant details fetched successfully", data: restaurantExists})
        } catch (error) {
            next(error)
    }
}

const getAllRestaurants = async  (req, res, next) => {
    try {
        const userId = req.user.userId
        const userExists = await user.findById(userId)
        if(!userExists)  return res.status(404).json({ msg: "User not found" });
        const restaurants = await restaurant
        .find({ isAvailable: true, verificationStatus: "verified" })
        .select("-verificationDetails");

        if (restaurants.length === 0) {
            return res.status(200).json({
                msg: "No verified and available restaurants found",
                data: []
            });
        }
        return res.status(200).json({
            msg: "Restaurants fetched successfully",
            data: restaurants
        });
        } catch (error) {
            next(error)
    }
}


const addMenuItem = async (req, res, next) => {
    try {
        const {restName, label, name, cost, image, availability, addOns} = req.body

        const userId = req.user.userId
        const userExists = await user.findById(userId)
        if(!userExists)  return res.status(404).json({ msg: "User not found" });

        const restaurantExists = await restaurant.findOne({ verificationStatus: "verified", name: restName})
        if (!restaurantExists) return res.status(409).json({msg: "restaurant with this name is not registered"})    

        const newMenuItem = await menuItem.create({ label, name, cost, image: safeParse(image, ""), availability: safeParse(availability, ""), addOns: safeParse(addOns, [])})
        return res.status(201).json({msg: "menu-item added successfully", data: newMenuItem})

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

module.exports = {RegisterRestaurant, updateRestaurant, getSpecificRestaurant, getAllRestaurants, addMenuItem, removeMenuItem}