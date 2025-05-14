// src/server.js
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from "cookie-parser"
import RootRouter from './routers/index.js';

dotenv.config();
const app = express();
app.use(cookieParser());

app.use(express.json());
app.use('/api', RootRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
