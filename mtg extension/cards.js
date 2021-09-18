function parse(container, data) {

    container.innerHTML = '';

    for (key in data) {

        let id = key;

        let item = document.createElement('div');
        item.style.width = '400px';
        item.style.overflow = 'hidden';

        let a = document.createElement('a');
        a.href = 'https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=' + id;
        a.target = "_blank";
        a.style.float = 'left';
        a.innerHTML = data[key];

        item.append(a);

        let del = document.createElement('button');
        del.type = 'button';
        del.style.float = 'right';
        del.innerHTML = 'X';

        del.addEventListener('click', (e) => {

            chrome.storage.local.remove(id, () => {

                item.remove();

            });

        })

        item.append(del);

        container.append(item);

    }

}

let save = (data, cb) => {

    chrome.storage.local.clear(() => {

        container.innerHTML = '';

    });

    chrome.storage.local.set(data, () => {

        cb(data);

    });

}

let container = document.getElementById('cards');

document.getElementById('cards-back').addEventListener('click', () => {

    changeView('lists');

})

// document.getElementById('clear').addEventListener('click', () => {

//     new HTTPRequest({

//         method: 'post',
//         path: 'http://webdevtools.duckdns.org:8080/clearlist',
//         ctype: 'application/json'

//     }, (res) => {

//         let result = JSON.parse(res);

//         console.log(result);

//     })

//     chrome.storage.local.clear(() => {

//         container.innerHTML = '';

//     });

// });

// document.getElementById('export').addEventListener('click', () => {

//     chrome.storage.local.get(null, function (data) {

//         let list = [];

//         for (key in data) {

//             list.push({

//                 key,
//                 title: data[key]

//             });

//         }

//         new HTTPRequest({

//             method: 'post',
//             path: 'http://webdevtools.duckdns.org:8080/addlist',
//             ctype: 'application/json',
//             data: JSON.stringify(list)

//         }, (res) => {

//             let result = JSON.parse(res);

//             console.log(result);

//         })

//         // let vLink = document.createElement('a');
//         // let vBlob = new Blob([JSON.stringify(list)], { type: "octet/stream" });

//         // vLink.setAttribute('href', window.URL.createObjectURL(vBlob));
//         // vLink.setAttribute('download', 'cards.json');
//         // vLink.click();

//     })

// })

// document.getElementById('import').addEventListener('click', () => {

//     let input = document.createElement('input');
//     input.type = 'file';

//     input.click();

//     input.addEventListener('change', function () {

//         let fr = new FileReader();

//         fr.onload = function () {

//             let data = JSON.parse(fr.result);
//             let d = {};

//             data.forEach(item => {

//                 d[item.key] = item.title;

//             })

//             save(d, (data) => {

//                 parse(container, data);

//             });

//         }

//         fr.readAsText(this.files[0]);

//     })

// })

// chrome.storage.local.get(null, function (data) {

//     parse(container, data);

// })