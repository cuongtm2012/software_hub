#!/bin/bash

# Fix ESM imports by adding .js extensions
# This script adds .js to all relative imports in TypeScript files

echo "🔧 Fixing ESM imports in server files..."

# Find all .ts files in server directory
find server -name "*.ts" -type f | while read file; do
    echo "Processing: $file"
    
    # Add .js to imports from "./something" -> "./something.js"
    # But skip if already has extension or is from node_modules/@
    sed -i.bak -E \
        -e 's/from ['\''"](\.\.[\/]|\.[\/])([^'\''"]+)['\''"]/from "\1\2.js"/g' \
        -e 's/\.ts\.js/.ts.js/g' \
        -e 's/\.js\.js/.js/g' \
        "$file"
    
    # Remove backup
    rm -f "${file}.bak"
done

echo "✅ Fixed all server imports!"
echo ""
echo "Note: This adds .js to relative imports like:"
echo "  from './routes' -> from './routes.js'"
echo "  from '../db' -> from '../db.js'"
