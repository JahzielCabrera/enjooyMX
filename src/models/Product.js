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
        type: String,
        default: 'https://s1.eestatic.com/2020/01/22/cocinillas/recetas/pasta-y-arroz/Espaguetis-Salmon-Queso_Philadelphia-Pasta_y_arroz_461715202_143042655_1706x960.jpg'
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
    }
}, {
    timestamps: true
});

module.exports = model('Product', ProductSchema);