export function cookieParserMiddleware() {
    return (req, res, next) => {
        let cookies = req.cookies;
        if (cookies) {
            req.parsedCookies = cookies;
        } else {
            req.parsedCookies = {};
        }
        next();
    };
}
