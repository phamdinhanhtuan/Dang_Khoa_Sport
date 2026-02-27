#!/bin/bash

# Define Project Path
PROJECT_PATH="/Users/tuan/Downloads/DOCUMENT/Đăng Khoa Sport "

echo "=================================================="
echo "🛠️  FIXING & STARTING DANG KHOA SPORT (UNIFIED)"
echo "=================================================="

# Kill any existing node processes on port 3000 or 3100 to avoid conflicts
echo "🧹 Cleaning up old processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:3100 | xargs kill -9 2>/dev/null

# Start the Main Server (Contains both Shop & Admin Site)
echo "🚀 Starting Server (Port 3000)..."
# Using osascript to open a new terminal tab and run the server so it stays alive
osascript -e "tell application \"Terminal\" to do script \"cd \\\"$PROJECT_PATH\\\" && npm start\""

echo "⏳ Waiting 8 seconds for server to initialize..."
sleep 8

# Open the Correct URLs
echo "🌍 Opening Admin & Shop pages..."
# Shop Page
open "http://localhost:3000"
# Admin Page (Integrated, Fixed Version)
open "http://localhost:3000/admin/login"

echo "=================================================="
echo "✅ SYSTEM READY!"
echo "👉 Admin Account: admin@gmail.com | 123456"
echo "👉 Shop:  http://localhost:3000"
echo "👉 Admin: http://localhost:3000/admin/login"
echo "=================================================="
