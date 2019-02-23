const net = require('net');

const server = net.createServer();

server.on('connection', socket => {
    socket.on('error', error => console.error(error));
    socket.pipe(socket);
});

server.listen(1234, 'localhost');
