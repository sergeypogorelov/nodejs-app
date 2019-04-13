const http = require('http');
const mongodb = require('mongodb');

const cities = require('./cities.json');

const DB_HOST = 'localhost';
const DB_PORT = 27017;
const DB_NAME = 'node-js-app';
const DB_COLLECTION = 'cities';

const HOST = 'localhost';
const PORT = 1234;

const url = `mongodb://${DB_HOST}:${DB_PORT}/`;
const MongoClient = mongodb.MongoClient;
MongoClient.connect(url, { }, (err, db) => {

    if (err) {
        console.error(err);
        return;
    }

    const dbo = db.db(DB_NAME);
    const collection = dbo.collection(DB_COLLECTION);

    /// first, remove all data in the collection
    collection.remove({ })
        .then(() => {

            /// then, add the mocked data
            collection.insertMany(cities)
                .then(() => {

                    /// let's count the data in the collection
                    collection.count()
                        .then(itemsCount => {

                            /// not it's time to create the server
                            const server = http.createServer();

                            server.on('request', (req, res) => {

                                req.on('error', err => console.error(err));
                                res.on('error', err => console.error(err));

                                res.writeHead(200, {
                                    'Content-Type': 'application/json'
                                });

                                /// generate randomly the count of items to skip
                                let itemsToSkip = Math.floor(Math.random() * itemsCount);

                                /// and here we go
                                collection
                                    .find()
                                    .skip(itemsToSkip)
                                    .limit(1)
                                    .toArray()
                                    .then(items => res.end(JSON.stringify(items[0])))
                                    .catch(error => console.error(error));

                            });

                            server.on('error', err => console.error(err));

                            server.listen(PORT, HOST, () => console.log(`App is listening on http://${HOST}:${PORT}.`));

                        })
                        .catch(error => console.error(error));

                })
                .catch(error => console.error(error));

        })
        .catch(error => console.error(error));

});
