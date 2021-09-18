let decode = {

    'white': 'alert-light',
    'blue': 'alert-primary',
    'black': 'alert-dark',
    'red': 'alert-danger',
    'green': 'alert-success',
    'nonbasic-lands': 'alert-info',
    'colorless-artifacts': 'alert-secondary',
    'multicolored': 'alert-warning',

}

let addCards = (container, cubeid, cards, color) => {

    container.innerHTML = '';

    cards.forEach(card => {

        addCard(container, cubeid, card, color);

    })

}

let addCard = (container, cubeid, card, color) => {

    let cost = '';

    if (card.mana) {

        card.mana.forEach(mana => {

            cost += '<img src="/assets/mana/' + mana + '.png">';

        })

    }

    let item = createElementFromHTML(`
    
        <a style="text-decoration: none;" href="/card?cube=` + cubeid + `&id=` + card.id + `&filter=` + color + `">
            <div class="alert border `+ decode[color] + `" role="alert">
            <div class="row">

                <div class="col">

                ` + card.name + `

                </div>
                <div class="col">

                <span class="float-end">`+ cost + `</span>

                </div>

            </div>
            </div>
        </a>

    `)

    container.append(item);

}

let search = (container, cubeid, cards, color, query) => {

    container.innerHTML = '';

    cards.forEach(card => {

        if (card.name.match(new RegExp(query, 'i'))) {

            addCard(container, cubeid, card, color);

        }

    })

}

window.addEventListener('load', () => {

    const params = new URLSearchParams(window.location.search);
    const query = Object.fromEntries(params.entries());
    let id = query.id.toLowerCase();
    let filter = query.filter.toLowerCase();

    document.querySelectorAll('#home').forEach(tag => {

        tag.href = '/?id=' + id;

    })

    let container = document.getElementById('cards');

    new HTTPRequest({

        method: 'post',
        path: '/cube?action=filter&filter=' + filter,
        ctype: 'application/json',
        body: JSON.stringify({ id })

    }, (res) => {

        let result = JSON.parse(res);

        result.cards.sort((a, b) => {

            return a.cmc - b.cmc;

        })

        addCards(container, id, result.cards, filter);

        let timer;

        document.getElementById('search').addEventListener('keydown', (e) => {

            clearTimeout(timer);

            setTimeout(() => {

                search(container, id, result.cards, filter, e.target.value);

            }, 500)

            if (e.key == 'Enter') {

                search(container, id, result.cards, filter, e.target.value);

            }

        })

    })

})