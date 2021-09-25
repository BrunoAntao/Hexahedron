class HTTPRequest {

    constructor(options, callback = () => { }, error = () => { }) {

        options = Object.assign({

            method: 'get',
            path: '/',
            type: '',
            accept: ''

        }, options);

        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {

            if (this.readyState === 4) {

                if (this.status === 200) {

                    callback(this.response, this.status);

                } else if (this.status == 301) {

                    window.location.href = JSON.parse(this.response).url;

                } else {

                    error(this.response, this.status);

                }

            }

        };
        xhttp.open(options.method, options.path, true);
        xhttp.setRequestHeader("content-type", options.ctype);
        xhttp.setRequestHeader("enctype", options.type);
        xhttp.setRequestHeader('Accept', options.accept);
        xhttp.send(options.body);

    }

}

chrome.runtime.onInstalled.addListener(function (details) {

    if (details.reason == "install") {

    } else if (details.reason == "update") {

        var thisVersion = chrome.runtime.getManifest().version;
        console.log("Updated from " + details.previousVersion + " to " + thisVersion + "!");

    }

});

chrome.runtime.onMessage.addListener((msg, sender, response) => {

    if (msg.to === 'background' && msg.type === 'req') {

        new HTTPRequest({

            method: msg.method,
            path: 'https://web.webdevtools.duckdns.org/' + msg.path,
            ctype: 'application/json',
            body: msg.body

        }, (res) => {

            let result = JSON.parse(res);

            console.log(result);

            response({

                from: 'background',
                to: msg.from,
                type: 'res',
                result: { path: msg.path, data: result }

            });

        })

        return true;

    }

});