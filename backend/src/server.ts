import express from 'express';
import {connectToDB} from './db';
import dotenv from 'dotenv';
import checkJwt from './middleware/auth';
import cors from 'cors';
import userController from './user/user-controller';
import bingoBoardController from './board/bingo-board-contoller';


dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// ✅ Allow CORS from frontend
app.use(cors({
    origin: 'http://localhost:8100', // allow frontend dev server
    credentials: true,
}));
app.get('/', (req, res) => {
    res.send('Public route is working!');
});

app.get('/protected', checkJwt, (req, res) => {
    res.send('🎉 You accessed a protected route!');
});

// Register Controllers
app.use('/api/user', userController);
app.use('/api/bingo-board', bingoBoardController);

connectToDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
    });
});

