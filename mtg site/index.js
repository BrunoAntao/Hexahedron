const express = require('express');
const session = require('express-session');

const MongoDBStore = require('connect-mongodb-session')(session);

const logger = require('./logger.js');

const app = express();

let store = new MongoDBStore({
    uri: 'mongodb://localhost:27017/auth',
    collection: 'sessions'
});

store.on('error', function (error) {
    console.log(error);
});

app.use(express.json());

app.use(logger.express);

app.use(session({

    cookie: {
        maxAge: 60 * 60 * 2 * 1000
    },
    cookie: { secure: true },
    store: store,
    secret: 'speak friend and enter',
    resave: true,
    saveUninitialized: true

}));

app.use(express.urlencoded({

    extended: true

}));

app.use((err, req, res, next) => {

    if (res.headersSent) {

        return next(err);

    }

    res.status(500);
    res.render('error', { error: err });

});

app.use('/assets', express.static(__dirname + "/client/assets"));
app.use('/css', express.static(__dirname + "/client/css"));
app.use('/js', express.static(__dirname + "/client/js"));

// Globals

let instances = {};

// Manager

require('./routes/manager.js')(__dirname, app, instances);

// Extension

require('./routes/extension.js')(__dirname, app);

//HTTPS server and HTTP Redirect 

// const fs = require('fs');
// const http = require('http');
// const https = require('https');

// https.createServer({

//     key: fs.readFileSync('C:/Certbot/live/webdevtools.duckdns.org/privkey.pem'),
//     cert: fs.readFileSync('C:/Certbot/live/webdevtools.duckdns.org/cert.pem'),
//     ca: [
//         fs.readFileSync('C:/Certbot/live/webdevtools.duckdns.org/chain.pem'),
//         fs.readFileSync('C:/Certbot/live/webdevtools.duckdns.org/fullchain.pem')
//     ]

// }, app).listen(443, () => {

//     console.log('HTTPS server started on port 443');

// });

// http.createServer((req, res) => {

//     res.writeHead(302, {
//         location: "https://" + req.headers.host + req.url,
//     });
//     res.end();

// }).listen(80, () => {

//     console.log('HTTP server started on port 80');

// });

const https = require('https');
const fs = require('fs');

let server = https.createServer({

    key: fs.readFileSync('C:/Certbot/live/web.webdevtools.duckdns.org/privkey.pem'),
    cert: fs.readFileSync('C:/Certbot/live/web.webdevtools.duckdns.org/cert.pem'),
    ca: [
        fs.readFileSync('C:/Certbot/live/web.webdevtools.duckdns.org/chain.pem'),
        fs.readFileSync('C:/Certbot/live/web.webdevtools.duckdns.org/fullchain.pem')
    ]

}, app).listen(8001, () => {

    console.log('HTTP server started on port 8001');

});

