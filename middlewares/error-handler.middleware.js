export function errorHandlerMiddleware() {
    return (err, req, res, next) => {
        console.error(err);
        if (res.headersSent)
            return next(err);
        res.status(500).json({
            code: 500,
            message: 'Internal Server Error'
        });
    };
}
