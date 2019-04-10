import express from 'express';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { Sequelize } from 'sequelize';

import * as middlewares from './middlewares';
import * as routes from './routes';

import * as dbCfg from './database/config/config.json';

const app = express();
const sequelize = new Sequelize(dbCfg.development.database, dbCfg.development.username, dbCfg.development.password, {
    host: dbCfg.development.host,
    dialect: dbCfg.development.dialect
});

sequelize
    .authenticate()
    .then(() => {
        const authRouter = routes.generateAuthRouter(passport);

        app.use(cookieParser());
        app.use(middlewares.cookieParserMiddleware());
        app.use(middlewares.queryParserMiddleware());

        app.use(passport.initialize());

        app.use('/auth', authRouter);
        app.use('/api/products', middlewares.tokenCheckerMiddleware(), routes.productsRouter(sequelize));
        app.use('/api/users', middlewares.tokenCheckerMiddleware(), routes.usersRouter(sequelize));

        app.use(middlewares.errorHandlerMiddleware());
    })
    .catch(err => console.error(err));

export default app;
