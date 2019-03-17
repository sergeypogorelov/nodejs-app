import * as jwt from 'jsonwebtoken';

import * as cfg from '../config/config.dev.json';

export function tokenCheckerMiddleware() {
    return (req, res, next) => {
        let token = req.headers['x-access-token'];
        if (token) {
            jwt.verify(token, cfg.privateKey, (err, decoded) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log(decoded);
                    next();
                    return;
                }
            });
        }
        res.status(403).send('403 Forbidden');
    };
}
