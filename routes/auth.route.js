import * as express from 'express';
import * as passportLocal from 'passport-local';
import * as jwt from 'jsonwebtoken';

import * as cfg from '../config/config.dev';

const USER_NAME = 'admin';
const USER_PASS = 'admin';

export function generateAuthRouter(passport) {

    passport.use(new passportLocal.Strategy(
        {
            usernameField: 'username',
            passwordField: 'password'
        },
        (username, password, cb) => {
            if (username === USER_NAME) {
                if (password === USER_PASS) {
                    cb(null, { username });
                } else {
                    cb(403, null);
                }
            } else {
                cb(404, null);
            }
        }
    ));

    const router = express.Router();

    router.use('/', (req, res, next) => {
        passport.authenticate('local', (err, user, info) => {
            if (err) {
                if (typeof err === 'number') {
                    res.status(err).send(generateResponseOnError(err));
                } else {
                    next(err);
                }
            } else {
                if (user) {
                    let payload = { sub: user.username };
                    let token = jwt.sign(payload, cfg.privateKey);
                    res.status(200).send(generateResponseOnSuccess(user.username, token));
                } else {
                    let code = 403;
                    res.status(code).send(generateResponseOnError(code));
                }   
            }
        })(req, res, next);
    });

    return router;
};

/////

function generateResponseOnSuccess(username, token) {
    return {
        code: 200,
        message: 'OK',
        data: {
            user: {
                username
            }
        },
        token
    };
}

function generateResponseOnError(code) {
    let message = '';
    if (code === 403) {
        message = 'Forbidden';
    } else if (code === 404) {
        message = 'Not Found';
    }
    return {
        code,
        message
    }
}
