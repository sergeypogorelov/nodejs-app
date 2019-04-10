import * as express from 'express';
import { Sequelize, Model } from 'sequelize';

const initializer = (sequelize) => {

    const router = express.Router();

    const UserAttributes = {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        name: {
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

    class User extends Model { }
    User.init(UserAttributes, { sequelize });

    router.get('/', (req, res, next) => {
        User
            .findAll()
            .then(users => {
                return res.status(200).json(users);
            })
            .catch(err => {
                console.error('error:', err);
                next(err);
            });
    });

    return router;

}

export const usersRouter = initializer;
