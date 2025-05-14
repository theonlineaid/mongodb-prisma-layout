// src/controllers/user.controller.js
import bcrypt from 'bcryptjs';
import cloudinary from '../config/cloudinary.js';
import { prisma } from '../config/prismaClient.js';
import { generateTokens } from '../utils/jwt.js';
import jwt from 'jsonwebtoken';

export const registerUser = async (req, res) => {
    const { username, email, password } = req.body;
    const file = req.file;

    if (!username || !email || !password)
        return res.status(400).json({ error: 'All fields are required' });

    try {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return res.status(400).json({ error: 'Email already exists' });

        let imageUrl = null;

        if (file) {
            // Use upload_stream with buffer
            imageUrl = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'users' },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result.secure_url);
                    }
                );
                stream.end(file.buffer); // send buffer to stream
            });
        }

        const hashed = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashed,
                imageUrl,
            },
        });

        res.status(201).json({
            message: 'User registered',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                imageUrl: user.imageUrl,
            },
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
};



export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password)
        return res.status(400).json({ error: 'Email and password required' });

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        const { accessToken, refreshToken } = generateTokens(user);

        // console.log('Generated Access Token:', accessToken);  // Debugging

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,  // Makes the cookie inaccessible to JavaScript
            secure: process.env.NODE_ENV === 'production', // Secure in production (HTTPS)
            sameSite: 'strict',  // CSRF protection
            maxAge: 7 * 24 * 60 * 60 * 1000,  // Refresh token expiration: 7 days
        });

        return res.status(200).json({
            message: 'Login successful',
            accessToken,  // Make sure accessToken is being sent back
            refreshToken,
            user: { id: user.id, email: user.email, username: user.username, role: user.role }
        });
    } catch (err) {
        console.error(err);  // Log error if any
        return res.status(500).json({ error: err.message });
    }
};


export const refreshAccessToken = async (req, res) => {
    const token = req.cookies.refreshToken || req.headers['x-refresh-token'];
    if (!token) return res.status(401).json({ error: 'Refresh token missing' });

    try {
        // Verify the refresh token
        const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

        // Find the user by the decoded userId from the refresh token
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user) return res.status(401).json({ error: 'User not found' });

        // Generate a new access token (and refresh token if needed)
        const { accessToken } = generateTokens(user); // Extract accessToken from the object

        console.log(accessToken)

        // Return the new access token
        res.json({ accessToken });
    } catch (err) {
        return res.status(403).json({ error: 'Invalid or expired refresh token lol' });
    }
};


export const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany(); // Fetch all users from the database
        res.status(200).json({ users });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};



export const deleteUser = async (req, res) => {
    const { userId } = req.params;

    try {
        console.log('Deleting user:', userId);
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            console.log('User not found');
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.imageUrl) {
            const fileName = user.imageUrl.split('/').pop().split('.')[0];
            const publicId = `users/${fileName}`;
            console.log('Deleting image from Cloudinary:', publicId);
            await cloudinary.uploader.destroy(publicId);
        }

        await prisma.user.delete({ where: { id: userId } });
        console.log('User deleted successfully');

        res.status(200).json({ message: 'User and image deleted successfully' });
    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
};
