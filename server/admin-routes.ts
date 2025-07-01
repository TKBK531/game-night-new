import express from 'express';
import { storage } from './mongo-storage';
import { loginUserSchema, insertUserSchema } from '../shared/mongo-validation';
import { z } from 'zod';

const adminRouter = express.Router();

// Middleware to check if user is authenticated
const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    next();
};

// Middleware to check if user has required role
const requireRole = (roles: string[]) => {
    return (req: any, res: any, next: any) => {
        if (!req.session.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        if (!roles.includes(req.session.user.role)) {
            return res.status(403).json({ message: 'Insufficient permissions' });
        }

        next();
    };
};

// Login
adminRouter.post('/login', async (req: any, res: any) => {
    try {
        const validatedData = loginUserSchema.parse(req.body);

        const user = await storage.authenticateUser(validatedData);

        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        if (!user.isActive) {
            return res.status(401).json({ message: 'Account is deactivated' });
        }

        // Update last login
        await storage.updateLastLogin(user._id);

        // Store user in session (exclude password)
        req.session.user = {
            id: user._id,
            username: user.username,
            role: user.role
        };

        res.json({
            user: {
                id: user._id,
                username: user.username,
                role: user.role
            }
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: error.errors
            });
        }

        console.error('Login error:', error);
        res.status(500).json({ message: 'Login failed' });
    }
});

// Logout
adminRouter.post('/logout', (req: any, res: any) => {
    req.session.destroy((err: any) => {
        if (err) {
            return res.status(500).json({ message: 'Logout failed' });
        }
        res.json({ message: 'Logged out successfully' });
    });
});

// Get current user
adminRouter.get('/me', requireAuth, (req: any, res: any) => {
    res.json({ user: req.session.user });
});

// Get all users (superuser and elite_board only)
adminRouter.get('/users', requireAuth, requireRole(['superuser', 'elite_board']), async (req: any, res: any) => {
    try {
        const users = await storage.getAllUsers();
        // Remove passwords from response
        const safeUsers = users.map(user => ({
            id: user._id,
            username: user.username,
            role: user.role,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
            isActive: user.isActive
        }));

        res.json(safeUsers);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
});

// Create new user (superuser only)
adminRouter.post('/users', requireAuth, requireRole(['superuser']), async (req: any, res: any) => {
    try {
        const validatedData = insertUserSchema.parse(req.body);

        // Check if username already exists
        const existingUser = await storage.getUserByUsername(validatedData.username);
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const newUser = await storage.createUser(validatedData);

        res.status(201).json({
            user: {
                id: newUser._id,
                username: newUser.username,
                role: newUser.role,
                createdAt: newUser.createdAt,
                isActive: newUser.isActive
            }
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: error.errors
            });
        }

        console.error('Create user error:', error);
        res.status(500).json({ message: 'Failed to create user' });
    }
});

// Update user (superuser only)
adminRouter.put('/users/:id', requireAuth, requireRole(['superuser']), async (req: any, res: any) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Don't allow updating password through this endpoint
        delete updates.password;

        const updatedUser = await storage.updateUser(id, updates);

        res.json({
            user: {
                id: updatedUser._id,
                username: updatedUser.username,
                role: updatedUser.role,
                createdAt: updatedUser.createdAt,
                lastLogin: updatedUser.lastLogin,
                isActive: updatedUser.isActive
            }
        });

    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ message: 'Failed to update user' });
    }
});

// Delete user (superuser only)
adminRouter.delete('/users/:id', requireAuth, requireRole(['superuser']), async (req: any, res: any) => {
    try {
        const { id } = req.params;

        // Don't allow deleting self
        if (id === req.session.user.id) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        await storage.deleteUser(id);
        res.json({ message: 'User deleted successfully' });

    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Failed to delete user' });
    }
});

// Get all teams
adminRouter.get('/teams', requireAuth, async (req: any, res: any) => {
    try {
        const teams = await storage.getAllTeams();
        res.json(teams);
    } catch (error) {
        console.error('Get teams error:', error);
        res.status(500).json({ message: 'Failed to fetch teams' });
    }
});

// Delete team (superuser and elite_board only)
adminRouter.delete('/teams/:id', requireAuth, requireRole(['superuser', 'elite_board']), async (req: any, res: any) => {
    try {
        const { id } = req.params;
        await storage.deleteTeam(id);
        res.json({ message: 'Team deleted successfully' });
    } catch (error) {
        console.error('Delete team error:', error);
        res.status(500).json({ message: 'Failed to delete team' });
    }
});

// Get all scores
adminRouter.get('/scores', requireAuth, async (req: any, res: any) => {
    try {
        const scores = await storage.getAllScores();
        res.json(scores);
    } catch (error) {
        console.error('Get scores error:', error);
        res.status(500).json({ message: 'Failed to fetch scores' });
    }
});

// Delete score (all authenticated users can delete scores)
adminRouter.delete('/scores/:id', requireAuth, async (req: any, res: any) => {
    try {
        const { id } = req.params;
        await storage.deleteGameScore(id);
        res.json({ message: 'Score deleted successfully' });
    } catch (error) {
        console.error('Delete score error:', error);
        res.status(500).json({ message: 'Failed to delete score' });
    }
});

export default adminRouter;
