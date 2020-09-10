const {Schema, model, Mongoose} = require('mongoose');

const ProductSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: { 
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    }, 
    imageUrl: {
        type: String
    },
    visible: {
        type: Boolean,
        default: true 
    },
    category: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    restaurantName: {
        type: String,
        required: true
    }, 
    sucursalId: {
        type: String, 
        required: true
    },
    cloudinary_public_id: {
        type: String
    }
}, {
    timestamps: true,
    writeConcern: {
        w: 'majority',
        j: true,
        wtimeout: 5000
      }
});

module.exports = model('Product', ProductSchema);