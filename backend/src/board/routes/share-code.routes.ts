import {Request, Response, Router} from 'express';
import checkJwt from '../../middleware/auth';
import {ShareCodeService} from '../services/share-code.service';

const router = Router();
const shareCodeService = new ShareCodeService();

router.get('/code/:code', async (req: Request, res: Response) => {
    try {
        const board = await shareCodeService.getByCode(req.params.code.toUpperCase());
        if (!board) {
            res.status(404).json({message: 'Board not found or share code has expired'});
            return;
        }
        res.json(board);
    } catch (error) {
        res.status(500).json({message: 'Error retrieving bingo board', error});
    }
});

router.post('/:id/share', checkJwt, async (req: Request, res: Response) => {
    try {
        const {sub} = req.auth?.payload || {};
        if (!sub) {
            res.status(401).json({message: 'Unauthorized'});
            return;
        }

        const result = await shareCodeService.generate(req.params.id, sub);
        if (!result) {
            res.status(404).json({message: 'Board not found or you do not have permission to share it'});
            return;
        }

        res.json(result);
    } catch (error) {
        console.error('Error generating share code:', error);
        res.status(500).json({message: 'Error generating share code'});
    }
});

router.delete('/:id/share', checkJwt, async (req: Request, res: Response) => {
    try {
        const {sub} = req.auth?.payload || {};
        if (!sub) {
            res.status(401).json({message: 'Unauthorized'});
            return;
        }

        const success = await shareCodeService.disable(req.params.id, sub);
        if (!success) {
            res.status(404).json({message: 'Board not found or you do not have permission to modify it'});
            return;
        }

        res.status(204).send();
    } catch (error) {
        console.error('Error disabling share code:', error);
        res.status(500).json({message: 'Error disabling share code'});
    }
});

export default router;
