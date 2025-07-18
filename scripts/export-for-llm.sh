#!/bin/bash

# Export codebase to a single markdown file for LLM review
OUTPUT_FILE="liquidlab-codebase-for-llm.md"

# Start with project overview
echo "# LiquidLab Codebase" > $OUTPUT_FILE
echo "" >> $OUTPUT_FILE
echo "## Project Overview" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE
cat replit.md >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE
echo "---" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE

# Function to add file content
add_file() {
    local file=$1
    local lang=$2
    
    echo "## File: $file" >> $OUTPUT_FILE
    echo "" >> $OUTPUT_FILE
    echo '```'$lang >> $OUTPUT_FILE
    cat "$file" >> $OUTPUT_FILE
    echo "" >> $OUTPUT_FILE
    echo '```' >> $OUTPUT_FILE
    echo "" >> $OUTPUT_FILE
    echo "---" >> $OUTPUT_FILE
    echo "" >> $OUTPUT_FILE
}

# Add configuration files
echo "# Configuration Files" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE
add_file "package.json" "json"
add_file "tsconfig.json" "json"
add_file "vite.config.ts" "typescript"
add_file "drizzle.config.ts" "typescript"
add_file "tailwind.config.ts" "typescript"

# Add database schema
echo "# Database Schema" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE
add_file "shared/schema.ts" "typescript"

# Add server files
echo "# Server Code" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE
for file in $(find server -name "*.ts" -type f | sort); do
    add_file "$file" "typescript"
done

# Add client files
echo "# Client Code" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE
for file in $(find client/src -name "*.tsx" -o -name "*.ts" -type f | sort); do
    if [[ $file == *.tsx ]]; then
        add_file "$file" "tsx"
    else
        add_file "$file" "typescript"
    fi
done

# Add security documentation
echo "# Security Documentation" >> $OUTPUT_FILE
echo "" >> $OUTPUT_FILE
if [ -f "PWA_SECURITY_ANALYSIS.md" ]; then
    add_file "PWA_SECURITY_ANALYSIS.md" "markdown"
fi
if [ -f "PRODUCTION_CHECKLIST.md" ]; then
    add_file "PRODUCTION_CHECKLIST.md" "markdown"
fi

echo "Export complete! File created: $OUTPUT_FILE"
echo "File size: $(du -h $OUTPUT_FILE | cut -f1)"
echo "Total lines: $(wc -l < $OUTPUT_FILE)"