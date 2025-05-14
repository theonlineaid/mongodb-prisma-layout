// src/routes/user.routes.js
import express from 'express';
import { loginUser, refreshAccessToken, registerUser } from '../controllers/user.controller.js';
import upload from '../middleware/upload.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

// `image` is the key for the uploaded file
router.post('/register', upload.single('image'), registerUser);
router.post('/login', loginUser);
router.post('/refresh', refreshAccessToken);

export default router;
