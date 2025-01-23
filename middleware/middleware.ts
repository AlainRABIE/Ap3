import { Request, Response, NextFunction } from 'express';

const blockNavigationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const blockedUrls = ['/blocked-url', '/another-blocked-url']; 

    if (blockedUrls.includes(req.path)) {
        res.status(403).send('Navigation bloquée');
    } else {
        next();
    }
};

export default blockNavigationMiddleware;