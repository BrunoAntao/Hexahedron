let parseCubes = () => {

    let container = document.getElementById('cube-list');

    container.innerHTML = '';

    new HTTPRequest({

        method: 'get',
        path: '/cubes',
        ctype: 'application/json',

    }, (res) => {

        let result = JSON.parse(res);

        result.lists.forEach(list => {

            let collection = createElementFromHTML(`

            <a style="text-decoration: none; color:#212529;" href="cube?id=`+ list.id + `">
    
                <div class="alert border " role="alert">

                    <div class="row">

                        <div class="col m-auto">

                            <p class="m-auto">`+ list.name + `</p>

                        </div>

                        <div class="col">

                            <button type="button" class="btn btn-danger float-end">
                                <i class="fas fa-trash"></i>
                            </button>

                        </div>

                    </div>

                </div>

            </a>
            
            `)

            collection.querySelector('.btn-danger').addEventListener('click', (e) => {

                e.preventDefault();

                new HTTPRequest({

                    method: 'post',
                    path: '/cube?action=remove',
                    ctype: 'application/json',
                    body: JSON.stringify({ id: list.id })

                }, (res) => {

                    collection.remove();

                    console.log(JSON.parse(res));

                })

            })

            container.append(collection);

        })

    })

}

let addCube = (list) => {

    let container = document.getElementById('cube-list');

    let collection = createElementFromHTML(`

    <a style="text-decoration: none; color:#212529;" href="cube?id=`+ list.id + `">

        <div class="alert border " role="alert">

            <div class="row">

                <div class="col m-auto">

                    <p class="m-auto">`+ list.name + `</p>

                </div>

                <div class="col">

                    <button type="button" class="btn btn-danger float-end">
                        <i class="fas fa-trash"></i>
                    </button>

                </div>

            </div>

        </div>

    </a>
    
    `)

    collection.querySelector('.btn-danger').addEventListener('click', (e) => {

        e.preventDefault();

        new HTTPRequest({

            method: 'post',
            path: '/cube?action=remove',
            ctype: 'application/json',
            body: JSON.stringify({ id: list.id })

        }, (res) => {

            collection.remove();

            console.log(JSON.parse(res));

        })

    })

    container.append(collection);

}

window.addEventListener('DOMContentLoaded', () => {

    parseCubes();

    document.getElementById('cube-add').addEventListener('click', () => {

        let name = document.getElementById('cube-name').value;

        if (name.trim() != '') {

            new HTTPRequest({

                method: 'post',
                path: '/cube?action=save',
                ctype: 'application/json',
                body: JSON.stringify({ name })

            }, (res) => {

                let result = JSON.parse(res);

                document.getElementById('cube-name').value = '';

                addCube(result.data);

            })

        }

    })

})