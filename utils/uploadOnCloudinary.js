const  { v2 } = require('cloudinary');
const fs = require("fs")

v2.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_SECRET_KEY
});

const uploadOnCloudinary = async (localFilePath) => {
    console.log(localFilePath, "localFilePath")
    try {
        if(!localFilePath) return null
        //upload on cloudinary
        const res = await v2.uploader.upload(localFilePath, {resource_type: "auto"});
        // file has been uploaded successfully
        // Remove the file from local disk after successful upload
        fs.unlinkSync(localFilePath);
        console.log(res, "file has been uploaded successfully", res.url)
        return res
    } catch (error) {
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        } //remove the locally saved file as the upload op got failed --- using sync as we want the this op to happen first and only then move to next line
        console.error("Cloudinary Upload Error:", error.message);
        return null; 
    }
}

module.exports = uploadOnCloudinary