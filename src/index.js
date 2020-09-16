if(process.env.NODE_ENV != 'production'){
    require('dotenv').config();
}

const fs = require('fs');
const hostname = 'enjooy.mx';
const http = require('http');
const https = require('https');
const path = require('path');

const app = require('./server');
require("./database")

const httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, '/ssl/enjooy_mx.key'))
}


if(process.env === 'production') {
    const httpServer = http.createServer(app);
    const httpsServer = https.createServer(httpsOptions, app);

    app.use((req, res, next) => {  
        if(req.protocol === 'http') {
            res.redirect(301, `https://${hostname}${req.url}`);
        }
        next();
    });

    httpServer.listen(app.get("port"), hostname);
    httpsServer.listen(app.get("port"), hostname);
} else {
    app.listen(app.get("port"), () => {
        console.log("Server on port:", app.get('port'));
        console.log('Environment:', process.env.NODE_ENV);
    });
}





