// src/routes/user.routes.js
import express from 'express';
import { deleteUser, getAllUsers, loginUser, refreshAccessToken, registerUser } from '../controllers/user.controller.js';
import upload from '../middleware/upload.js';
import { isAdmin } from '../middleware/isAdmin.js';
import { authenticate } from '../middleware/authenticate.js';

const UserRouter = express.Router();

// `image` is the key for the uploaded file
UserRouter.post('/register', upload.single('image'), registerUser);
UserRouter.post('/login', loginUser);
UserRouter.post('/refresh', authenticate, refreshAccessToken);
UserRouter.delete('/del/:userId', authenticate, deleteUser);
UserRouter.get('/', authenticate, isAdmin, getAllUsers);

export default UserRouter;
