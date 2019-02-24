import express from 'express';
import cookieParser from 'cookie-parser';

import * as middlewares from './middlewares';
import * as routes from './routes';

const app = express();

app.use(cookieParser());
app.use(middlewares.cookieParserMiddleware());
app.use(middlewares.queryParserMiddleware());

app.use('/api/products', routes.productsRouter);
app.use('/api/users', routes.usersRouter);

// app.get('/test-middlewares', (req, res, next) => {
//     const { parsedCookies, parsedQuery } = req;
//     res.status(200).json({ parsedCookies, parsedQuery });
//     next();
// });

export default app;
