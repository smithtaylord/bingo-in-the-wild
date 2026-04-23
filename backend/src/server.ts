import express from 'express';
import {connectToDB} from './db';
import dotenv from 'dotenv';
import checkJwt from './middleware/auth';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import userController from './user/user-controller';
import boardRouter from './board';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:8100';

app.set('trust proxy', 1);

app.use(express.json({limit: '100kb'}));
app.use(helmet());
app.use(compression());

app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:8100',
        'http://localhost:3000',
        'https://bingo.taylor-smith.xyz',
    ].concat(CORS_ORIGIN ? CORS_ORIGIN.split(',') : []),
    credentials: true,
}));

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {message: 'Too many requests, please try again later'},
});
app.use('/api', generalLimiter);

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {message: 'Too many login attempts, please try again later'},
});
app.use('/api/user/login', loginLimiter);

app.get('/', (req, res) => {
    res.send('Public route is working!');
});

app.get('/protected', checkJwt, (req, res) => {
    res.send('🎉 You accessed a protected route!');
});

app.use('/api/user', userController);
app.use('/api/board', boardRouter);

const server = app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});

connectToDB().catch((err) => {
    console.error('❌ Failed to connect to database:', err);
    process.exit(1);
});

process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
        process.exit(0);
    });
});