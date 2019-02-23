const path = require('path');
const fs = require('fs');
const http = require('http');

const server = http.createServer();

const TEMPLATE_FILENAME = './index.html';

const MESSAGE = 'Hello World!!!';
const MESSAGE_PLACEHOLDER = '{message}';

server.on('request', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/html'
    });
    const reader = fs.createReadStream(path.resolve(TEMPLATE_FILENAME));
    reader.on('data', chunk => {
        let str = chunk.toString();
        if (str.indexOf(MESSAGE_PLACEHOLDER) !== -1) {
            let splits = str.split(MESSAGE_PLACEHOLDER);
            str = splits.join(MESSAGE);
        }
        res.write(str);
    });
    reader.on('end', () => {
        res.end();
    });
});

server.listen(1234, 'localhost');
