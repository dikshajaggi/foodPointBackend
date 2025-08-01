const restaurant = require("../models/restaurant");
const menuItems = require("../models/menuItems");
const user = require("../models/user");

const search = async(req, res, next) => {
    // use pagination also to limit the results
    try {
        const {target} = req.body
        if (!target) return res.status(400).json({msg: "Search value is required"})
        
        const regex = new RegExp(target, "i"); // case-insensitive & match partial substrings
        const matchedRestaurants = await restaurant.find({ name: regex }).limit(5);
        const matchedMenuItems = await menuItems.find({ name: regex }).limit(10).populate("restaurant");
        const restaurantsFromDishes = matchedMenuItems.map(item => item.restaurant).limit(5); // restaurants from menu items

        const allRestaurants = [
            ...matchedRestaurants,
            ...restaurantsFromDishes.filter(r => r) // avoid nulls
        ];

        const uniqueRestaurants = Array.from(new Map(allRestaurants.map(r => [r._id.toString(), r]))).values()
        res.status(200).json({ restaurants: uniqueRestaurants });
    } catch(error) {
        next (error)
    }
}

const recentlySearched = async(req, res, next) => {
    try {

        const userId = req.user.userId
        const userExists = await user.findById(userId)
        
        if (!userExists) return res.status(404).json({ msg: "User not found" });

    } catch (error) {
        next(error)
    }
}

module.exports = {search, recentlySearched}