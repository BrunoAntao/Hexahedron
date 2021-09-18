window.addEventListener('load', () => {

    const params = new URLSearchParams(window.location.search);
    const query = Object.fromEntries(params.entries());
    let id = query.id.toLowerCase();

    document.getElementById('home').href = '/?id=' + id;

    new HTTPRequest({

        method: 'post',
        path: '/cube?action=check',
        ctype: 'application/json',
        body: JSON.stringify({ id })

    }, (res) => {

        let result = JSON.parse(res);

        let canvas = document.getElementById('card-chart');
        let ctx = canvas.getContext('2d');

        let decode = {

            'W': 0,
            'U': 1,
            'B': 2,
            'R': 3,
            'G': 4,

            'L': 5,
            'A': 6,
            'M': 7


        }

        let values = [0, 0, 0, 0, 0, 0, 0, 0];

        result.cards.forEach(card => {

            if (card.color && card.color.length == 1) {

                values[decode[card.color]]++;

            }

            if (card.land) {

                values[decode['L']]++;

            }

            if (card.color && card.color.length == 0) {

                values[decode['A']]++;

            }

            if (card.color && card.color.length > 1) {

                values[decode['M']]++;

            }

        })

        const data = {
            labels: [

                'White',
                'Blue',
                'Black',
                'Red',
                'Green',

                'Nonbasic Lands',
                'Colorless Artifacts',
                'Multicolored'

            ],
            datasets: [{
                label: 'Cards',
                data: values,
                borderColor: [

                    '#000000',

                ],
                backgroundColor: [

                    '#ffffff', // white
                    '#4285f4', // blue
                    '#000000', // black
                    '#ea4335', // red
                    '#34a853', // green

                    '#D1B883', // lands
                    '#c2c2c2', // artifacts
                    '#f3daa5', // multicolored cards

                ],
                hoverOffset: 4
            }]
        };

        const config = {
            type: 'doughnut',
            data: data,
            options: {

                onClick(e, a) {

                    if (a[0]) {

                        window.location.href = '/list?id=' + id + '&filter=' + chart.data.labels[a[0].index].replace(' ', '-');

                    }

                }

            }
        };

        let chart = new Chart(ctx, config);

    })

})