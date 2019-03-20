import express from 'express';
import cookieParser from 'cookie-parser';

import passport from 'passport';
import * as passportLocal from 'passport-local';
import expressSession from 'express-session';
import * as connectEnsureLogin from 'connect-ensure-login';

import * as middlewares from './middlewares';
import * as routes from './routes';

passport.use(new passportLocal.Strategy(
    {
        usernameField: 'username',
        passwordField: 'password'
    },
    (username, password, cb) => {
        cb(null, { username });
    }
));

passport.serializeUser((user, cb) => {
    cb(null, user.username);
});
  
passport.deserializeUser((username, cb) => {
    cb(null, { username })
});

const app = express();

app.use(cookieParser());
app.use(middlewares.cookieParserMiddleware());
app.use(middlewares.queryParserMiddleware());

app.use(expressSession({ secret: 'shh...', resave: false, saveUninitialized: false }));

app.use(passport.initialize());
app.use(passport.session());
app.use('/passport', passport.authenticate('local'), (req, res) => res.send('OK'));

app.use('/auth', routes.authRouter);
app.use('/api/products', connectEnsureLogin.ensureLoggedIn(), routes.productsRouter);
app.use('/api/users', connectEnsureLogin.ensureLoggedIn(), routes.usersRouter);

// app.get('/test-middlewares', (req, res, next) => {
//     const { parsedCookies, parsedQuery } = req;
//     res.status(200).json({ parsedCookies, parsedQuery });
//     next();
// });

//app.use(middlewares.errorHandlerMiddleware());

export default app;
