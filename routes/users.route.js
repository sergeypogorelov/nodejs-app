import * as express from 'express';

const users = [
    {
        id: 1,
        name: 'John'
    },
    {
        id: 2,
        name: 'Mike'
    },
    {
        id: 3,
        name: 'Kate'
    }
];

const router = express.Router();

router.get('/', (req, res, next) => {
    res.status(200).json(users);
    next();
});

export const usersRouter = router;
