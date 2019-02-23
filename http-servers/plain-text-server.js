const http = require('http');

const server = http.createServer();

server.on('request', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/plain'
    });
    res.end('Hello World!!!');
});

server.listen(1234, 'localhost');
