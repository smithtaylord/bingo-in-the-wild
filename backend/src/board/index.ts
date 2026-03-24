import {Router} from 'express';
import boardRoutes from './routes/board.routes';
import shareCodeRoutes from './routes/share-code.routes';

const router = Router();

router.use(shareCodeRoutes);
router.use(boardRoutes);

export default router;
