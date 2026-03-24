import {Request, Response, Router} from 'express';
import checkJwt from '../../middleware/auth';
import {BoardService} from '../services/board.service';
import {validateCreateBoard, validateUpdateBoard} from '../middleware/board.validation';

const router = Router();
const boardService = new BoardService();

router.get('/', async (req: Request, res: Response) => {
    try {
        const boards = await boardService.getAll();
        res.json(boards);
    } catch (error) {
        res.status(500).json({message: 'Error retrieving bingo boards', error});
    }
});

router.get('/user/:userId', async (req: Request, res: Response) => {
    try {
        const boards = await boardService.getByUserId(req.params.userId);
        res.json(boards);
    } catch (error) {
        res.status(500).json({message: 'Error retrieving user boards', error});
    }
});

router.get('/:id', async (req: Request, res: Response) => {
    try {
        const board = await boardService.getById(req.params.id);
        if (!board) {
            res.status(404).json({message: 'Board not found'});
            return;
        }
        res.json(board);
    } catch (error) {
        res.status(500).json({message: 'Error retrieving bingo board', error});
    }
});

router.post('/', checkJwt, validateCreateBoard, async (req: Request, res: Response) => {
    try {
        const {sub} = req.auth?.payload || {};
        if (!sub) {
            res.status(401).json({message: 'Unauthorized'});
            return;
        }

        const {name, items, freeSpace, category} = req.body;

        const board = await boardService.create({
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

router.put('/:id', checkJwt, validateUpdateBoard, async (req: Request, res: Response) => {
    try {
        const {sub} = req.auth?.payload || {};
        if (!sub) {
            res.status(401).json({message: 'Unauthorized'});
            return;
        }

        const {name, items, freeSpace, category} = req.body;

        const board = await boardService.update(req.params.id, sub, {
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

        const deleted = await boardService.delete(req.params.id, sub);

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

router.post('/:id/copy', checkJwt, async (req: Request, res: Response) => {
    try {
        const {sub} = req.auth?.payload || {};
        if (!sub) {
            res.status(401).json({message: 'Unauthorized'});
            return;
        }

        const board = await boardService.copy(req.params.id, sub);
        if (!board) {
            res.status(404).json({message: 'Board not found'});
            return;
        }

        res.status(201).json(board);
    } catch (error) {
        console.error('Error copying board:', error);
        res.status(500).json({message: 'Error copying bingo board'});
    }
});

export default router;
