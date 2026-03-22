import express, {Request, Response, Router} from 'express';
import checkJwt from '../middleware/auth';
import {
    createBingoBoard,
    deleteBingoBoard,
    getAllBingoBoards,
    getBingoBoardById,
    getBingoBoardsByUserId,
    updateBingoBoard,
} from "./bingo-board-service";

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        const boards = await getAllBingoBoards();
        res.json(boards);
    } catch (error) {
        res.status(500).json({message: 'Error retrieving bingo boards', error});
    }
});

router.get('/user/:userId', async (req: Request, res: Response) => {
    try {
        const boards = await getBingoBoardsByUserId(req.params.userId);
        res.json(boards);
    } catch (error) {
        res.status(500).json({message: 'Error retrieving user boards', error});
    }
});

router.get('/:id', async (req: Request, res: Response) => {
    try {
        const board = await getBingoBoardById(req.params.id);
        if (!board) {
            res.status(404).json({message: 'Board not found'});
            return;
        }
        res.json(board);
    } catch (error) {
        res.status(500).json({message: 'Error retrieving bingo board', error});
    }
});

router.post('/', checkJwt, async (req: Request, res: Response) => {
    try {
        const {sub} = req.auth?.payload || {};
        if (!sub) {
            res.status(401).json({message: 'Unauthorized'});
            return;
        }

        const {name, items, freeSpace, category} = req.body;

        if (!name || !items || !Array.isArray(items) || items.length < 24) {
            res.status(400).json({message: 'Name and at least 24 items are required'});
            return;
        }

        const board = await createBingoBoard({
            name,
            items,
            freeSpace,
            category,
            userId: sub,
        });

        res.status(201).json(board);
    } catch (error) {
        console.error('Error creating board:', error);
        res.status(500).json({message: 'Error creating bingo board'});
    }
});

router.put('/:id', checkJwt, async (req: Request, res: Response) => {
    try {
        const {sub} = req.auth?.payload || {};
        if (!sub) {
            res.status(401).json({message: 'Unauthorized'});
            return;
        }

        const {name, items, freeSpace, category} = req.body;

        if (items && (!Array.isArray(items) || items.length < 24)) {
            res.status(400).json({message: 'At least 24 items are required'});
            return;
        }

        const board = await updateBingoBoard(req.params.id, sub, {
            name,
            items,
            freeSpace,
            category,
        });

        if (!board) {
            res.status(404).json({message: 'Board not found or you do not have permission to edit it'});
            return;
        }

        res.json(board);
    } catch (error) {
        console.error('Error updating board:', error);
        res.status(500).json({message: 'Error updating bingo board'});
    }
});

router.delete('/:id', checkJwt, async (req: Request, res: Response) => {
    try {
        const {sub} = req.auth?.payload || {};
        if (!sub) {
            res.status(401).json({message: 'Unauthorized'});
            return;
        }

        const deleted = await deleteBingoBoard(req.params.id, sub);

        if (!deleted) {
            res.status(404).json({message: 'Board not found or you do not have permission to delete it'});
            return;
        }

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting board:', error);
        res.status(500).json({message: 'Error deleting bingo board'});
    }
});

// router.get('/theme/:theme', async (req: Request, res: Response) => {
//     try {
//         const theme = req.params.theme;
//         const boards = await getBingoBoardsByTheme(theme);
//         res.json(boards);
//     } catch (error) {
//         res.status(500).json({message: 'Error retrieving boards by theme', error});
//     }
// });

export default router;
