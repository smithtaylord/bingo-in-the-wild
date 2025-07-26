import {Request, Response, Router} from 'express';
import checkJwt from '../middleware/auth';
import {UserService} from './user-service';

const router = Router();

router.post('/login', checkJwt, async (req: Request, res: Response) => {
    try {
        // Get user id from JWT
        const {sub} = req.auth?.payload as { sub?: string };
        // Get email and name from request body
        const {email, name} = req.body as { email?: string; name?: string };

        if (!sub || !email) {
            res.status(400).json({message: 'Invalid user data'});
            return;
        }

        const user = await UserService.upsert({id: sub, email, name});
        res.json(user);
    } catch (err) {
        console.error('Error upserting user:', err); // Already present
        if (err instanceof Error) {
            res.status(500).json({message: err.message, stack: err.stack});
        } else {
            res.status(500).json({message: 'Internal server error'});
        }
    }
});

export default router;