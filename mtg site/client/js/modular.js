function getInternetExplorerVersion() {
    var rv = -1;
    if (navigator.appName == 'Microsoft Internet Explorer') {
        var ua = navigator.userAgent;
        var re = new RegExp("MSIE ([0-9]{1,}[\\.0-9]{0,})");
        if (re.exec(ua) != null)
            rv = parseFloat(RegExp.$1);
    }
    else if (navigator.appName == 'Netscape') {
        var ua = navigator.userAgent;
        var re = new RegExp("Trident/.*rv:([0-9]{1,}[\\.0-9]{0,})");
        if (re.exec(ua) != null)
            rv = parseFloat(RegExp.$1);
    }
    return rv;
}

if (getInternetExplorerVersion() > 0) {

    document.body.innerHTML = 'Browser not supported!';

}

function whichAnimationEvent() {
    var t,
        el = document.createElement("fakeelement");

    var animations = {
        "animation": "animationend",
        "OAnimation": "oAnimationEnd",
        "MozAnimation": "animationend",
        "WebkitAnimation": "webkitAnimationEnd"
    }

    for (t in animations) {
        if (el.style[t] !== undefined) {
            return animations[t];
        }
    }
}

function createElementFromHTML(htmlString) {

    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div.firstChild;

}

function message(text, type) {

    let message = createElementFromHTML(`
                            
    <div class="alert alert-`+ type + ` fade-out" role="alert" 
    style="position:fixed; top:16px; right:16px;">
    `+ text + `
    </div>

    `)

    message.addEventListener(whichAnimationEvent(), (e) => {

        e.target.remove();

    })

    document.body.append(message);

}

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

                } else if (this.status == 307) {

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

let prefix = 'mod';
let Modular = {

    elements: {},
    forms: []

}

Modular.Element = class {

    constructor(tag) {

        this.tag = prefix + '-' + tag;

        Modular.elements[this.tag.toUpperCase()] = this;

    }

    elements() {

        return document.querySelectorAll(this.tag);

    }

}

new MutationObserver((mutationsList, observer) => {

    for (const mutation of mutationsList) {

        if (mutation.type === 'childList') {

            mutation.addedNodes.forEach((node) => {

                if (node.tagName && Modular.elements[node.tagName]) {

                    Modular.elements[node.tagName].render([node]);

                } else {

                    if (node.tagName) {

                        for (let key in Modular.elements) {

                            Modular.elements[key].render(node.querySelectorAll(key));

                        }

                    }

                }

            })

        }

    }

}).observe(document.body, { childList: true, subtree: true });

for (let tag in Modular.elements) {

    let el = Modular.elements[tag];

    el.render(el.elements());

}

// let style = createElementFromHTML(`

// <style>

//     .fade-out {

//         animation: fadeOut ease 4s;
//         animation-delay: 1s;

//     }

//     @keyframes fadeOut {

//         0% {
//         opacity:1;
//         }
//         100% {
//         opacity:0;
//         }

//     }

//     .md-pop-over {

//         margin-top: 0px !important;
//         margin-bottom: 0px !important;
//         transition: 0.3s;

//     }
    
//     .md-pop-over:hover {

//         margin-top: -15px !important;
//         margin-bottom: 15px !important;
    
//     }

// </style>

// `)

// document.body.append(style);

//observer.disconnect();