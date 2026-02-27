#!/bin/bash

# Define Project Path
PROJECT_PATH="/Users/tuan/Downloads/DOCUMENT/Đăng Khoa Sport "

echo "=================================================="
echo "🚀 STARTING ĐĂNG KHOA SPORT E-COMMERCE SYSTEM"
echo "=================================================="

# 1. Kill potentially hanging processes
echo "🧹 Cleaning up old processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null

# 2. Start Unified Server (Port 3000)
echo "👉 Launching Store & Admin Portal (Port 3000)..."
osascript -e "tell application \"Terminal\" to do script \"cd \\\"$PROJECT_PATH\\\" && npm start\""

echo "⏳ Waiting 5 seconds for server to boot..."
sleep 5

# 3. Open Browser
echo "🌍 Opening Web Browser..."
open "http://localhost:3000"
open "http://localhost:3000/admin/login"

echo "=================================================="
echo "✅ SYSTEM IS RUNNING!"
echo "   - Shop Frontend: http://localhost:3000"
echo "   - Admin Portal:  http://localhost:3000/admin/login"
echo "   - Credentials:   admin@gmail.com | 123456"
echo "=================================================="

