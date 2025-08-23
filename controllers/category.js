const category = require("../models/category")
const restaurant = require("../models/restaurant")
const user = require("../models/user")
const uploadOnCloudinary = require("../utils/uploadOnCloudinary")

const addNewCategory = async (req, res, next) => {
    try {
        const {name, isNew} = req.body
        const image = req?.file

        const categoryExists = await category.findOne({name: name})
        if (categoryExists) return res.status(409).json({msg: "category with this name already exists"})    

        let imageUrl = ""

        if(image) {
            const resImage = await uploadOnCloudinary(image.path);
            if (!resImage?.secure_url) return res.status(500).json({ msg: "Image upload failed" });
            imageUrl = resImage.secure_url;
        }

        const categoryData = await category.create({name, isNew, image: imageUrl,})
        return res.status(201).json({ msg: "Category registered", data: categoryData });
    } catch (error) {
        next(error)
    }
}

const deleteCategory = async (req, res, next) => {

// Don't just delete the category. What if restaurants are still linked to that category?
// Industry practice: Either prevent deletion if restaurants reference it, or cascade update to unlink the category.

    try {
        const {id} = req.params
        const categoryExists = await category.findById(id)
        if (!categoryExists) return res.status(404).json({msg: "category with this name doesn't exist"})    

        const restaurantWithCategory = await restaurant.findOne({ cuisines: id });
        if (restaurantWithCategory) {
            return res.status(400).json({ msg: "Cannot delete category as it is linked to restaurants" });
        }

        await category.findByIdAndDelete(id)
        
        return res.status(200).json({success: true, msg: "Category deleted successfully"});
    } catch (error) {
        next(error)
    }
}

const updateCategory = async (req, res, next) => {
    try {
        const {name, isNew} = req.body
        const {id} = req.params

        const categoryExists = await category.findById(id)
        if (!categoryExists) return res.status(409).json({msg: "category with this name doesn't exist", data: [] })  
            
        const image = req?.file
        let imageUrl= ""

        if(image) {
            const resImage = await uploadOnCloudinary(image.path);
            if (!resImage?.secure_url) return res.status(500).json({ msg: "Image upload failed" });
            imageUrl = resImage.secure_url;
        }

        if(name) categoryExists.name = name
        if(imageUrl != "") categoryExists.image = imageUrl
        if(typeof isNew !== "undefined") categoryExists.isNew = isNew

        await categoryExists.save()
        return res.status(200).json({success: true, msg: "Category updated successfully", data: categoryExists });
    } catch (error) {
        next(error)
    }
}

const getAllCategories = async(req, res, next) => {
    try {
        const allCategories  = await category.find()
        if (allCategories.length > 0 ) return res.status(200).json({msg: "all categories fetched successfully", data: allCategories})

        // return res.status(500).json({mg: "error fetching categories", data: []})
    } catch (error) {
        next(error)
    }
}


const restaurantsByCategory = async (req, res, next) => {

    // while returning restuarants ---> apply pagination 
    try {
        const {cuisine} = req.params

        const categoryExists = await category.findOne({name: cuisine})
        if (!categoryExists) return res.status(409).json({msg: "category with this name doesn't exist"})  
        
        const matchedRests = await restaurant.find({cuisines: {$in : [cuisine.toLowerCase()]}}) // matches if cuisine exists in cuisines array

        return res.status(200).json({success: true, data: matchedRests})
    } catch (error) {
        next(error)
    }
}


module.exports = {addNewCategory, deleteCategory, updateCategory, getAllCategories, restaurantsByCategory}