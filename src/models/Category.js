const {Schema, model} = require('mongoose');

const CategorySchema = new Schema({
    sucursalId: {
        type: String, 
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    name: {
        type: String, 
        required: true
    }, 
    categoryName: {
        type: String, 
        required: true
    }, 
    img: {
        type: String, 
    },
    cloudinary_publicId: {
        type: String,
    }
}, {
    writeConcern: {
        w: 'majority',
        j: true,
        wtimeout: 5000
    }
});

module.exports = model('Category', CategorySchema);