import express from 'express';
import cors from 'cors';
import usersRouter from './routes/users.js';
import guildsRouter from './routes/guilds.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/users', usersRouter);
app.use('/api/guilds', guildsRouter);

export { app }; 