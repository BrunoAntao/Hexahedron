const fs = require("fs");

let colors = {

    values: {

        reset: '\x1b[0m',
        red: '\x1b[31m',
        green: '\x1b[32m',
        blue: '\x1b[34m',
        cyan: '\x1b[36m'

    },

    red: (string) => {

        return colors.values.red + string + colors.values.reset;

    },

    green: (string) => {

        return colors.values.green + string + colors.values.reset;

    },

    blue: (string) => {

        return colors.values.blue + string + colors.values.reset;

    },

    cyan: (string) => {

        return colors.values.cyan + string + colors.values.reset;

    },

    remove: (string) => {

        for (key in colors.values) {

            string = string.split(colors.values[key]).join('');

        }

        return string;

    }

}

module.exports.start = () => {

    let log = fs.createWriteStream('./index.log');
    let error = fs.createWriteStream('./error.log');
    let owrite = process.stdout.write;
    let oerror = process.stderr.write;

    process.stdout.write = (...params) => {

        owrite.call(process.stdout, ...params);
        log.write(colors.remove(params[0]));

    }

    process.stderr.write = (...params) => {

        oerror.call(process.stderr, ...params);
        error.write(colors.remove(params[0]));

    }

    process.on('uncaughtException', function (err) {
        console.error((err && err.stack) ? err.stack : err);
    });

}

module.exports.express = (req, res, next) => {

    res.startTime = process.hrtime();

    res.on('finish', function () {

        let duration = process.hrtime(res.startTime);
        let time = ((duration[0] * 1e9 + duration[1]) / 1e6).toFixed(2) + ' ms';

        if (res.statusCode == 200) {

            console.log(req.method + ' ' + req.originalUrl + ' ' + colors.green(res.statusCode) + ' - ' + time);

        } else if (res.statusCode.toString().startsWith('5')) {

            console.log(req.method + ' ' + req.originalUrl + ' ' + colors.red(res.statusCode) + ' - ' + time);

        } else if (res.statusCode.toString().startsWith('4')) {

            console.log(req.method + ' ' + req.originalUrl + ' ' + colors.blue(res.statusCode) + ' - ' + time);

        } else if (res.statusCode.toString().startsWith('3')) {

            console.log(req.method + ' ' + req.originalUrl + ' ' + colors.cyan(res.statusCode) + ' - ' + time);

        } else {

            console.log(req.method + ' ' + req.originalUrl + ' ' + res.statusCode + ' - ' + time);

        }

    })

    next();

}