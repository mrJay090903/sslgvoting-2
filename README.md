# SSLG Voting System

A secure, web-based voting system for High School Student Government elections built with Next.js, Supabase, and Tailwind CSS.

## Features

### Multi-Role System
- **Admin**: Full system management including students, candidates, partylists, and elections
- **Teacher**: Read-only access to monitor election progress and view statistics
- **Student**: Vote in active elections using Student ID (no password required)

### Security Features
- Row-Level Security (RLS) policies on all database tables
- Secure authentication via Supabase Auth for Admin/Teacher
- Student ID-based verification for student voting
- Duplicate vote prevention
- Secret ballot system (votes are anonymous)
- One active election at a time enforcement

### Admin Dashboard
- Real-time election statistics
- Student management (CRUD operations)
- Candidate management with partylist assignment
- Partylist management with color coding
- Election management (create, open, close)
- Voting progress monitoring

### Voting System
- Clean, intuitive voting interface
- Position-based voting
- Candidate information display with party affiliation
- Real-time vote validation
- Confirmation before submission
- Success confirmation page

## Tech Stack

- **Frontend**: Next.js 15 (React 19)
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Charts**: Chart.js (ready for implementation)
- **Icons**: Lucide React
- **Deployment**: Vercel

## Project Structure

```
sslgvoting/
├── app/
│   ├── admin/
│   │   ├── dashboard/
│   │   ├── students/
│   │   ├── candidates/
│   │   ├── partylists/
│   │   ├── elections/
│   │   └── layout.tsx
│   ├── auth/
│   │   ├── login/
│   │   └── student-login/
│   ├── teacher/
│   │   └── dashboard/
│   ├── vote/
│   │   ├── [id]/
│   │   └── success/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── ui/
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── database.types.ts
│   └── utils.ts
├── middleware.ts
└── package.json

supabase-schema.sql (Database schema in project root)
```

## Quick Start

### Prerequisites
- Node.js 18+
- A Supabase account
- Vercel account (for deployment)

### Installation

1. **Clone and install dependencies:**
```bash
cd sslgvoting
npm install
```

2. **Set up Supabase:**
   - Create a new Supabase project
   - Run the SQL schema from `supabase-schema.sql` in the SQL Editor
   - Create your first admin user (see SETUP.md)

3. **Configure environment variables:**
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. **Run development server:**
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Database Schema

The system uses the following main tables:

- **users** - Admin and Teacher accounts (linked to Supabase Auth)
- **students** - Student records with Student IDs
- **partylists** - Political parties/groups
- **positions** - Election positions (President, VP, etc.)
- **candidates** - Candidates running for positions
- **elections** - Election management
- **votes** - Cast votes (immutable, secret ballot)
- **voting_sessions** - Track which students have voted

All tables are protected with Row-Level Security (RLS) policies.

## User Guide

### Admin Login
1. Go to homepage
2. Click "Admin"
3. Login with username and password
4. Access all management features

### Teacher Login
1. Go to homepage
2. Click "Teacher"
3. Login with username and password
4. View election statistics (read-only)

### Student Voting
1. Go to homepage
2. Click "Student"
3. Enter Student ID only
4. Vote for each position
5. Submit ballot (cannot be changed)

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Set root directory to `sslgvoting`
4. Add environment variables
5. Deploy

See [SETUP.md](SETUP.md) for detailed deployment instructions.

## Security Best Practices

1. **Admin Creation**: Always create admin users through secure methods
2. **Environment Variables**: Never commit `.env.local` to version control
3. **RLS Policies**: All database policies are enforced at the database level
4. **Student IDs**: Use unique, non-guessable Student ID formats
5. **Election Control**: Only one election can be open at a time

## Voting Rules

1. Only registered students can vote
2. Each student can vote only once per election
3. Voting is only allowed when election status is "open"
4. Votes are immutable (cannot be changed or deleted)
5. All positions must have a selection before submitting
6. Results are only visible to Admin/Teacher

## Features Roadmap

- [ ] Real-time voting results with Chart.js visualizations
- [ ] Email notifications for election events
- [ ] Bulk student import via CSV
- [ ] Candidate photo uploads
- [ ] Election results export (PDF/Excel)
- [ ] Audit log viewer for admins
- [ ] Multi-language support

## Troubleshooting

See [SETUP.md](SETUP.md) for common issues and solutions.

## License

This project is for educational purposes.

## Support

For issues or questions, please check the documentation in SETUP.md or review the database schema.

---

Built with ❤️ for High School Student Government Elections