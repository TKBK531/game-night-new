import express from 'express';
import { storage } from './mongo-storage';
import { loginUserSchema, insertUserSchema } from '../shared/mongo-validation';
import { z } from 'zod';
import * as XLSX from 'xlsx';

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
        // Serialize ObjectIds to strings for frontend compatibility
        const serializedTeams = teams.map(team => ({
            ...team.toObject(),
            _id: team._id.toString(),
            bankSlipFileId: team.bankSlipFileId ? team.bankSlipFileId.toString() : undefined
        }));
        res.json(serializedTeams);
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

// Get all secret challenges
adminRouter.get('/secret-challenges', requireAuth, async (req: any, res: any) => {
    try {
        const challenges = await storage.getSecretLeaderboard(50); // Get top 50
        res.json(challenges);
    } catch (error) {
        console.error('Get secret challenges error:', error);
        res.status(500).json({ message: 'Failed to fetch secret challenges' });
    }
});

// COD Queue Management (all authenticated users can view, but only certain roles can approve)
adminRouter.get('/cod-queue', requireAuth, async (req: any, res: any) => {
    try {
        const queuedTeams = await storage.getQueuedTeams('cod');
        res.json(queuedTeams);
    } catch (error) {
        console.error('Error fetching COD queue:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

adminRouter.post('/approve-team/:teamId', requireRole(['superuser', 'elite_board']), async (req: any, res: any) => {
    try {
        const { teamId } = req.params;
        const { approvedBy } = req.body;
        
        const team = await storage.approveTeamForPayment(teamId, approvedBy);
        res.json(team);
    } catch (error) {
        console.error('Error approving team:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

adminRouter.post('/reject-team/:teamId', requireRole(['superuser', 'elite_board']), async (req: any, res: any) => {
    try {
        const { teamId } = req.params;
        await storage.rejectTeam(teamId);
        res.json({ message: 'Team rejected successfully' });
    } catch (error) {
        console.error('Error rejecting team:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Migration endpoint for updating existing teams
adminRouter.post('/migrate-teams', requireRole(['superuser']), async (req: any, res: any) => {
    try {
        await storage.migrateExistingTeams();
        res.json({ message: 'Teams migrated successfully' });
    } catch (error) {
        console.error('Error migrating teams:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Excel export endpoint
adminRouter.get('/export-teams', requireAuth, async (req: any, res: any) => {
    try {
        console.log('Excel export request received');
        
        // Get all teams with full details
        console.log('Fetching teams from storage...');
        const teams = await storage.getAllTeams();
        console.log(`Found ${teams.length} teams`);
        
        // Format data for Excel
        console.log('Formatting data for Excel...');
        const excelData = teams.map((team, index) => ({
            'S.No': index + 1,
            'Team Name': team.teamName,
            'Game': team.game.toUpperCase(),
            'Status': team.status || 'confirmed',
            'Captain Email': team.captainEmail,
            'Captain Phone': team.captainPhone,
            'Player 1 Name': team.player1Name,
            'Player 1 Gaming ID': team.player1GamingId,
            'Player 1 University Email': team.player1UniversityEmail,
            'Player 1 Valorant ID': team.player1ValorantId || 'N/A',
            'Player 2 Name': team.player2Name,
            'Player 2 Gaming ID': team.player2GamingId,
            'Player 2 University Email': team.player2UniversityEmail,
            'Player 2 Valorant ID': team.player2ValorantId || 'N/A',
            'Player 3 Name': team.player3Name,
            'Player 3 Gaming ID': team.player3GamingId,
            'Player 3 University Email': team.player3UniversityEmail,
            'Player 3 Valorant ID': team.player3ValorantId || 'N/A',
            'Player 4 Name': team.player4Name,
            'Player 4 Gaming ID': team.player4GamingId,
            'Player 4 University Email': team.player4UniversityEmail,
            'Player 4 Valorant ID': team.player4ValorantId || 'N/A',
            'Player 5 Name': team.player5Name,
            'Player 5 Gaming ID': team.player5GamingId,
            'Player 5 University Email': team.player5UniversityEmail,
            'Player 5 Valorant ID': team.player5ValorantId || 'N/A',
            'Bank Slip Uploaded': team.bankSlipFileId ? 'Yes' : 'No',
            'Registration Date': new Date(team.registeredAt).toLocaleDateString(),
            'Approved By': team.approvedBy || 'N/A',
            'Approved Date': team.approvedAt ? new Date(team.approvedAt).toLocaleDateString() : 'N/A',
            'Queued Date': team.queuedAt ? new Date(team.queuedAt).toLocaleDateString() : 'N/A'
        }));
        console.log(`Formatted ${excelData.length} rows for Excel`);
        
        // Create workbook and worksheet
        console.log('Creating workbook...');
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        console.log('Worksheet created');
        
        // Auto-size columns
        const columnWidths = [
            { wch: 5 },   // S.No
            { wch: 20 },  // Team Name
            { wch: 10 },  // Game
            { wch: 12 },  // Status
            { wch: 25 },  // Captain Email
            { wch: 15 },  // Captain Phone
            { wch: 20 },  // Player names
            { wch: 20 },  // Gaming IDs
            { wch: 30 },  // University emails
            { wch: 20 },  // Valorant IDs
            { wch: 20 },  // Player names
            { wch: 20 },  // Gaming IDs
            { wch: 30 },  // University emails
            { wch: 20 },  // Valorant IDs
            { wch: 20 },  // Player names
            { wch: 20 },  // Gaming IDs
            { wch: 30 },  // University emails
            { wch: 20 },  // Valorant IDs
            { wch: 20 },  // Player names
            { wch: 20 },  // Gaming IDs
            { wch: 30 },  // University emails
            { wch: 20 },  // Valorant IDs
            { wch: 20 },  // Player names
            { wch: 20 },  // Gaming IDs
            { wch: 30 },  // University emails
            { wch: 20 },  // Valorant IDs
            { wch: 15 },  // Bank Slip
            { wch: 15 },  // Registration Date
            { wch: 15 },  // Approved By
            { wch: 15 },  // Approved Date
            { wch: 15 }   // Queued Date
        ];
        worksheet['!cols'] = columnWidths;
        console.log('Column widths set');
        
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Teams');
        console.log('Worksheet appended to workbook');
        
        // Generate Excel file buffer
        console.log('Generating Excel buffer...');
        const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        console.log(`Excel buffer generated, size: ${excelBuffer.length} bytes`);
        
        // Set response headers
        const fileName = `game-night-teams-${new Date().toISOString().split('T')[0]}.xlsx`;
        console.log(`Setting response headers, filename: ${fileName}`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Length', excelBuffer.length);
        
        // Send file
        console.log('Sending file...');
        res.send(excelBuffer);
        console.log('File sent successfully');
    } catch (error) {
        console.error('Error exporting teams:', error);
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        res.status(500).json({ 
            message: 'Failed to export teams', 
            error: error instanceof Error ? error.message : 'Unknown error' 
        });
    }
});

// Excel export endpoint for COD queue only
adminRouter.get('/export-cod-queue', requireAuth, async (req: any, res: any) => {
    try {
        console.log('COD queue export request received');
        
        // Get COD queued teams only
        console.log('Fetching COD queued teams from storage...');
        const queuedTeams = await storage.getQueuedTeams('cod');
        console.log(`Found ${queuedTeams.length} COD queued teams`);
        
        // Format data for Excel
        const excelData = queuedTeams.map((team, index) => ({
            'S.No': index + 1,
            'Team Name': team.teamName,
            'Status': team.status,
            'Captain Email': team.captainEmail,
            'Captain Phone': team.captainPhone,
            'Player 1 Name': team.player1Name,
            'Player 1 Gaming ID': team.player1GamingId,
            'Player 1 University Email': team.player1UniversityEmail,
            'Player 2 Name': team.player2Name,
            'Player 2 Gaming ID': team.player2GamingId,
            'Player 2 University Email': team.player2UniversityEmail,
            'Player 3 Name': team.player3Name,
            'Player 3 Gaming ID': team.player3GamingId,
            'Player 3 University Email': team.player3UniversityEmail,
            'Player 4 Name': team.player4Name,
            'Player 4 Gaming ID': team.player4GamingId,
            'Player 4 University Email': team.player4UniversityEmail,
            'Player 5 Name': team.player5Name,
            'Player 5 Gaming ID': team.player5GamingId,
            'Player 5 University Email': team.player5UniversityEmail,
            'Registration Date': new Date(team.registeredAt).toLocaleDateString(),
            'Queued Date': team.queuedAt ? new Date(team.queuedAt).toLocaleDateString() : 'N/A'
        }));
        
        // Create workbook and worksheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        
        // Auto-size columns
        const columnWidths = [
            { wch: 5 },   // S.No
            { wch: 20 },  // Team Name
            { wch: 12 },  // Status
            { wch: 25 },  // Captain Email
            { wch: 15 },  // Captain Phone
            { wch: 20 },  // Player names and details
            { wch: 20 },
            { wch: 30 },
            { wch: 20 },
            { wch: 20 },
            { wch: 30 },
            { wch: 20 },
            { wch: 20 },
            { wch: 30 },
            { wch: 20 },
            { wch: 20 },
            { wch: 30 },
            { wch: 20 },
            { wch: 20 },
            { wch: 30 },
            { wch: 15 },  // Registration Date
            { wch: 15 }   // Queued Date
        ];
        worksheet['!cols'] = columnWidths;
        
        XLSX.utils.book_append_sheet(workbook, worksheet, 'COD Queue');
        
        // Generate Excel file buffer
        const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        
        // Set response headers
        const fileName = `cod-queue-${new Date().toISOString().split('T')[0]}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Length', excelBuffer.length);
        
        // Send file
        res.send(excelBuffer);
        console.log('COD queue export completed successfully');
    } catch (error) {
        console.error('Error exporting COD queue:', error);
        res.status(500).json({ message: 'Failed to export COD queue' });
    }
});

export default adminRouter;
