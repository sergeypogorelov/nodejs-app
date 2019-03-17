import * as express from 'express';
import * as jwt from 'jsonwebtoken';

import * as cfg from '../config/config.dev';

const USER_NAME = 'admin';
const USER_PASS = 'admin';

const router = express.Router();

router.use(express.json());

router.post('/', (req, res, next) => {
    const { username, password } = req.body || {};
    let code = 200;
    if (username === USER_NAME) {
        if (password === USER_PASS) {
            let payload = { sub: username };
            let token = jwt.sign(payload, cfg.privateKey);
            res.status(code).send(generateResponseOnSuccess(username, token));
            return;
        } else {
            code = 403;
        }
    } else {
        code = 404;
    }
    res.status(code).send(generateResponseOnError(code));
});

export const authRouter = router;

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
