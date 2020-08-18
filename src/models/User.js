const {Schema, model} = require('mongoose');
const bcrypt = require('bcryptjs');
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    name: {
        type: String, 
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String, 
        required: true
    },
    password: {
        type: String, 
        required: true
    },
    restaurantName: {
        type: String,
        required: true
    }, 
    restaurantCategory: {
        type: String,
        required: true
    }},
    {   timestamps: true,
        writeConcern: {
          w: 'majority',
          j: true,
          wtimeout: 5000
        }
    }
    
);

UserSchema.methods.encryptPassword = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

UserSchema.methods.comparePassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

UserSchema.plugin(passportLocalMongoose);

module.exports = model('User', UserSchema);