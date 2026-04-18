import {Request, Response, Router} from 'express';
import checkJwt from '../middleware/auth';
import {UserService} from './user-service';

const router = Router();

router.post('/login', checkJwt, async (req: Request, res: Response) => {
    try {
        const sub = req.auth?.payload?.sub;
        const email = req.auth?.payload?.email as string | undefined;
        const name = req.body?.name as string | undefined;

        if (!sub || !email) {
            res.status(400).json({message: 'Invalid user data'});
            return;
        }

        const user = await UserService.upsert({id: sub, email, name});
        res.json(user);
    } catch (err) {
        console.error('Error upserting user:', err);
        res.status(500).json({message: 'Internal server error'});
    }
});

export default router;