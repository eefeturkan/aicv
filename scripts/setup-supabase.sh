#!/bin/bash

# Supabase Setup Script
# This script creates all necessary tables, RLS policies, and triggers

echo "🚀 Setting up Supabase database..."

# Load environment variables
source .env.local

# Run migration using psql
psql "$NEXT_PUBLIC_SUPABASE_URL" -f supabase/migrations/20250126000000_initial_schema.sql

echo "✅ Database setup complete!"
echo ""
echo "Tables created:"
echo "  - users"
echo "  - cv_analyses"
echo "  - analysis_results"
echo "  - user_credits"
echo ""
echo "Next steps:"
echo "  1. Test authentication"
echo "  2. Create a test user"
echo "  3. Upload a test CV"
