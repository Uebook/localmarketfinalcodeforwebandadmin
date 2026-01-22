#!/bin/bash
# Clear Metro Bundler Cache Script

echo "🧹 Clearing Metro Bundler cache..."

# Stop any running Metro processes
pkill -f "node.*metro" || true
pkill -f "react-native.*start" || true

# Clear Metro cache
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf /tmp/metro-* 2>/dev/null || true
rm -rf /tmp/haste-map-* 2>/dev/null || true

# Clear watchman cache (if installed)
watchman watch-del-all 2>/dev/null || true

# Clear React Native cache
rm -rf $TMPDIR/react-* 2>/dev/null || true
rm -rf $TMPDIR/metro-* 2>/dev/null || true

echo "✅ Cache cleared!"
echo ""
echo "Now run: npm start -- --reset-cache"
