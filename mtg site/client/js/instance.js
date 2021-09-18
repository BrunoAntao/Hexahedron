document.addEventListener('DOMContentLoaded', () => {

    const params = new URLSearchParams(window.location.search);
    const query = Object.fromEntries(params.entries());
    let id = query.id.toLowerCase();

    let socket = io('https://socket.webdevtools.duckdns.org');

    let players = {};

    socket.onAny((eventName, ...args) => {

        console.log(eventName, ...args);

    });

    socket.emit('join', { id });

    socket.on('new player', function (data) {

        players[data.id] = {};

    });

    socket.on('remove player', function (data) {

        delete players[data.id];

    });

    socket.on('players', function (data) {

        data.players.forEach(player => {

            players[player] = {};

        })

    });

    document.addEventListener('click', () => {

        console.log(players);

    })

})