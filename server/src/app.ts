import express from 'express';
import cors from 'cors';
import usersRouter from './routes/users.js';
import guildsRouter from './routes/guilds.js';
import battlesRouter from './routes/battles.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/users', usersRouter);
app.use('/api/guilds', guildsRouter);
app.use('/api/battles', battlesRouter);

export { app }; 