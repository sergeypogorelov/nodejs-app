const http = require('http');
const mongoose = require('mongoose');

const cities = require('./cities.json');

const DB_HOST = 'localhost';
const DB_PORT = 27017;
const DB_NAME = 'node-js-app';
/// const DB_COLLECTION = 'cities';

const HOST = 'localhost';
const PORT = 1234;

const url = `mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`;
mongoose.connect(url, { useNewUrlParser: true });

const db = mongoose.connection;
db.on('error', error => errorHandler(error));
db.once('open', () => {

    const citySchema = new mongoose.Schema({
        name: String,
        country: String
    });

    const cityModel = mongoose.model('City', citySchema);
    cityModel.deleteMany({ }, err => {
        
        if (err) {
            errorHandler(err);
            return;
        }

        cityModel.insertMany(cities, err => {

            if (err) {
                errorHandler(err);
                return;
            }

            const server = http.createServer();

            server.on('request', (req, res) => {

                req.on('error', err => errorHandler(err, res));
                res.on('error', err => errorHandler(err, res));

                let itemsToSkip = Math.floor(Math.random() * cities.length);

                /// and here we go again
                cityModel
                    .find()
                    .skip(itemsToSkip)
                    .limit(1)
                    .exec((err, items) => {

                        if (err) {
                            errorHandler(err, res);
                            return;
                        }

                        res.writeHead(200, {
                            'Content-Type': 'application/json'
                        });

                        res.end(JSON.stringify(items[0]));

                    });

            });

            server.on('error', err => errorHandler(err));

            server.listen(PORT, HOST, () => console.log(`App is listening on http://${HOST}:${PORT}.`));
            

        });

    });

});

function errorHandler(error, response) {
    console.error(error);
    if (response) {
        response.writeHead(500);
        response.end();
    }
}
