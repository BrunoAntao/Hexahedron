//HTTP server

const http = require('http');

let server = http.createServer().listen(8002, () => {

    console.log('HTTP server started on port 8002');

});

//Socket server

let instances = {};
let cube = '6139474370e4df3d2ebf8d58';

instances[cube] = { 'room1': { players: [] } };

const io = require("socket.io")(server, {

    cors: {
        origin: "https://web.webdevtools.duckdns.org",
    }

});

io.on('connection', (socket) => {

    socket.onAny((eventName, ...args) => {

        console.log(eventName, ...args);

    });

    console.log('user ' + socket.id + ' connected');

    socket.on('join', (data) => {

        socket.join(data.id);

        socket.emit('players', { players: instances[cube][data.id].players });

        socket.to(data.id).emit('new player', { id: socket.id });

        instances[cube][data.id].players.push(socket.id);

    });


    socket.on('disconnecting', () => {

        for (let room of socket.rooms) {

            if (room != socket.id) {

                let i = instances[cube][room].players.indexOf(socket.id);

                instances[cube][room].players.splice(i, 1);

                socket.to(room).emit('remove player', { id: socket.id });

            }

        }

    });

    socket.on('disconnect', () => {

        console.log('user ' + socket.id + ' disconnected');

    });

});