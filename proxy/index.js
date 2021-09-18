let path = 'C:/Certbot/live/';
let proxy = require('redbird')({

    port: 80,
    ssl: {

        http2: true,
        port: 443,
        key: path + 'webdevtools.duckdns.org/privkey.pem',
        cert: path + 'webdevtools.duckdns.org/cert.pem',
        ca: [
            path + 'webdevtools.duckdns.org/chain.pem',
            path + 'webdevtools.duckdns.org/fullchain.pem'
        ]

    },


});

// proxy.register("site.webdevtools.duckdns.org", "localhost:8001", {

//     ssl: {

//         key: path + 'site.webdevtools.duckdns.org/privkey.pem',
//         cert: path + 'site.webdevtools.duckdns.org/cert.pem',
//         ca: [
//             path + 'site.webdevtools.duckdns.org/chain.pem',
//             path + 'site.webdevtools.duckdns.org/fullchain.pem'
//         ]

//     }

// });

proxy.register("web.webdevtools.duckdns.org", "localhost:8001", {

    ssl: {

        key: path + 'web.webdevtools.duckdns.org/privkey.pem',
        cert: path + 'web.webdevtools.duckdns.org/cert.pem',
        ca: [
            path + 'web.webdevtools.duckdns.org/chain.pem',
            path + 'web.webdevtools.duckdns.org/fullchain.pem'
        ]

    }

});

proxy.register("socket.webdevtools.duckdns.org", "localhost:8002", {

    ssl: {

        key: path + 'socket.webdevtools.duckdns.org/privkey.pem',
        cert: path + 'socket.webdevtools.duckdns.org/cert.pem',
        ca: [
            path + 'socket.webdevtools.duckdns.org/chain.pem',
            path + 'socket.webdevtools.duckdns.org/fullchain.pem'
        ]

    }

});

proxy.notFound(function (req, res) {

    res.statusCode = 404;
    res.write('Not Found.');
    res.end();

});
