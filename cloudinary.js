const cloudinary = require('cloudinary').v2;
const dotenv = require("dotenv").config();
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
})

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'Uploads',
      allowedFormated: ["jpg", "png", "jpeg"]
    },
});

module.exports = {
    cloudinary,
    storage
}