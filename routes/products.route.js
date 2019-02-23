import * as express from 'express';

let lastUsedId = 1;

const products = [
    {
        id: lastUsedId++,
        name: 'product-1',
        reviews: ['review-11', 'review-12']
    },
    {
        id: lastUsedId++,
        name: 'product-2',
        reviews: ['review-21', 'review-22', 'review-23']
    },
    {
        id: lastUsedId++,
        name: 'product-3',
        reviews: ['review-31']
    }
];

const router = express.Router();

router.param('productId', (req, res, next) => {
    let productId = +req.params.productId;
    if (!isNaN(productId)) {
        let product = products.find(i => i.id === productId);
        if (product) {
            req.product = product;
        }
    }
    next();
});

router.get('/:productId', (req, res, next) => {
    if (req.product) {
        res.status(200).json(req.product);
    } else {
        res.status(404).send();
    }
    next();
});

router.get('/:productId/reviews', (req, res, next) => {
    if (req.product) {
        res.status(200).json(req.product.reviews);
    } else {
        res.status(404).send();
    }
    next();
});

router.get('/', (req, res, next) => {
    res.status(200).json(products);
    next();
});

router.use(express.json());

router.post('/', (req, res, next) => {
    let product = req.body;
    if (product) {
        if (!product.id) {
            product.id = lastUsedId++;
        }
        products.push(product);
        res.status(200).json(product);
    } else {
        res.status(400).send();
    }
    next();
});

export const productsRouter = router;
