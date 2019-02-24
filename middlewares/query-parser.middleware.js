export function queryParserMiddleware() {
    return (req, res, next) => {
        req.parsedQuery = req.query;
        next();
    };
}
