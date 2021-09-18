let decode = {

    'w': 'white',
    'b': 'Black',
    'u': 'blue',
    'r': 'red',
    'g': 'green'

}

window.addEventListener('load', () => {

    const params = new URLSearchParams(window.location.search);
    const query = Object.fromEntries(params.entries());
    let cube = query.cube.toLowerCase();
    let id = query.id.toLowerCase();

    document.querySelectorAll('#home').forEach( tag => {

        tag.href = '/?id=' + cube;

    })
    document.getElementById('category').href = '/list?id=' + cube + '&filter=' + query.filter;

    new HTTPRequest({

        method: 'post',
        path: 'card?action=check&listid=' + cube + '&id=' + id,

    }, (res) => {

        let card = JSON.parse(res).card;

        document.getElementById('card-name').innerHTML = card.name;

        document.getElementById('card-image').src = '/assets/images/' + card.cid + '.png';

        let container = document.getElementById('card-stats');

        let row = createElementFromHTML(`
        <div class='row my-3'>

            <div class='col label'>

            </div>

            <div class='col value'>
                
            </div>

        </div>`);

        card.fields.forEach(field => {

            let r = row.cloneNode(true);

            r.querySelector('.label').innerHTML = field.label;
            let v = r.querySelector('.value');
            v.innerHTML = field.value;

            if (field.label == 'Mana cost') {

                v.innerHTML = '';

                field.value.forEach(cost => {

                    let image = document.createElement('img');
                    image.src = '/assets/mana/' + cost + '.png';

                    v.append(image);

                })

            }

            if (field.label == 'Card text') {

                v.querySelectorAll('.cardtextbox').forEach( text => {

                    text.removeAttribute('style');

                });

                let images = r.querySelectorAll('img');

                for (let i = 0; i < images.length; i++) {

                    let image = images[i];


                    let params = new URLSearchParams(image.src);
                    let query = Object.fromEntries(params.entries());
                    let name = query.name.toLowerCase();

                    image.src = '/assets/mana/' + name + '.png';

                }

            }

            container.append(r);

        })

    })

})