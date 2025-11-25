import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import prisma from '../config/database.js';

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const statuses = await prisma.statuses.findMany();
    res.json({
      success: true,
      data: statuses,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
