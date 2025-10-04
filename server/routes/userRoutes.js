import express from 'express';
import { auth } from '../middlewares/auth.js';
import { getPublishedCreations, getUserCreations, toggleLikeCreation } from '../controllers/usercontroller.js';


const userRouter =express.Router();

userRouter.get('/get-user-creation' ,auth,getUserCreations)
userRouter.get('/get-published-creation' ,auth,getPublishedCreations)
userRouter.post('/toggle-like-creation' ,auth,toggleLikeCreation)


export default userRouter;