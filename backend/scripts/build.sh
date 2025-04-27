#!/bin/bash

# Exit on error
set -e

echo "Starting build process..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Run TypeScript compiler
echo "Compiling TypeScript..."
npm run build

# Copy necessary files to dist folder
echo "Copying necessary files..."
cp package.json dist/
cp package-lock.json dist/
cp Procfile dist/
cp .env.example dist/

echo "Build completed successfully!"
