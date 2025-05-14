import express from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { createLayout, getLayouts, getLayout, switchLayout, deleteLayout } from '../controllers/dashboard.controller.js';


const layoutRouter = express.Router();

layoutRouter.post('/', authenticate, createLayout);  // Create a new layout
layoutRouter.get('/', authenticate, getLayouts);     // Get all layouts
layoutRouter.get('/:id', authenticate, getLayout);   // Get a specific layout
layoutRouter.put('/:id/switch', authenticate, switchLayout);  // Switch to another layout
layoutRouter.delete('/:id', authenticate, deleteLayout);      // Delete a layout

export default layoutRouter;