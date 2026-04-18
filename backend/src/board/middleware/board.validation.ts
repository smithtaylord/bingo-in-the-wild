import {Request, Response, NextFunction} from 'express';

export const validateCreateBoard = (req: Request, res: Response, next: NextFunction) => {
    const {name, items, freeSpace, category} = req.body;

    if (!name || typeof name !== 'string') {
        res.status(400).json({message: 'Name is required and must be a string'});
        return;
    }

    if (name.length > 100) {
        res.status(400).json({message: 'Name must be 100 characters or less'});
        return;
    }

    if (!items || !Array.isArray(items)) {
        res.status(400).json({message: 'Items must be an array'});
        return;
    }

    if (items.length < 24) {
        res.status(400).json({message: 'At least 24 items are required'});
        return;
    }

    if (items.length > 100) {
        res.status(400).json({message: 'Items must not exceed 100 entries'});
        return;
    }

    if (!items.every((item: unknown) => typeof item === 'string' && item.trim().length > 0)) {
        res.status(400).json({message: 'All items must be non-empty strings'});
        return;
    }

    if (freeSpace !== undefined && typeof freeSpace !== 'string') {
        res.status(400).json({message: 'Free space must be a string'});
        return;
    }

    if (category !== undefined && typeof category !== 'string') {
        res.status(400).json({message: 'Category must be a string'});
        return;
    }

    next();
};

export const validateUpdateBoard = (req: Request, res: Response, next: NextFunction) => {
    const {name, items, freeSpace, category} = req.body;

    if (name !== undefined) {
        if (typeof name !== 'string') {
            res.status(400).json({message: 'Name must be a string'});
            return;
        }
        if (name.length > 100) {
            res.status(400).json({message: 'Name must be 100 characters or less'});
            return;
        }
    }

    if (items !== undefined) {
        if (!Array.isArray(items)) {
            res.status(400).json({message: 'Items must be an array'});
            return;
        }
        if (items.length < 24) {
            res.status(400).json({message: 'At least 24 items are required'});
            return;
        }
        if (items.length > 100) {
            res.status(400).json({message: 'Items must not exceed 100 entries'});
            return;
        }
        if (!items.every((item: unknown) => typeof item === 'string' && item.trim().length > 0)) {
            res.status(400).json({message: 'All items must be non-empty strings'});
            return;
        }
    }

    if (freeSpace !== undefined && typeof freeSpace !== 'string') {
        res.status(400).json({message: 'Free space must be a string'});
        return;
    }

    if (category !== undefined && typeof category !== 'string') {
        res.status(400).json({message: 'Category must be a string'});
        return;
    }

    next();
};