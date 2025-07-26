import express, {Request, Response, Router} from 'express';
import {getAllBingoBoards} from "./bingo-board-service";

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        // TODO THis will also need to take in the currentUSER Id optionally also also include their games
        const boards = await getAllBingoBoards();
        res.json(boards);
    } catch (error) {
        res.status(500).json({message: 'Error retrieving bingo boards', error});
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
