import express from 'express';

import * as routes from './routes';

const app = express();

app.use('/api/products', routes.productsRouter);
app.use('/api/users', routes.usersRouter);

export default app;
