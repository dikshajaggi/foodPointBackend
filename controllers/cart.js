const cart = require("../models/cart");
const menuItem = require("../models/menuItems");
const restaurant = require("../models/restaurant");
const user = require("../models/user");

// check if rest is present and also if the menu item is a part of that rest or not to prevent the db from storing any unwanted / faulty data

const addItemToCart = async(req, res, next) => {
   try {
      const userId = req.user.userId
      const {restId, restName, name, price, qty, forceReplace, itemId} = req.body
      const userExists = await user.findById(userId)
      if (!userExists)  return res.status(404).json({ msg: "User not found" });

      const restaurantExists = await restaurant.findOne({ name: restName })
      const menuExists = await menuItem.findOne({_id: itemId, restaurant: restId})

      if (!restaurantExists) {
         return res.status(404).json({ msg: "Restaurant not found" });
      }

      if (!menuExists) {
         return res.status(404).json({ msg: "Menu Item not found" });
      }
     
      const existingCart = await cart.findOne({ user: userId });
      const isSameRest = !existingCart || existingCart.restaurant.toString() === restId.toString();
      
      if (!Number.isInteger(qty) || qty <= 0) {
         return res.status(400).json({ msg: "Quantity must be a positive integer" });
      }

      // different restaurant + force replace
      if (!isSameRest && forceReplace && existingCart) {
         existingCart.restaurant = restId;
         existingCart.items = [{ name, price, qty }];
         await existingCart.save();

         return res.status(200).json({
            msg: "Cart replaced with new restaurant item",
            cart: existingCart
         });
      } 

      // different restaurant without confirmation
      if (!isSameRest && existingCart) {
         return res.status(409).json({msg: "Your cart has items from another restaurant. Do you want to remove those and add these?"})
      }

    // no cart yet → create new one
    if (!existingCart) {
        const newCart = await cart.create({
        user: userId,
        restaurant: restId,
        items: [{ name, price, qty }],
      });
      return res.status(201).json({ msg: "Item added to new cart", cart: newCart });
    } else {
        // same restaurant → append item
        const existingItemIndex = existingCart.items.findIndex(item => item._id.toString() === itemId.toString());
        
        if (existingItemIndex > -1) {
        // item already in cart → update qty
        existingCart.items[existingItemIndex].qty += qty;
        } else {
        // item not in cart → add new
        existingCart.items.push({ name, price, qty });
        }

        await existingCart.save();
        return res.status(200).json({ msg: "Item added to cart", cart: existingCart });
    }
   } catch (error) {
    next(error)
   }
}

const removeItemFromCart = async(req, res, next) => {
   try {
      const userId = req.user.userId
      const {itemId, restId, restName} = req.body
      const userExists = await user.findById(userId)
      if(!userExists)  return res.status(404).json({ msg: "User not found" });

      const restaurantExists = await restaurant.findOne({ name: restName })
      const menuExists = await menuItem.findOne({_id: itemId, restaurant: restId})

      if (!restaurantExists) {
         return res.status(404).json({ msg: "Restaurant not found" });
      }

      if(!menuExists) {
         return res.status(404).json({ msg: "Menu Item not found" });
      }
      
      const existingCart = await cart.findOne({ user: userId });
      if (!existingCart) return res.status(404).json({ msg: "Cart not found" });
      
      const removedItemIndex = existingCart.items.findIndex(item => item._id.toString() === itemId.toString());

      if (removedItemIndex === -1) return res.status(404).json({ msg: "Item not found in cart" });

      existingCart.items.splice(removedItemIndex, 1);
      // save cart so pre('save') middleware recalculates totalCost
      await existingCart.save();

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


module.exports = {addItemToCart, removeItemFromCart, clearCart}