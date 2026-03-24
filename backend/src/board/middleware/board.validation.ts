import {Request, Response, NextFunction} from 'express';

export const validateCreateBoard = (req: Request, res: Response, next: NextFunction) => {
    const {name, items} = req.body;

    if (!name || typeof name !== 'string') {
        res.status(400).json({message: 'Name is required'});
        return;
    }

    if (!items || !Array.isArray(items) || items.length < 24) {
        res.status(400).json({message: 'At least 24 items are required'});
        return;
    }

    next();
};

export const validateUpdateBoard = (req: Request, res: Response, next: NextFunction) => {
    const {items} = req.body;

    if (items && (!Array.isArray(items) || items.length < 24)) {
        res.status(400).json({message: 'At least 24 items are required'});
        return;
    }

    next();
};
