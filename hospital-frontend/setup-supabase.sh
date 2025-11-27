#!/bin/bash
# Quick setup script for Supabase integration

echo "🚀 Hospital Asset Trading Platform - Supabase Setup"
echo "=================================================="
echo ""

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo "✓ .env.local found with Supabase credentials"
else
    echo "✗ .env.local not found"
    exit 1
fi

# Check if dependencies installed
if [ -d "node_modules/@supabase" ]; then
    echo "✓ Supabase package installed"
else
    echo "⚠ Installing Supabase package..."
    npm install @supabase/supabase-js --save
fi

echo ""
echo "📋 Database Setup Steps:"
echo "========================"
echo ""
echo "1. Open Supabase Dashboard:"
echo "   https://app.supabase.com/projects"
echo ""
echo "2. Go to SQL Editor"
echo ""
echo "3. Create a new query and paste contents of:"
echo "   sql/schema.sql"
echo ""
echo "4. Click 'Run' to create all tables"
echo ""
echo "5. Test connection:"
echo "   curl http://localhost:3000/api/db/health"
echo ""
echo "6. Run integration tests:"
echo "   curl http://localhost:3000/api/db/test"
echo ""
echo "✅ Setup Complete!"
echo ""
echo "📚 Documentation:"
echo "  - DATABASE_SETUP.md (complete guide)"
echo "  - SUPABASE_QUICK_SETUP.md (quick reference)"
echo "  - SUPABASE_INTEGRATION_COMPLETE.md (overview)"
echo ""
