const restaurant = require("../models/restaurant");
const menuItems = require("../models/menuItems");
const user = require("../models/user");


//-----------------------------------------------‼️‼️‼️CURSOR BASED PAGINATION LOGIC‼️‼️‼️-------------------------------------------

// const matchedRestaurants = await restaurant.find(
//   lastId 
//     ? { $text: { $search: target }, _id: { $gt: lastId } } 
//     : { $text: { $search: target } },
//   { score: { $meta: "textScore" } }
// )
//   .sort({ score: { $meta: "textScore" } })
//   .limit(pageLimit);

// $text: { $search: target } → This finds all restaurants whose text-indexed fields (like name, cuisines, tags) match the search word target.
// _id: { $gt: lastId } → This further filters only those restaurants whose _id is greater than the lastId you sent from the previous page.

// “Give me restaurants that match my search word, but only those after the last restaurant I already fetched.”
// --------------------------------------------------------------------------------------------------------------------------------------

const search = async (req, res, next) => {
  try {
    const { target, lastId, limit } = req.body;
    if (!target) {
      return res.status(400).json({ msg: "Search value is required" });
    }

    const pageLimit = parseInt(limit) || 10; // default to 10 per page
    const query = { $text: { $search: target } };

    // --- 0. Cursor condition for restaurants ---
    if (lastId) {
      query._id = { $gt: lastId }; // only fetch restaurants after lastId
    }

    // --- 1. Search Restaurants (text index) ---
    const matchedRestaurants = await restaurant.find(
      query,
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(pageLimit);

    // --- 2. Search Menu Items (text index) ---
    const matchedMenuItems = await menuItems.find(
      query,
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(pageLimit)
      .populate("restaurant");

    // --- 3. Extract Restaurants from Menu Items ---
    const restaurantsFromDishes = matchedMenuItems
      .map(item => item.restaurant)
      .filter(r => r) // remove null/undefined
      .slice(0, 5);

    // --- 4. Merge + Deduplicate (unique by _id) ---
    const allRestaurants = [
      ...matchedRestaurants,
      ...restaurantsFromDishes
    ];
    const uniqueRestaurants = Array.from( // converting map to an array
      new Map(allRestaurants.map(r => [r._id.toString(), r])) // as map cannot have duplicate keys; when it encounters a duplicate key it simply ignores it 
    ).map(([_, r]) => r); // extracting only the restaurant object from the array and not the id.... so using _ because we use it for the variables we don't care about

    const newLastId = uniqueRestaurants.length
      ? uniqueRestaurants[uniqueRestaurants.length - 1]._id // last restaurant's ID
      : null;

    // --- 5. Update user's recently searched ---
    if (req.user) {
    const userId = req.user.userId;
    const userData = await user.findById(userId);

    if (userData) {
      // Add restaurants
      uniqueRestaurants.forEach(r => {
        const existsIndex = userData.recentSearches.findIndex(
          s => s.type === "restaurant" && s.itemId.toString() === r._id.toString()
        );
        if (existsIndex > -1) userData.recentSearches.splice(existsIndex, 1); // remove duplicate
        userData.recentSearches.unshift({ type: "restaurant", itemId: r._id, name: r.name }); //unshift ----> pushing to the front of the array
      });

      // Add menu items (top 5)
      matchedMenuItems.slice(0, 5).forEach(m => {
        const existsIndex = userData.recentSearches.findIndex(
          s => s.type === "menuItem" && s.itemId.toString() === m._id.toString()
        );
        if (existsIndex > -1) userData.recentSearches.splice(existsIndex, 1);
        userData.recentSearches.unshift({ type: "menuItem", itemId: m._id, name: m.name }); //unshift ----> pushing to the front of the array
      });

      // Keep only last 5 items
      userData.recentSearches = userData.recentSearches.slice(0, 5);

      await userData.save();
    }}
    return res.status(200).json({
      restaurants: uniqueRestaurants,
      nextCursor: newLastId // client sends this in next request
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {search}