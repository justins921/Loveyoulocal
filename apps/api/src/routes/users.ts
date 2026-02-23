import { Router, Request, Response } from 'express';
import prisma from '../utils/prisma';
import { requireAuth, requireRole } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

/**
 * GET /users
 * List all users (admin only)
 */
router.get(
  '/',
  requireAuth,
  requireRole(['ADMIN']),
  async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const skip = (page - 1) * limit;
      const role = req.query.role as string | undefined;
      const search = req.query.search as string | undefined;

      const where: Record<string, unknown> = {};

      if (role && Object.values(Role).includes(role as Role)) {
        where.role = role;
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            avatarUrl: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: { blogPosts: true },
            },
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count({ where }),
      ]);

      res.json({
        data: users,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('List users error:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }
);

/**
 * PUT /users/:id/role
 * Update a user's role (admin only)
 */
router.put(
  '/:id/role',
  requireAuth,
  requireRole(['ADMIN']),
  async (req: Request, res: Response) => {
    try {
      const { role } = req.body;

      if (!role || !Object.values(Role).includes(role as Role)) {
        res.status(400).json({ error: 'Invalid role. Must be one of: ADMIN, VENDOR, EDITOR, USER' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: req.params.id },
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Prevent demoting yourself
      if (user.id === req.user!.id && role !== 'ADMIN') {
        res.status(400).json({ error: 'You cannot change your own role' });
        return;
      }

      const updated = await prisma.user.update({
        where: { id: req.params.id },
        data: { role: role as Role },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatarUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      res.json({ data: updated });
    } catch (error) {
      console.error('Update user role error:', error);
      res.status(500).json({ error: 'Failed to update user role' });
    }
  }
);

export default router;
