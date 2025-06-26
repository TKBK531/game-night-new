# PostgreSQL Database Setup Guide

## Prerequisites

1. **Install PostgreSQL**
   - Download from: https://www.postgresql.org/download/
   - Or use Docker: `docker run --name postgres -e POSTGRES_PASSWORD=yourpassword -p 5432:5432 -d postgres`

## Database Setup Steps

### 1. Create Database
Connect to PostgreSQL and create a database:
```sql
CREATE DATABASE procurementpro;
```

### 2. Create User (Optional but recommended)
```sql
CREATE USER procurementpro_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE procurementpro TO procurementpro_user;
```

### 3. Update Environment Variables
Edit your `.env` file with your actual database credentials:

```env
# Replace with your actual credentials
DATABASE_URL=postgresql://procurementpro_user:your_secure_password@localhost:5432/procurementpro

# Or if using default postgres user:
# DATABASE_URL=postgresql://postgres:your_postgres_password@localhost:5432/procurementpro

NODE_ENV=development
PORT=3000
```

### 4. Push Database Schema
After setting up the database and updating the `.env` file, run:
```bash
npm run db:push
```

This will create the necessary tables in your PostgreSQL database.

### 5. Start the Development Server
```bash
npm run dev
```

## Alternative: Using Docker

If you prefer to use Docker for development:

1. Create a `docker-compose.yml` file:
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: procurementpro
      POSTGRES_USER: procurementpro_user
      POSTGRES_PASSWORD: your_secure_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

2. Run: `docker-compose up -d`

3. Update your `.env` file:
```env
DATABASE_URL=postgresql://procurementpro_user:your_secure_password@localhost:5432/procurementpro
```

## Troubleshooting

- **Connection failed**: Check that PostgreSQL is running and credentials are correct
- **Database doesn't exist**: Make sure you created the database as shown in step 1
- **Permission denied**: Ensure the user has proper privileges on the database
- **Port conflicts**: Make sure port 5432 is not being used by another service
