import * as express from 'express';
import { Sequelize, Model } from 'sequelize';

const initializer = (sequelize) => {

    const router = express.Router();

    const ProductAttributes = {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        name: {
            type: Sequelize.STRING
        },
        description: {
            type: Sequelize.STRING
        },
        createdAt: {
            allowNull: false,
            type: Sequelize.DATE,
            set: val => {
                if (val) {
                    this.setDataValue('createdAt', val);
                } else if (!val && !this.createdAt) {
                    this.setDataValue('createdAt', new Date().toISOString());
                }
            }
        },
        updatedAt: {
            allowNull: false,
            type: Sequelize.DATE,
            set: val => {
                if (val) {
                    this.setDataValue('updatedAt', val);
                } else if (!val && !this.updatedAt) {
                    this.setDataValue('updatedAt', new Date().toISOString());
                }
            }
        }
    };

    class Product extends Model { }
    Product.init(ProductAttributes, { sequelize });

    router.param('productId', (req, res, next) => {
        let productId = +req.params.productId;
        if (!isNaN(productId)) {
            Product
                .findByPk(productId)
                .then(product => {
                    req.product = product;
                    next();
                })
                .catch(err => {
                    next(err);
                });
        } else {
            next();
        }
    });
    
    router.get('/:productId', (req, res, next) => {
        if (req.product) {
            return res.status(200).json(req.product);
        } else {
            return res.status(404).send({
                code: 404,
                message: 'Not Found'
            });
        }
    });
    
    router.get('/:productId/reviews', (req, res, next) => {
        if (req.product) {
            return res.status(200).json([]); /// there is no info about the reviews in the task 6
        } else {
            return res.status(404).send({
                code: 404,
                message: 'Not Found'
            });
        }
    });
    
    router.get('/', (req, res, next) => {
        Product
            .findAll()
            .then(products => {
                return res.status(200).json(products);
            })
            .catch(err => {
                console.error('error:', err);
                next(err);
            });
    });
    
    router.use(express.json());
    
    router.post('/', (req, res, next) => {
        let product = req.body;
        if (product) {
            Product
                .create(product)
                .then(product => {
                    return res.status(200).json(product);
                })
                .catch(err => {
                    console.error('error:', err);
                    next(err);
                });
        } else {
            return res.status(400).send({
                code: 400,
                message: 'Bad Request'
            });
        }
    });

    return router;

};



export const productsRouter = initializer;
