# Admin Dashboard Setup & Usage Guide

## Overview

The admin dashboard provides role-based access control for managing Game Night tournament data. The system supports three user roles with different permission levels.

## User Roles & Permissions

### 1. Superuser (Full Access)
- **Username:** TKBK531
- **Password:** Kasthuri@1971
- **Permissions:**
  - Create, edit, and delete admin users
  - View, edit, and delete team registrations
  - View, edit, and delete game scores
  - Full system administration

### 2. Elite Board (Limited Admin)
- **Permissions:**
  - View admin users (cannot create/edit/delete)
  - View, edit, and delete team registrations
  - View, edit, and delete game scores
  - Cannot manage user accounts

### 3. Top Board (Read-Only Teams, Edit Scores)
- **Permissions:**
  - View team registrations (cannot edit/delete)
  - View, edit, and delete game scores
  - Cannot manage user accounts

## Initial Setup

### 1. Superuser Initialization
The superuser account is automatically created when you start the server for the first time.

**Manual initialization (if needed):**
```bash
npm run init:superuser
```

### 2. Access the Dashboard
1. Navigate to: `http://localhost:5000/admin`
2. Login with superuser credentials:
   - Username: `TKBK531`
   - Password: `Kasthuri@1971`

## Creating Additional Admin Users

Only the superuser can create additional admin accounts:

1. Login as superuser
2. Go to the "Users" tab
3. Click "Add User"
4. Select appropriate role:
   - **Elite Board:** For administrators who need full data access
   - **Top Board:** For score moderators with limited permissions

## Dashboard Features

### Overview Tab
- Summary statistics
- Total registered teams by game
- Total reaction game scores
- Admin user count

### Teams Tab
- View all registered teams
- Filter by game (Valorant/COD)
- Delete team registrations (Superuser/Elite Board only)
- View team details and bank slip files

### Scores Tab
- View all reaction game scores
- Delete inappropriate scores (All roles)
- Sort by score/date
- Leaderboard management

### Users Tab (Superuser/Elite Board only)
- View all admin users
- Create new admin accounts (Superuser only)
- Delete admin accounts (Superuser only)
- Manage user roles and permissions

## Security Features

- **Session-based authentication**
- **Role-based access control (RBAC)**
- **Password hashing with bcrypt**
- **CSRF protection**
- **Secure session cookies**

## API Endpoints

### Authentication
- `POST /api/admin/login` - User login
- `POST /api/admin/logout` - User logout
- `GET /api/admin/me` - Get current user

### User Management (Superuser only)
- `GET /api/admin/users` - List all users
- `POST /api/admin/users` - Create new user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user

### Team Management
- `GET /api/admin/teams` - List all teams
- `DELETE /api/admin/teams/:id` - Delete team (Superuser/Elite Board)

### Score Management
- `GET /api/admin/scores` - List all scores
- `DELETE /api/admin/scores/:id` - Delete score (All roles)

## Environment Variables

Add to your `.env` file:
```env
SESSION_SECRET=your-secure-session-secret-key
```

## Database Schema

### Users Collection
```javascript
{
  username: String,
  password: String, // bcrypt hashed
  role: Enum['superuser', 'elite_board', 'top_board'],
  createdAt: Date,
  lastLogin: Date,
  isActive: Boolean
}
```

## Troubleshooting

### Cannot Login
1. Verify superuser account exists:
   ```bash
   npm run init:superuser
   ```
2. Check MongoDB connection
3. Verify session configuration

### Permission Denied
- Check user role permissions
- Ensure user account is active
- Verify session hasn't expired

### Database Connection Issues
- Verify `MONGODB_URI` in `.env`
- Check MongoDB Atlas access
- Ensure network connectivity

## Security Best Practices

1. **Change Default Password:** Change the superuser password after initial setup
2. **Use Strong Passwords:** Enforce strong passwords for all admin accounts
3. **Regular Audits:** Monitor admin activity logs
4. **Principle of Least Privilege:** Assign minimum required permissions
5. **Session Management:** Configure appropriate session timeouts

## Backup & Recovery

- **Database Backup:** Regular MongoDB backups
- **User Account Recovery:** Superuser can recreate accounts
- **Emergency Access:** Use `npm run init:superuser` to reset superuser account

## Support

For technical support or questions about the admin system, contact the development team.
