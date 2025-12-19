#!/bin/bash

# Quick Start Script for VF-TryOn App
# This script starts both backend and frontend servers

echo "🚀 Starting VF-TryOn Application..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if backend is already running
echo "📡 Checking backend status..."
if curl -s http://localhost:5000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is already running on port 5000${NC}"
else
    echo "⚙️  Starting backend server..."
    cd backend
    node server.js &
    BACKEND_PID=$!
    echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"
    cd ..
fi

echo ""

# Check if frontend is already running
echo "🎨 Checking frontend status..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend is already running on port 3000${NC}"
elif curl -s http://localhost:3001 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend is already running on port 3001${NC}"
else
    echo "⚙️  Starting frontend server..."
    npm start &
    FRONTEND_PID=$!
    echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"
fi

echo ""
echo "✅ VF-TryOn Application is ready!"
echo ""
echo -e "${BLUE}📍 URLs:${NC}"
echo "   • Frontend: http://localhost:3001"
echo "   • Backend:  http://localhost:5000"
echo "   • API Status: http://localhost:3001/api-status"
echo "   • Health Check: http://localhost:5000/health"
echo ""
echo -e "${BLUE}🎯 Quick Links:${NC}"
echo "   • Body Analysis: http://localhost:3001/ai/body-analysis"
echo "   • Outfit Recommendations: http://localhost:3001/ai/outfit-recommendations"
echo "   • Admin Dashboard: http://localhost:3001/admin"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for user interrupt
wait
