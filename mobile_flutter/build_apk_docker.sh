#!/bin/bash

set -e

echo "=== Flutter APK Docker Build Script ==="
echo "Building Flutter APK using Docker..."

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Build Docker image
echo "Building Docker image..."
docker build -f "$SCRIPT_DIR/Dockerfile.android-build" \
    -t amaw-pyay-flutter-builder:latest \
    "$SCRIPT_DIR"

# Create output directory
mkdir -p "$SCRIPT_DIR/build/app/outputs/flutter-apk"

# Run Docker container and copy APK
echo "Running Docker build..."
docker run --rm \
    -v "$SCRIPT_DIR:/app" \
    amaw-pyay-flutter-builder:latest \
    bash -c "cd /app && flutter build apk --release --target-platform android-arm64"

# Check if APK was created
if [ -f "$SCRIPT_DIR/build/app/outputs/flutter-apk/app-release.apk" ]; then
    echo ""
    echo "=== BUILD SUCCESSFUL ==="
    echo "APK Location: $SCRIPT_DIR/build/app/outputs/flutter-apk/app-release.apk"
    ls -lh "$SCRIPT_DIR/build/app/outputs/flutter-apk/app-release.apk"
    echo ""
    echo "SHA256 Checksum:"
    sha256sum "$SCRIPT_DIR/build/app/outputs/flutter-apk/app-release.apk"
else
    echo ""
    echo "=== BUILD FAILED ==="
    echo "APK not found at expected location"
    echo "Searching for APK files..."
    find "$SCRIPT_DIR/build" -name "*.apk" 2>/dev/null || echo "No APK files found"
    exit 1
fi
