const multer = require('multer')
const cloudinary = require('cloudinary').v2
const CloudinaryStorage = require('multer-storage-cloudinary').CloudinaryStorage

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_SECRET
})

const storage = CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'ironhack/multer-example',
        allowed_formats: ['jpg', 'png']
    }
})

const uploadCloud = multer({ storage })
module.exports = uploadCloud