const {Schema, model} = require('mongoose');

const SubscriptionSchema = new Schema({
    subscriptionName: {
        type: String,
        required: true
    },
    subscriptionId: {
        type: String,
        required: true
    },
    subscriptionAmount: {
        type: Number,
        required: true
    },
    subscriptionCurrency: {
        type: String, 
        required: true
    },
    subscriptionInterval: {
        type: String,
        required: true
    },
    subscriptionPriceId: {
        type: String,
        required: true
    }
});

module.exports = model('Subscription', SubscriptionSchema);