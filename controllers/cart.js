const cart = require("../models/cart");
const menuItem = require("../models/menuItems");
const restaurant = require("../models/restaurant");
const user = require("../models/user");

// ‼️‼️‼️‼️Don’t trust any price, name, or restName from client. Always fetch from DB.‼️‼️‼️‼️
// Only trust itemId and restId


// Right now you’re doing multiple DB roundtrips (userExists, restaurantExists, menuExists, cart…). This adds latency.
//⚠️⚠️⚠️⚠️ Consider parallelizing with Promise.all where possible.⚠️⚠️⚠️⚠️⚠️


// const [userExists, restaurantExists, menuExists, existingCart] = await Promise.all([
//    user.findById(userId),
//    restaurant.findById(restId),
//    menuItem.findOne({ _id: itemId, restaurant: restId }),
//    cart.findOne({ user: userId })
// ]);
// This reduces 200–400ms latency per API call under load.
// check if rest is present and also if the menu item is a part of that rest or not to prevent the db from storing any unwanted / faulty data

const addItemToCart = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { restId, forceReplace, itemId } = req.body;
    // Validate user
    const userExists = await user.findById(userId);
    if (!userExists) return res.status(404).json({ msg: "User not found" });

    // Validate restaurant
    const restaurantExists = await restaurant.findOne({ _id: restId});
    if (!restaurantExists) return res.status(404).json({ msg: "Restaurant not found" });

    // Validate menu item
    const menuExists = await menuItem.findOne({ _id: itemId, restaurant: restId });
    if (!menuExists) return res.status(404).json({ msg: "Menu Item not found" });

    const {price, name} = menuExists; 

    // Check for existing cart
    let existingCart = await cart.findOne({ user: userId });
    const isSameRest = !existingCart || existingCart.restaurant.toString() === restId.toString();

    // Different restaurant + force replace → replace entire cart
    if (!isSameRest && forceReplace && existingCart) {
      existingCart.restaurant = restId;
      existingCart.items = [{ itemId, name, price, qty: 1 }];
      await existingCart.save();

      return res.status(200).json({
        msg: "Cart replaced with new restaurant item",
        cart: existingCart,
      });
    }

    // Different restaurant without force replace
    if (!isSameRest && existingCart) {
      return res.status(409).json({
        msg: "Your cart has items from another restaurant. Do you want to remove those and add these?",
      });
    }

    // No cart yet → create new one
    if (!existingCart) {
      const newCart = await cart.create({
        user: userId,
        restaurant: restId,
        items: [{ itemId, name, price, qty:1 }],
      });

      return res.status(201).json({ msg: "Item added to new cart", cart: newCart });
    }

    // Same restaurant → append or update item
    const itemIndex = existingCart.items.findIndex((i) => i.itemId.toString() === itemId.toString());

    if (!itemIndex > -1) {
     // New item → push to cart
      existingCart.items.push({ itemId, name, price, qty:1 });
    }
    await existingCart.save();
    return res.status(200).json({ msg: "Item added to cart", cart: existingCart });

  } catch (error) {
    next(error);
  }
};


const incItemQty = async(req, res, next) => {
   try {
      const userId = req.user.userId
      const {itemId} = req.params

      const userExists = await user.findById(userId)
      if (!userExists)  return res.status(404).json({ msg: "User not found" });

      const menuExists = await menuItem.findById(itemId)

      if (!menuExists) {
         return res.status(404).json({ msg: "Menu Item not found" });
      }

      const existingCart = await cart.findOne({ user: userId });
      if (!existingCart) return res.status(404).json({ msg: "Cart not found" });

      // Verify item belongs to the same restaurant as the cart
      if (!existingCart || existingCart.restaurant.toString() !== menuExists.restaurant.toString()) {
      return res.status(400).json({ msg: "Item does not belong to this cart's restaurant" });
      }

      const dishIndex = existingCart.items.findIndex(item => item.itemId.toString() === itemId.toString());
      if (dishIndex === -1) return res.status(404).json({ msg: "Item not found in cart" });
      
      // to prevent race condition and maintain atomicity
      await cart.updateOne(
        { user: userId, "items.itemId": itemId },
        { $inc: { "items.$.qty": 1 } }
      );

      await existingCart.save();
      return res.status(200).json({ msg: "Item quantity increased", cart: existingCart });

   } catch (error) {
      next(error)
   }
}

const decItemQty = async(req, res, next) => {
   try {
      const userId = req.user.userId
      const {itemId} = req.params
      const userExists = await user.findById(userId)
      if(!userExists)  return res.status(404).json({ msg: "User not found" });

      const menuExists = await menuItem.findById(itemId)

      if(!menuExists) {
         return res.status(404).json({ msg: "Menu Item not found" });
      }
      
      const existingCart = await cart.findOne({ user: userId });
      if (!existingCart) return res.status(404).json({ msg: "Cart not found" });

      
      // Verify item belongs to the same restaurant as the cart
      if (!existingCart || existingCart.restaurant.toString() !== menuExists.restaurant.toString()) {
      return res.status(400).json({ msg: "Item does not belong to this cart's restaurant" });
      }
      
      const removedItemIndex = existingCart.items.findIndex(item => item.itemId.toString() === itemId.toString());

      if (removedItemIndex === -1) return res.status(404).json({ msg: "Item not found in cart" });

      if (existingCart.items[removedItemIndex].qty > 1) {
        // to prevent race condition and maintain atomicity
        await cart.updateOne(
          { user: userId, "items.itemId": itemId, "items.qty": { $gt: 1 } }, 
          { $inc: { "items.$.qty": -1 } }
        );
      } else {
        await cart.updateOne(
          { user: userId },
          { $pull: { items: { itemId: itemId } } }
        );
      }

      await existingCart.save();      // save cart so pre('save') middleware recalculates totalCost
      return res.status(200).json({ msg: "Item removed from cart", cart: existingCart });
   } catch (error) {
        next(error)
   }
}

// above apis will work for adding / removing / qty inc / qty dec

const clearCart = async(req, res, next) => {
   try {
        const userId = req.user.userId
        const {itemId} = req.body
        const userExists = await user.findById(userId)
        if(!userExists)  return res.status(404).json({ msg: "User not found" });

        const existingCart = await cart.findOne({ user: userId });
        if (!existingCart) return res.status(404).json({ msg: "Cart not found" });
        
        existingCart.items = []
        // save cart so pre('save') middleware recalculates totalCost
        await existingCart.save();

        return res.status(200).json({ msg: "Cart cleared successfully", cart: existingCart });
   } catch (error) {
        next(error)
   }
}


module.exports = {addItemToCart, decItemQty, incItemQty, clearCart}