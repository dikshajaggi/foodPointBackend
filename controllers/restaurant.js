const restaurant = require("../models/restaurant");
const user = require("../models/user");
const safeParse = require("../utils/safeParse");
const uploadOnCloudinary = require("../utils/uploadOnCloudinary"); 

const RegisterRestaurant = async (req, res, next) => {
  const {
    name,
    address,
    deliveryRadius,
    phoneNo,
    costForTwo,
    etd,
    isAvailable,
    deliveryChargeRules,
    cuisines,
    tags,
    verificationDetails,
  } = req.body;

  try {
    const userId = req.user.userId;
    const userExists = await user.findById(userId);

    if (!userExists) return res.status(404).json({ msg: "User not found" });

    if (!userExists.isRestaurantOwner) {
      return res.status(401).json({
        msg: "User is not a restaurant partner. Contact support team",
      });
    }

    const alreadyRegistered = await restaurant.findOne({ owner: userId });
    if (alreadyRegistered)
      return res
        .status(401)
        .json({ msg: "Only one restaurant can be registered per user" });

    const restaurantExists = await restaurant.findOne({ name });
    if (restaurantExists)
      return res
        .status(409)
        .json({ msg: "Restaurant with this name already exists" });

    if (
      !name ||
      !address ||
      !deliveryRadius ||
      !phoneNo ||
      !costForTwo ||
      !etd ||
      isAvailable === undefined ||
      !verificationDetails
    ) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    const files = req.files;
    const thumbnailFile = files?.thumbnail?.[0];
    const photoFile = files?.photo?.[0];
    const chequeFile = files?.cancelledCheque?.[0];

    // Upload all files to Cloudinary
    if (thumbnailFile) {
      const res = await uploadOnCloudinary(thumbnailFile.path);
      if (!res?.secure_url) return res.status(500).json({ msg: "Thumbnail upload failed" });
      thumbnailUrl = res.secure_url;
    }

    // Upload photo
    if (photoFile) {
      const res = await uploadOnCloudinary(photoFile.path);
      if (!res?.secure_url) return res.status(500).json({ msg: "Owner photo upload failed" });
      photoUrl = res.secure_url;
    }

    // Upload cancelled cheque
    if (chequeFile) {
      const res = await uploadOnCloudinary(chequeFile.path);
      if (!res?.secure_url) return res.status(500).json({ msg: "Cancelled cheque upload failed" });
      chequeUrl = res.secure_url;
    }

    const parsedVerification = safeParse(verificationDetails, {});

    // Construct full verificationDetails object
    const fullVerificationDetails = {
      ...parsedVerification,
     ownerIdProof : {
        ...parsedVerification.ownerIdProof,
        photo: photoUrl,
      },
      bankDetails: {
        ...parsedVerification.bankDetails,
        cancelledCheque: chequeUrl,
      },
    };

    const newRestaurant = await restaurant.create({
      name,
      address,
      deliveryRadius,
      phoneNo,
      thumbnail: thumbnailUrl,
      costForTwo,
      etd,
      isAvailable,
      deliveryChargeRules: safeParse(deliveryChargeRules, {}),
      cuisines: safeParse(cuisines, []),
      tags: safeParse(tags, []),
      owner: userId,
      verificationDetails: fullVerificationDetails,
    });

    return res
      .status(201)
      .json({ msg: "Restaurant registered", data: newRestaurant });
  } catch (error) {
    next(error);
  }
};


const updateRestaurant = async  (req, res, next) => {
    try {
        const {name, address, deliveryRadius, phoneNo, costForTwo, etd, isAvailable, deliveryChargeRules, cuisines, tags, replaceCuisines, replaceTags} = req.body
        const userId = req.user.userId
        const userExists = await user.findById(userId)
        if(!userExists)  return res.status(404).json({ msg: "User not found" });

        const restaurantExists = await restaurant.findOne({ name: name })
        if (!restaurantExists) return res.status(409).json({ msg: "restaurant with this name is not registered" })    
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
        const restaurantExists = await restaurant.findOne({name: name})
        if (!restaurantExists) return res.status(409).json({msg: "restaurant with this name is not registered"})    
        return res.status(200).json({msg: "restaurant details fetched successfully", data: restaurantExists})
        } catch (error) {
            next(error)
    }
}

const getAllRestaurants = async  (req, res, next) => {
    try {
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

const restaurantVerification = async (req, res, next) => {
  // the admin will handle whether all the details for the rest are correct and should the rest be verified or not
  // to the admin should be able to just change the verification prop of the restaurant (the admin can also discontinue the rest from serving)
  try {
    const {restName, status} = req.body 

    const userId = req.user.userId
    const userExists = await user.findById(userId)
    if(!userExists)  return res.status(404).json({ msg: "User not found" });

    const restaurantExists = await restaurant.findOne({ name: restName }) 
    if (!restaurantExists) return res.status(409).json({msg: "restaurant with this name is not registered"})   

    if (userExists.isAdmin) {
      restaurantExists.verificationStatus = status
      await restaurantExists.save()
      if (status === "verified") {
        res.status(200).json({msg: "restaurant verification completed successfully. check your registered mail for further details"})
        // await sendVerificationEmail({
        //   to: restaurantExists.verificationDetails.email,
        //   type: "approved", 
        //   restaurantName: restaurantExists.name,
        // });
      }
      if (status === "discontinued") {
        res.status(403).json({msg: "restaurant discontinued. check your registered mail for further details", data: status})
        // await sendVerificationEmail({
        //   to: restaurantExists.verificationDetails.email
        //   type: "approved", 
        //   restaurantName: restaurantExists.name,
        // });
      }
      if (status === "rejected") {
        res.status(403).json({msg: "restaurant verification rejected. check your registered mail for further details", data: status})
        // await sendVerificationEmail({
        //   to: restaurantExists.verificationDetails.email,
        //   type: "approved", 
        //   restaurantName: restaurantExists.name, 
        // });
      }
    } return res.status(403).json({msg: "only admin is permitted to perform this operation", data: status})
  } catch (error) {
    next(error)
  }
}

const deleteRestaurant = async (req, res, next) => {
    try {

        const {id} = req.params
        const userId = req.user.userId
        const userExists = user.findById(userId)

        if (!userExists) return res.status(404).json({ msg: "User not found" });

        const restaurantExists = await restaurant.findById({ _id: id }) 
        if (!restaurantExists) return res.status(409).json({msg: "restaurant with this name doesn't exist"})    

        await restaurant.findOneAndDelete({_id: id})
        
        return res.status(200).json({ msg: "Restaurant deleted successfully"});

    } catch (error) {
        next(error)
    }
}

module.exports = {RegisterRestaurant, updateRestaurant, getSpecificRestaurant, getAllRestaurants, restaurantVerification, deleteRestaurant}