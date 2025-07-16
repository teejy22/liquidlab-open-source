#!/bin/bash

echo "LiquidLab Open Source Repository Setup"
echo "======================================"
echo ""
echo "This script will help you push the open source components to GitHub."
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "Initializing git repository..."
    git init
fi

# Add all files
echo "Adding files to git..."
git add .

# Create initial commit
echo "Creating initial commit..."
git commit -m "Initial commit: LiquidLab open source security components"

# Instructions for user
echo ""
echo "Repository is ready! To push to GitHub:"
echo ""
echo "1. Create a new repository on GitHub (https://github.com/new)"
echo "   - Name: liquidlab-open-source"
echo "   - Description: Open source security components from LiquidLab trading platform"
echo "   - Public repository (recommended)"
echo "   - Don't initialize with README (we already have one)"
echo ""
echo "2. Add the GitHub remote:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/liquidlab-open-source.git"
echo ""
echo "3. Push to GitHub:"
echo "   git push -u origin main"
echo ""
echo "That's it! Your open source components will be available for the community to review."