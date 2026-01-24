#!/bin/bash

# SSLG Voting System - Quick Setup Script
# This script helps you set up the development environment

echo "🗳️  SSLG Voting System - Quick Setup"
echo "======================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the sslgvoting directory"
    exit 1
fi

# Check Node.js version
echo "📦 Checking Node.js version..."
node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$node_version" -lt 18 ]; then
    echo "❌ Error: Node.js 18+ is required. You have version $(node -v)"
    exit 1
fi
echo "✅ Node.js version: $(node -v)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚙️  Setting up environment variables..."
    if [ -f ".env.local.example" ]; then
        cp .env.local.example .env.local
        echo "✅ Created .env.local from example"
        echo "⚠️  IMPORTANT: Edit .env.local with your Supabase credentials!"
        echo ""
    else
        echo "❌ Error: .env.local.example not found"
        exit 1
    fi
else
    echo "✅ .env.local already exists"
    echo ""
fi

# Check if Supabase credentials are configured
if grep -q "your-project-url" .env.local; then
    echo "⚠️  WARNING: Supabase credentials not configured!"
    echo "   Please edit .env.local with your actual Supabase URL and key"
    echo ""
fi

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your Supabase credentials"
echo "2. Run the database schema (supabase-schema.sql) in Supabase SQL Editor"
echo "3. Create your first admin user in Supabase"
echo "4. Run: npm run dev"
echo "5. Visit: http://localhost:3000"
echo ""
echo "For detailed instructions, see SETUP.md"
echo ""
