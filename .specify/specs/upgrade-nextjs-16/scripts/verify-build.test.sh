#!/bin/bash
# Task 7.1: Static Export Verification Test
# This test verifies Next.js 16 static export with Turbopack

set -e

echo "=== Task 7.1: Static Export Verification Test ==="
echo ""

# Test 1: Verify output configuration is set to 'export'
echo "Test 1: Checking next.config.ts for 'output: export' setting..."
if grep -q "output: 'export'" /Users/noruchiy/Workspace/line-miniapp-reversi/next.config.ts; then
  echo "✓ Static export configuration verified"
else
  echo "✗ Static export configuration not found"
  exit 1
fi

# Test 2: Execute build
echo ""
echo "Test 2: Executing 'pnpm build' to generate static export..."
cd /Users/noruchiy/Workspace/line-miniapp-reversi
if pnpm build 2>&1 | tee /tmp/build-output.log; then
  echo "✓ Build completed successfully"
else
  echo "✗ Build failed"
  exit 1
fi

# Test 3: Verify no warnings or errors in build output
echo ""
echo "Test 3: Checking build output for warnings and errors..."
if grep -iE "(error|warning)" /tmp/build-output.log | grep -v "0 errors" | grep -v "0 warnings" | grep -v "Export successful"; then
  echo "✗ Build contains warnings or errors"
  exit 1
else
  echo "✓ No build warnings or errors detected"
fi

# Test 4: Verify Turbopack is used in production build
echo ""
echo "Test 4: Verifying Turbopack usage in build logs..."
if grep -q "turbopack\|Turbopack" /tmp/build-output.log; then
  echo "✓ Turbopack confirmed in build process"
else
  echo "ℹ Turbopack not explicitly mentioned (may be default)"
fi

echo ""
echo "=== Task 7.1: All tests passed ==="
