let allCards = (cubeid, cards, query = '') => {

    new HTTPRequest({

        method: 'get',
        path: '/search?target=card&cube=' + cubeid + '&name=' + query,
        ctype: 'application/json',

    }, (res) => {

        let result = JSON.parse(res);

        cards.innerHTML = '';

        result.cards.forEach(card => {

            let c = createElementFromHTML(`
            
            <div class="alert border" role="alert">
            <div class="row">

                <div class="col my-auto">

                ` + card.name + `

                </div>
                <div class="col">

                <button type="button" class="btn btn-primary float-end">
                    <i class="fas fa-plus"></i>
                </button>

                </div>

            </div>
            </div>

            `);

            c.querySelector('.btn-primary').addEventListener('click', (e) => {

                new HTTPRequest({

                    method: 'post',
                    path: '/card?action=save&listid=' + cubeid + '&id=' + card.id,
                    ctype: 'application/json'

                }, (res) => {

                    cards.innerHTML = '';

                    allCards(cubeid, cards);
                    cubeCards(cubeid, document.getElementById('cube-cards'))

                    console.log(JSON.parse(res));

                })

            })

            cards.append(c);

        })

    })

}

let cubeCards = (cubeid, cards, query = '') => {

    new HTTPRequest({

        method: 'get',
        path: '/search?target=cube&cube=' + cubeid + '&name=' + query,
        ctype: 'application/json',

    }, (res) => {

        let result = JSON.parse(res);

        cards.innerHTML = '';

        result.cards.forEach(card => {

            let c = createElementFromHTML(`
            
            <div class="alert border" role="alert">
            <div class="row">

                <div class="col my-auto">

                ` + card.name + `

                </div>
                <div class="col">

                <button type="button" class="btn btn-danger float-end">
                    <i class="fas fa-trash"></i>
                </button>

                </div>

            </div>
            </div>

            `);

            c.querySelector('.btn-danger').addEventListener('click', (e) => {

                new HTTPRequest({

                    method: 'post',
                    path: '/card?action=remove&listid=' + cubeid + '&id=' + card.id,
                    ctype: 'application/json'

                }, (res) => {

                    cards.innerHTML = '';

                    cubeCards(cubeid, cards);
                    allCards(cubeid, document.getElementById('all-cards'));

                    console.log(JSON.parse(res));

                })

            })

            cards.append(c);

        })

    })

}

window.addEventListener('DOMContentLoaded', () => {

    const params = new URLSearchParams(window.location.search);
    const query = Object.fromEntries(params.entries());
    let id = query.id.toLowerCase();

    document.getElementById('cube').href = '/?id=' + id;

    new HTTPRequest({

        method: 'get',
        path: '/cubes?id=' + id,
        ctype: 'application/json',

    }, (res) => {

        let result = JSON.parse(res);

        document.getElementById('current-page').innerHTML = result.name;

    })

    let cube = document.getElementById('cube-cards');
    let cards = document.getElementById('all-cards');

    cubeCards(id, cube);
    allCards(id, cards);

    let timer;

    document.getElementById('all-search').addEventListener('keydown', (e) => {

        clearTimeout(timer);

        setTimeout(() => {

            allCards(id, cards, e.target.value);;

        }, 500)

        if (e.key == 'Enter') {

            allCards(id, cards, e.target.value);;

        }

    })

})