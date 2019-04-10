import express from 'express';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { Sequelize } from 'sequelize';

import * as middlewares from './middlewares';
import * as routes from './routes';

const sequelize = new Sequelize('node-js-db', 'postgres', null, {
    host: 'localhost',
    dialect: 'postgres'
});
sequelize
    .authenticate()
    .then(() => {
        console.log('DB OK');
        sequelize.close();
    })
    .catch(err => console.error(err));

const app = express();
const authRouter = routes.generateAuthRouter(passport);

app.use(cookieParser());
app.use(middlewares.cookieParserMiddleware());
app.use(middlewares.queryParserMiddleware());

app.use(passport.initialize());

app.use('/auth', authRouter);
app.use('/api/products', middlewares.tokenCheckerMiddleware(), routes.productsRouter);
app.use('/api/users', middlewares.tokenCheckerMiddleware(), routes.usersRouter);

// app.get('/test-middlewares', (req, res, next) => {
//     const { parsedCookies, parsedQuery } = req;
//     res.status(200).json({ parsedCookies, parsedQuery });
//     next();
// });

app.use(middlewares.errorHandlerMiddleware());

export default app;
