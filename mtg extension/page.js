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

function createElementFromHTML(htmlString) {

    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return div.firstChild;

}

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('multiverseid');

let check = document.querySelector("#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_nameRow > .value");

let title;
let cardStats;

if (!check) {

    title = document.querySelector("#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_ctl02_nameRow > div.value").innerHTML.trim();
    cardStats = document.body.querySelector('#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_ctl02_rightCol');

} else {

    title = check.innerHTML.trim();
    cardStats = document.body.querySelector('#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_rightCol');

}

let cont = createElementFromHTML(`
    
    <div class="smallGreyMono" style="margin-top: 10px;">

        <div style='text-align:center;'>
        <button id="mtg-save" type="button">Save Card</button
        </div>
        <b class="ff"><b></b></b>
    
    </div>

    <div id="logged" class="smallGreyMono" style="margin-top: 10px; display:none;">

        <div style='color: #ffffff; text-align:center;'>Login needed</div>

        <b class="ff"><b></b></b>

    </div>

    `)

cardStats.append(cont);

let saved = false;

let showFlag = () => {

    document.getElementById('mtg-save').remove();
    saved = true;

    let message = createElementFromHTML(`
    <div id="mtgtag" class="smallGreyMono" style="margin-top: 10px;">

        <div style='color: #ffffff; text-align:center;'> Saved </div>

        <b class="ff"><b></b></b>

    </div>
    `)

    cardStats.append(message);


}

let showLogged = () => {

    document.getElementById('logged').style.display = 'block';

}

// let hideFlag = () => {

//     document.getElementById('mtg-save').innerHTML = 'Save Card';
//     saved = false;

//     document.getElementById('mtgtag').remove();

// }

chrome.runtime.sendMessage({

    from: 'page',
    to: 'background',
    type: 'req',
    path: 'excard?action=check',
    method: 'post',
    body: JSON.stringify({ id })

}, (response) => {

    console.log(response);

    if (response.result.data.exists) {

        showFlag();

    }

});

document.getElementById('mtg-save').onclick = () => {

    if (!saved) {

        chrome.runtime.sendMessage({

            from: 'page',
            to: 'background',
            type: 'req',
            path: 'excard?action=save',
            method: 'post',
            body: JSON.stringify({ id, name: title })

        }, (response) => {


            if (response.result.data.redirect) {

                showLogged();

            } else if (response.result.data.message) {

                console.log('card added');

                showFlag();

            }

        });

    }
}