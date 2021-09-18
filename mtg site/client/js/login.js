window.addEventListener('DOMContentLoaded', () => {

    document.getElementById('login').addEventListener('click', () => {

        let username = document.getElementById('username').value;
        let password = document.getElementById('password').value;

        new HTTPRequest({

            method: 'post',
            path: '/login',
            ctype: 'application/json',
            body: JSON.stringify({ username, password })

        }, (res) => {

            console.log(res);

        })

    })

})