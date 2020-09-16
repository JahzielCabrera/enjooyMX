const mongoose = require('mongoose');

const { MENU_APP_HOST, MENU_APP_DATABASE } = process.env;
const MONGODB_URI = `${MENU_APP_HOST}/${MENU_APP_DATABASE}`;

mongoose.connect(MONGODB_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: false
})
    .then(db => console.log("Database is connect"))
    .catch(err => {console.log(err)});