import express from 'express';
import {connectToDB} from './db';
import dotenv from 'dotenv';
import checkJwt from './middleware/auth';
import cors from 'cors';
import userController from './user/user-controller';
import boardRouter from './board';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:8100';

app.use(express.json());

app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:8100',
        'http://localhost:3000',
        'https://bingo.taylor-smith.xyz',
        'https://bingo-in-the-wild.github.io',
    ].concat(CORS_ORIGIN ? CORS_ORIGIN.split(',') : []),
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
app.use('/api/board', boardRouter);

connectToDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
    });
});

