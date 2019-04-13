const mongoose = require('mongoose');

const users = require('../data/users');
const products = require('../data/products');

const DB_HOST = 'localhost';
const DB_PORT = 27017;
const DB_NAME = 'node-js-app';

const USER_MODEL_NAME = 'User';
const PRODUCT_MODEL_NAME = 'Product';

const url = `mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`;
mongoose.connect(url, { useNewUrlParser: true });

const db = mongoose.connection;
db.on('error', error => errorHandler(error));
db.once('open', () => {

    const userSchema = {
        id: Number,
        name: String
    };

    const productSchema = {
        id: Number,
        name: String,
        description: String
    };

    const promises = [
        importEntities(users, USER_MODEL_NAME, userSchema),
        importEntities(products, PRODUCT_MODEL_NAME, productSchema)
    ];

    Promise.all(promises)
        .then(() => {
            console.log('Data is imported successfully.');
            db.close();
        })
        .catch(error => errorHandler(error, db));

});

function importEntities(entities, name, schema) {

    return new Promise((resolve, reject) => {

        const entitySchema = new mongoose.Schema(schema);
        const entityModel = mongoose.model(name, entitySchema);
    
        entityModel.deleteMany({ }, err => {
    
            if (err) {
                reject(err);
                return;
            }
    
            entityModel.insertMany(entities, err => {
    
                if (err) {
                    reject(err);
                    return;
                }
    
                resolve(entities);
    
            });
    
        });

    });
    
}

function errorHandler(error, db) {
    console.error('Something went wrong.');
    console.error(error);
    if (db) {
        db.close();
    }
}
