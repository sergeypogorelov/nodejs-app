const http = require('http');
const mongodb = require('mongodb');

const cities = require('./cities.json');

const url = 'mongodb://localhost:27017/';
const MongoClient = mongodb.MongoClient;
MongoClient.connect(url, { }, (err, db) => {

    if (err) {
        console.error(err);
        return;
    }

    const dbo = db.db('node-js-app');
    const collection = dbo.collection('cities');

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
                                    .then(items => res.end(JSON.stringify(items)))
                                    .catch(error => console.error(error));

                            });

                            server.on('error', err => console.error(err));

                            server.listen(1234, 'localhost');

                        })
                        .catch(error => console.error(error));

                })
                .catch(error => console.error(error));

        })
        .catch(error => console.error(error));

});
