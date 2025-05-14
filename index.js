// src/server.js
import express from 'express';
import dotenv from 'dotenv';
import userRoutes from './routers/user.router.js';
import cookieParser from "cookie-parser"

dotenv.config();
const app = express();
app.use(cookieParser());

app.use(express.json());
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
