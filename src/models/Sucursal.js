const {Schema, model} = require('mongoose');

const SucursalSchema = new Schema({
    userId: {
        type: String,
        required: true
    }, 
    name: {
        type: String, 
        required: true
    },
    location: {
        adress: {
            type: String, 
            required: true
        }, 
        suburb: {
            type: String, 
            required: true
        },
        city: {
            type: String, 
            required: true
        },
        state: {
            type: String, 
            required: true
        }
    },
    restaurantName: {
        type: String, 
        required: true
    }
}, {
    timestamps: true
});

module.exports = model('Sucursal', SucursalSchema);