const http = require('http');

const PRODUCT = {
    id: 1 ,
    name: 'Supreme T-Shirt' ,
    brand: 'Supreme' ,
    price: 99.99 ,
    options: [
        { color: 'blue' },
        { size: 'XL' }
    ]
};

const server = http.createServer();

server.on('request', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'application/json'
    });
    res.end(JSON.stringify(PRODUCT));
});

server.listen(1234, 'localhost');
