const category = require("../models/category")
const restaurant = require("../models/restaurant")
const user = require("../models/user")
const uploadOnCloudinary = require("../utils/uploadOnCloudinary")

const addNewCategory = async (req, res, next) => {
    try {
        const {name, isNew} = req.body
        const image = req?.file
        const userId = req.user.userId
        const userExists = await user.findById(userId)

        if (!userExists) return res.status(404).json({ msg: "User not found" });

        if(userExists.isAdmin === false) return res.status(404).json({msg: "only admin is allowed to add categories"})

        const categoryExists = await category.findOne({name: name})
        if (categoryExists) return res.status(409).json({msg: "category with this name already exists"})    

        let imageUrl = ""

        if(image) {
            const resImage = await uploadOnCloudinary(image.path);
            if (!resImage?.secure_url) return resImage.status(500).json({ msg: "Image upload failed" });
            imageUrl = resImage.secure_url;
        }

        const categoryData = await category.create({name, isNew, image: imageUrl,})
        return res.status(201).json({ msg: "Category registered", data: categoryData });
    } catch (error) {
        next(error)
    }
}

const deleteCategory = async (req, res, next) => {
    try {
        const {id} = req.params
        const userId = req.user.userId
        const userExists = await user.findById(userId)

        if (!userExists) return res.status(404).json({ msg: "User not found" });

        const categoryExists = await category.findOne({name: name})
        if (!categoryExists) return res.status(409).json({msg: "category with this name doesn't exist"})    

        await category.findOneAndDelete({_id: id})
        
        return res.status(200).json({ msg: "Category deleted successfully"});
    } catch (error) {
        next(error)
    }
}

const updateCategory = async (req, res, next) => {
    try {
        const {name, isNew} = req.body
        const userId = req.user.userId
        const userExists = await user.findById(userId)

        if (!userExists) return res.status(404).json({ msg: "User not found" });

        const categoryExists = await category.findOne({name: name})
        if (!categoryExists) return res.status(409).json({msg: "category with this name doesn't exist"})  
            
        const image = req?.file
        let imageUrl= ""

        if(image) {
            const resImage = await uploadOnCloudinary(image.path);
            if (!resImage?.secure_url) return resImage.status(500).json({ msg: "Image upload failed" });
            imageUrl = resImage.secure_url;
        }

        if(name) categoryExists.name = name
        if(imageUrl != "") categoryExists.image = imageUrl
        if(typeof isNew !== "undefined") categoryExists.isNew = isNew

        await categoryExists.save()
        return res.status(200).json({ msg: "Category updated successfully", data: categoryExists });
    } catch (error) {
        next(error)
    }
}

const getAllCategories = async(req, res, next) => {
    try {
        const allCategories  = await category.find()
        if (allCategories.length > 0 ) return res.status(200).json({msg: "all categories fetched successfully", data: allCategories})

        return res.status(500).json({mg: "error fetching categories", data: []})
    } catch (error) {
        next(error)
    }
}


const restaurantsByCategory = async (req, res, next) => {
    try {
        const {cuisine} = req.params
        const userId = req.user.userId
        const userExists = await user.findById(userId)

        if (!userExists) return res.status(404).json({ msg: "User not found" });

        const categoryExists = await category.findOne({name: cuisine})
        if (!categoryExists) return res.status(409).json({msg: "category with this name doesn't exist"})  
        
        const matchedRests = await restaurant.find({cuisines: {$in : [cuisine]}}) // matches if cuisine exists in cuisines array

        return res.status(200).json({data: matchedRests})
    } catch (error) {
        next(error)
    }
}


module.exports = {addNewCategory, deleteCategory, updateCategory, getAllCategories, restaurantsByCategory}