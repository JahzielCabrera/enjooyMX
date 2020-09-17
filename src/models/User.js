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
    restaurentNameJoin: {
        type: String,
        default: 'enjooymx'
    },
    restaurantCategory: {
        type: String,
        required: true
    }, 
    logo: {
        type: String,
        default: 'https://res.cloudinary.com/djxxgphqp/image/upload/v1600046215/logos/LogoMakr_6S5FEW_y2aatz.png',
    }, 
    logo_public_id: {
        type: String
    },
    portada: {
        type: String,
        default: 'https://res.cloudinary.com/djxxgphqp/image/upload/v1599726240/qeoxgmf84id6577zniyr.jpg'
    },
    portada_public_id: {
        type: String
    },
    account: {
        type: String,
        default: 'gratuito'
    }, 
    token: {
        token: {
            type: String
        }, 
        expiration: {
            type: Date
        }
    },
    activeAccount: {
        type: Number,
        default: 0
    },
    stripeCustomerId: {
        type: String
    },
    color: {
        type: String,
        default: '#0056FF'
    },
    accountLimits: {
        limitSucursals: {
            type: Number,
            default: 1
        },
        limitDishes: {
            type: Number,
            default: 10
        }
    },
    subscriptionEndDate: {
        type: Date
    }, 
    socialNetworks: {
        facebook: {
            type: String,
            default: 'https://www.facebook.com'
        },
        instagram: {
            type: String,
            default: 'https://www.instagram.com'
        }
    }, 
    stripe: {
        customer: {
            type: String
        }, 
        subscription: {
            type: String
        },
        price: {
            type: String
        }, 
        currentPeriodEnd: {
            type: Date
        }, 
        paymentMethod: {
            type: String
        }
    }
},
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