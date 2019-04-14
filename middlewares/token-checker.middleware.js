import * as jwt from 'jsonwebtoken';

import * as cfg from '../config/config.dev.json';

export function tokenCheckerMiddleware() {
    return (req, res, next) => {
        let token = req.headers['x-access-token'];
        if (token) {
            jwt.verify(token, cfg.privateKey, (err, decoded) => {
                if (err) {
                    console.error('Cannot authenticate.', err);
                    next(err);
                } else {
                    console.log('Authenticated as', decoded);
                    next();
                }
            });
        } else {
            return res.status(403).send({
                status: 403,
                message: '403 Forbidden'
            });
        }
    };
}
