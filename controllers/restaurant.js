const restaurant = require("../models/restaurant");
const user = require("../models/user");
const safeParse = require("../utils/safeParse");
const uploadOnCloudinary = require("../utils/uploadOnCloudinary"); 

const RegisterRestaurant = async(req, res, next) => {
    const {name, address, deliveryRadius, phoneNo, thumbnail, costForTwo, etd, isAvailable, deliveryChargeRules, cuisines, tags, verificationDetails} = req.body
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
        
        if (thumbnail) {
            let thumbnailUrl = "";
            if (req.file) {
                const cloudinaryResponse = await uploadOnCloudinary(req.file.path);
                if (cloudinaryResponse) thumbnailUrl = cloudinaryResponse.secure_url;
                const newRestaurant = await restaurant.create({name, address, deliveryRadius, phoneNo, thumbnail: thumbnailUrl, costForTwo, etd, isAvailable, deliveryChargeRules: safeParse(deliveryChargeRules, {}), cuisines: safeParse(cuisines, []), tags: safeParse(tags, []), owner: userId, verificationDetails})
                return res.status(201).json({ msg: "Restaurant registered", data: newRestaurant });
            }
        }

        const newRestaurant = await restaurant.create({name, address, deliveryRadius, phoneNo, thumbnail: safeParse(thumbnail, ""), costForTwo, etd, isAvailable, deliveryChargeRules: safeParse(deliveryChargeRules, {}), cuisines: safeParse(cuisines, []), tags: safeParse(tags, []), owner: userId, verificationDetails})
        return res.status(201).json({ msg: "Restaurant registered", data: newRestaurant });

    } catch (error) {
        next(error)
    }
}

const updateRestaurant = async  (req, res, next) => {
    try {
        const {name} = req.body
        const userId = req.user.userIds
        const userExists = await user.findById(userId)
        if(!userExists)  return res.status(404).json({ msg: "User not found" });

        const restaurantExists = await restaurant.findOne({name: name})
        if (!restaurantExists) return res.status(409).json({msg: "restaurant with this name is not registered"})    
        
        } catch (error) {
            next(error)
    }
}

const getSpecificRestaurant = async  (req, res, next) => {
    try {
        const {name} = req.body
        const userId = req.user.userId
        const userExists = await user.findById(userId)
        if(!userExists)  return res.status(404).json({ msg: "User not found" });

        const restaurantExists = await restaurant.findOne({name: name})
        if (!restaurantExists) return res.status(409).json({msg: "restaurant with this name is not registered"})    
        
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
            .select("-verificationDetails"); // Exclude sensitive verification info

            res.status(200).json({
            msg: "Restaurants fetched successfully",
            data: restaurants
        });
        } catch (error) {
            next(error)
    }
}



module.exports = {RegisterRestaurant, updateRestaurant, getSpecificRestaurant, getAllRestaurants}