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

function isDescendant(parent, child) {

    var node = child.parentNode;

    while (node != null) {

        if (node == parent) {

            return true;

        }

        node = node.parentNode;

    }

    return false;

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
        xhttp.send(options.data);

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

    external(element) {

        return new Promise((resolve, reject) => {

            let path = element.getAttribute('mod-external');

            new HTTPRequest({

                method: 'get',
                path: path,
                accept: 'application/json'

            }, (data, status) => {

                resolve({

                    data,
                    status

                });

            }, (data, status) => {

                reject({

                    data,
                    status

                });

            })

        })

    }

    elements() {

        return document.querySelectorAll(this.tag);

    }

}

// Core

new (class extends Modular.Element {

    constructor() {

        super('form');

    }

    render(elements) {

        elements.forEach((element) => {

            if (!element.rendered) {

                element.rendered = true;

                element.fields = [];

                Modular.forms.push(this);

                element.removeAttribute('class');

            }

        })

    }

})();

new (class extends Modular.Element {

    constructor() {

        super('submit');

    }

    render(elements) {

        elements.forEach((element) => {

            if (!element.rendered) {

                element.rendered = true;

                let button = createElementFromHTML('<button type="button" class="btn btn-primary"></button>');

                button.addEventListener('click', () => {

                    let form = element.closest('mod-form');

                    let data = {};

                    form.fields.forEach(field => {

                        data[field.name] = field.element.value;

                    })

                    new HTTPRequest({

                        method: 'post',
                        path: '/new',
                        data: JSON.stringify(data),
                        ctype: 'application/json',
                        accept: 'application/json'

                    }, (data, status) => {

                        console.log({

                            data,
                            status

                        });

                        window.location.replace('/');

                    }, (data, status) => {

                        console.log({

                            data,
                            status

                        });

                    })

                })

                button.innerHTML = element.innerHTML;
                element.innerHTML = '';

                element.append(button);

                element.removeAttribute('class');

            }

        })

    }

})();

new (class extends Modular.Element {

    constructor() {

        super('input');

    }

    render(elements) {

        elements.forEach((element) => {

            if (!element.rendered) {

                element.rendered = true;

                let button = createElementFromHTML('<input type="text" class="form-control">');

                button.setAttribute('name', element.getAttribute('name'));
                element.removeAttribute('name');

                button.setAttribute('placeholder', element.getAttribute('placeholder'));
                element.removeAttribute('placeholder');

                button.setAttribute('aria-label', element.getAttribute('aria-label'));
                element.removeAttribute('aria-label');

                element.closest('mod-form').fields.push({ name: button.getAttribute('name'), element: button });

                button.innerHTML = element.innerHTML;
                element.innerHTML = '';

                element.append(button);

                element.removeAttribute('class');

            }

        })

    }

})();

// Project

new (class extends Modular.Element {

    constructor() {

        super('project-item-list');

    }

    render(elements) {

        elements.forEach((element) => {

            if (!element.rendered) {

                element.rendered = true;

                let list = createElementFromHTML(`
                
                <div class="container">
                    <div class="row mt-5">
                        <div class="col-8 m-auto">
                            <ul class="list-group">
                            </ul>
                        </div>
                    </div>
                </div>

                `)

                let content = list.querySelector('.list-group');

                content.innerHTML = element.innerHTML;
                element.innerHTML = '';

                element.append(list);

                element.removeAttribute('class');

                this.external(element).then(res => {

                    let data = JSON.parse(res.data);

                    data.items.forEach((item) => {

                        let it = createElementFromHTML('<a href="/preview?id=' + item.id + '">' + '<mod-project-item>' + item.name + '</mod-project-item>' + '<a/>');

                        content.prepend(it);

                    })

                })

            }

        })

    }

})();

new (class extends Modular.Element {

    constructor() {

        super('project-item');

    }

    render(elements) {

        elements.forEach((element) => {

            if (!element.rendered) {

                element.rendered = true;

                let item = createElementFromHTML(`<li class="list-group-item"></li>`);

                item.addEventListener('mouseover', (e) => {

                    if (!e.target.classList.contains('active')) {

                        e.target.classList.add("active");

                    }

                })

                item.addEventListener('mouseout', (e) => {

                    e.target.classList.remove("active");

                })

                item.innerHTML = element.innerHTML;
                element.innerHTML = '';

                element.append(item);

                element.removeAttribute('class');

            }

        })

    }

})();

new (class extends Modular.Element {

    constructor() {

        super('project-item-add');

    }

    render(elements) {

        elements.forEach((element) => {

            if (!element.rendered) {

                element.rendered = true;

                let item = createElementFromHTML(`<a href="/new.html"><li class="list-group-item"></li></a>`);

                item.style.cursor = 'hand';

                item.addEventListener('mouseover', (e) => {

                    e.target.classList.add("active");

                })

                item.addEventListener('mouseout', (e) => {

                    e.target.classList.remove("active");

                })

                item.querySelector('.list-group-item').innerHTML = element.innerHTML;
                element.innerHTML = '';

                element.append(item);

                element.removeAttribute('class');

            }

        })

    }

})();

// New

new (class extends Modular.Element {

    constructor() {

        super('new-card');

    }

    render(elements) {

        elements.forEach((element) => {

            if (!element.rendered) {

                element.rendered = true;

                // <div class="card-header">
                // Featured
                // </div>

                // <div class="card-footer text-muted">
                // 2 days ago
                // </div>

                let list = createElementFromHTML(`
                
                <div class="container">
                    <div class="row mt-5">
                        <div class="col-8 m-auto">
                            <ul class="list-group">

                            <mod-form>

                                <div class="card text-center">
                                    <div class="card-body">

                                        <div class="row">
                                            <div class="col-6 m-auto">
                                                left
                                            </div>
                                            <div class="col-6 m-auto">
                                                <div class="input-group mb-3">
                                                    <span class="input-group-text">Name:</span>
                                                    <mod-input name="name" placeholder="project..." aria-label="Name"></mod-input>
                                                </div>
                                                <mod-submit>Create Project</mod-submit>
                                            </div>
                                        </div>

                                    </div>
                                </div>

                            </mod-form>

                            </ul>
                        </div>
                    </div>
                </div>

                `)

                // let content = list.querySelector('.list-group');

                // content.innerHTML = element.innerHTML;
                // element.innerHTML = '';

                element.append(list);

                element.removeAttribute('class');

            }

        })

    }

})();

// Preview

new (class extends Modular.Element {

    constructor() {

        super('preview-card');

    }

    render(elements) {

        elements.forEach((element) => {

            if (!element.rendered) {

                element.rendered = true;

                // <div class="card-header">
                // Featured
                // </div>

                // <div class="card-footer text-muted">
                // 2 days ago
                // </div>

                let spinner = createElementFromHTML(`
                
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                
                `)

                const urlSearchParams = new URLSearchParams(window.location.search);
                const params = Object.fromEntries(urlSearchParams.entries());

                let list = createElementFromHTML(`
                
                <div class="container">
                    <div class="row mt-5">
                        <div class="col-8 m-auto">
                            <ul class="list-group">

                            <mod-form>

                                <div class="card text-center">
                                    <div class="card-body">

                                        <div class="row">
                                            <div class="col-6 m-auto">

                                            <ul class="list-group files">
                                            </ul>

                                            </div>
                                            <div class="col-6 m-auto">
                                                <a href="" class="btn btn-primary">Start Project</a>
                                            </div>
                                        </div>

                                    </div>
                                    <div class="card-footer text-muted">
                                        
                                    </div>
                                </div>

                            </mod-form>

                            </ul>
                        </div>
                    </div>
                </div>

                `)

                let filesList = list.querySelector('.files');

                filesList.append(spinner.cloneNode(true));

                new HTTPRequest({

                    method: 'get',
                    path: '/files?id=' + params.id

                }, (data, status) => {

                    filesList.innerHTML = '';

                    filesList.innerHTML = `
                    
                    <style>
                    .list-group-item:nth-child(odd) {
                        background-color:#d3d3d4
                    }
                    </style>

                    `

                    data = JSON.parse(data);

                    data.files.forEach(file => {

                        filesList.append(createElementFromHTML('<a href="' + file.path + '" class="list-group-item list-group-item-action text-start">' + file.name + '</a>'));

                    })

                }, (data, status) => {

                    console.log({

                        data,
                        status

                    });

                })

                let footer = list.querySelector('.card-footer');

                footer.append(spinner.cloneNode(true));

                new HTTPRequest({

                    method: 'get',
                    path: '/readme?id=' + params.id

                }, (data, status) => {

                    footer.innerHTML = '';
                    footer.append(createElementFromHTML(data));

                }, (data, status) => {

                    console.log({

                        data,
                        status

                    });

                })

                // let content = list.querySelector('.list-group');

                // content.innerHTML = element.innerHTML;
                // element.innerHTML = '';

                element.append(list);

                element.removeAttribute('class');

            }

        })

    }

})();

window.addEventListener('DOMContentLoaded', (event) => {

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

    let style = createElementFromHTML(`

    <style>

        .fade-out {

            animation: fadeOut ease 4s;
            animation-delay: 1s;

        }

        @keyframes fadeOut {

            0% {
            opacity:1;
            }
            100% {
            opacity:0;
            }

        }

        .md-pop-over {

            margin-top: 0px !important;
            margin-bottom: 0px !important;
            transition: 0.3s;

        }

        .md-pop-over:hover {

            margin-top: -15px !important;
            margin-bottom: 15px !important;

        }

    </style>

    `)

    document.body.append(style);

    // observer.disconnect();

});