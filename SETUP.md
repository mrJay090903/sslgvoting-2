# SSLG Voting System - Setup Guide

## Overview
A secure Web-Based Voting System for High School Student Government elections built with Next.js, Supabase, and Tailwind CSS.

## Prerequisites
- Node.js 18+ installed
- A Supabase account
- Vercel account (for deployment)

## Step 1: Supabase Setup

### 1.1 Create a New Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key

### 1.2 Run Database Schema
1. In your Supabase dashboard, go to the SQL Editor
2. Copy the contents of `supabase-schema.sql` from the project root
3. Paste and execute the SQL script
4. This will create all tables, RLS policies, and functions

### 1.3 Create Your First Admin User
1. In Supabase Dashboard, go to Authentication > Users
2. Click "Add User" and create a user with email and password
3. Copy the UUID of the created user
4. Go to SQL Editor and run:
```sql
INSERT INTO public.users (id, email, username, role)
VALUES ('YOUR-UUID-HERE', 'admin@school.com', 'admin', 'admin');
```

## Step 2: Local Development Setup

### 2.1 Clone and Install Dependencies
```bash
cd sslgvoting
npm install
```

### 2.2 Configure Environment Variables
1. Copy `.env.local.example` to `.env.local`:
```bash
cp .env.local.example .env.local
```

2. Update `.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_APP_NAME=SSLG Voting System
NEXT_PUBLIC_SCHOOL_NAME=Your High School Name
```

### 2.3 Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application.

## Step 3: Add Sample Data (Optional)

### 3.1 Add Sample Students
Go to the Admin Dashboard > Students and add some test students with Student IDs like:
- 2024-001
- 2024-002
- 2024-003

### 3.2 Create Partylists
Go to Admin Dashboard > Partylists and create:
- United Student Alliance (USA) - Blue
- Student Empowerment Party (SEP) - Red
- Independent - Gray

### 3.3 Add Candidates
Go to Admin Dashboard > Candidates and assign students to positions

### 3.4 Create and Open an Election
Go to Admin Dashboard > Elections:
1. Create a new election
2. Set start and end dates
3. Click "Open" to make it active

## Step 4: Vercel Deployment

### 4.1 Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-repo-url
git push -u origin main
```

### 4.2 Deploy to Vercel
1. Go to [https://vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - Framework Preset: Next.js
   - Root Directory: `sslgvoting`
   - Add environment variables from `.env.local`
5. Click "Deploy"

### 4.3 Update Supabase URL Settings
In Supabase Dashboard > Settings > API:
- Add your Vercel deployment URL to "Site URL"
- Add your Vercel URL to "Redirect URLs"

## User Roles and Access

### Admin
- **Login:** Username + Password at `/auth/login?role=admin`
- **Access:** Full system access including:
  - Dashboard with statistics
  - Student management
  - Candidate management
  - Partylist management
  - Election management (create, open, close)
  - View results

### Teacher
- **Login:** Username + Password at `/auth/login?role=teacher`
- **Access:** Read-only access to:
  - Dashboard
  - View election results
  - Monitor voting progress

### Student
- **Login:** Student ID only at `/auth/student-login`
- **Access:**
  - Vote in open elections
  - One vote per election
  - Cannot view results

## Security Features

1. **Row-Level Security (RLS):** All database tables are protected with RLS policies
2. **Authentication:** Admin/Teacher use Supabase Auth, Students use ID verification
3. **Vote Integrity:** 
   - Votes cannot be updated or deleted
   - Duplicate voting prevention
   - One active election at a time
4. **Middleware Protection:** Routes are protected based on user roles

## Database Structure

### Main Tables
- `users` - Admin and Teacher accounts
- `students` - Student records
- `partylists` - Political parties
- `positions` - Election positions (President, Vice President, etc.)
- `candidates` - Candidates running for positions
- `elections` - Election management
- `votes` - Cast votes (secret ballot)
- `voting_sessions` - Track who has voted

## Troubleshooting

### Issue: Cannot login as admin
- Verify the user exists in both `auth.users` and `public.users` tables
- Check that the role is set to 'admin' in `public.users`

### Issue: Student cannot vote
- Ensure an election is in "open" status
- Verify the student's `is_active` flag is true
- Check that student hasn't already voted

### Issue: RLS policy errors
- Ensure you ran the complete schema SQL script
- Check that policies are enabled on all tables
- Verify your Supabase project has proper permissions

## Support

For issues and questions:
1. Check the database schema in `supabase-schema.sql`
2. Review the RLS policies
3. Check browser console for errors
4. Review Supabase logs in the dashboard

## License
This project is for educational purposes.
