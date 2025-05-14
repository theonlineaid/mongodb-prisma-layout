
import express from 'express';
import UserRouter from './user.router.js';
import layoutRouter from './layout.router.js';

const RootRouter = express.Router();

RootRouter.use("/users", UserRouter)
RootRouter.use("/layout", layoutRouter)


export default RootRouter;