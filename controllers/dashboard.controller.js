// src/controllers/layoutController.js

import { prisma } from "../config/prismaClient.js";


// Create a new layout
export const createLayout = async (req, res) => {
    const { name, is_default = false, is_active = true } = req.body;
    const userId = req.user.userId; // Assuming user is logged in, attach userId from auth middleware
    const role = req.user.role;

    try {

        if (is_default && role !== 'admin') {
            return res.status(403).json({ error: 'Only admin can create default layouts' });
        }
        // Check if the user already has a default layout
        if (is_default) {
            await prisma.layout.updateMany({
                where: { userId, is_default: true },
                data: { is_default: false }
            });
        }

        // Create a new layout
        const layout = await prisma.layout.create({
            data: {
                name,
                is_default,
                is_active,
                userId,
            },
        });

        return res.status(201).json({
            message: 'Layout created successfully',
            layout,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to create layout' });
    }
};

// Get all layouts for a user
export const getLayouts = async (req, res) => {
    const userId = req.user.id; // Assuming user is logged in

    try {
        const layouts = await prisma.layout.findMany({
            where: { userId },
        });
        return res.status(200).json({
            "message": "All layout get successfully",
            layouts
        }

        );
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to fetch layouts' });
    }
};

// Get a specific layout by ID
export const getLayout = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id; // Assuming user is logged in

    try {
        const layout = await prisma.layout.findFirst({
            where: { id, userId },
        });

        if (!layout) {
            return res.status(404).json({ error: 'Layout not found' });
        }

        return res.status(200).json(layout);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to fetch layout' });
    }
};

// Switch to another layout (set is_active = true for this layout)
export const switchLayout = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id; // Assuming user is logged in

    try {
        // Deactivate all other layouts
        await prisma.layout.updateMany({
            where: { userId },
            data: { is_active: false },
        });

        // Activate the selected layout
        const layout = await prisma.layout.update({
            where: { id },
            data: { is_active: true },
        });

        return res.status(200).json({
            message: 'Layout switched successfully',
            layout,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to switch layout' });
    }
};

// Delete a layout
export const deleteLayout = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id; // Assuming user is logged in

    try {
        // Check if layout exists
        const layout = await prisma.layout.findFirst({
            where: { id, userId },
        });

        if (!layout) {
            return res.status(404).json({ error: 'Layout not found' });
        }

        // Delete the layout
        await prisma.layout.delete({
            where: { id },
        });

        return res.status(200).json({
            message: 'Layout deleted successfully',
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to delete layout' });
    }
};
