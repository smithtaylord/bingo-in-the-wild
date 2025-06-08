import express from 'express';
import { connectToDB } from './db';
import dotenv from 'dotenv';
import checkJwt from './middleware/auth';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Public route is working!');
});

app.get('/protected', checkJwt, (req, res) => {
    res.send('🎉 You accessed a protected route!');
});

connectToDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
    });
});

