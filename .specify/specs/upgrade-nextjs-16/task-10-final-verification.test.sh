#!/bin/bash
# Task 10: Final Verification Test Script
# This script verifies all success criteria for Next.js 16 upgrade

set -e

echo "=========================================="
echo "Task 10: Final Verification"
echo "=========================================="
echo ""

# Test counters
PASS_COUNT=0
FAIL_COUNT=0
TOTAL_TESTS=10

# Helper function to report test results
report_test() {
    local test_name="$1"
    local result="$2"
    local details="$3"

    if [ "$result" = "PASS" ]; then
        echo "✅ PASS: $test_name"
        [ -n "$details" ] && echo "   $details"
        PASS_COUNT=$((PASS_COUNT + 1))
    else
        echo "❌ FAIL: $test_name"
        [ -n "$details" ] && echo "   $details"
        FAIL_COUNT=$((FAIL_COUNT + 1))
    fi
    echo ""
}

echo "Task 10.1: Package Version Verification"
echo "----------------------------------------"

# Test 1: Next.js 16.0.4
NEXTJS_VERSION=$(node -p "require('./package.json').dependencies.next")
if [ "$NEXTJS_VERSION" = "16.0.4" ]; then
    report_test "Next.js version is 16.0.4" "PASS" "Found: $NEXTJS_VERSION"
else
    report_test "Next.js version is 16.0.4" "FAIL" "Found: $NEXTJS_VERSION, Expected: 16.0.4"
fi

# Test 2: React 19.2.x
REACT_VERSION=$(node -p "require('./package.json').dependencies.react")
if [[ "$REACT_VERSION" =~ ^19\.2\. ]]; then
    report_test "React version is 19.2.x" "PASS" "Found: $REACT_VERSION"
else
    report_test "React version is 19.2.x" "FAIL" "Found: $REACT_VERSION, Expected: 19.2.x"
fi

# Test 3: pnpm-lock.yaml exists
if [ -f "pnpm-lock.yaml" ]; then
    report_test "pnpm-lock.yaml exists" "PASS"
else
    report_test "pnpm-lock.yaml exists" "FAIL"
fi

echo "Task 10.2: Build and Test Verification"
echo "----------------------------------------"

# Test 4: pnpm build succeeds
if pnpm build > /dev/null 2>&1; then
    report_test "pnpm build succeeds" "PASS"
else
    report_test "pnpm build succeeds" "FAIL"
fi

# Test 5: out/ directory exists
if [ -d "out" ]; then
    report_test "out/ directory generated" "PASS"
else
    report_test "out/ directory generated" "FAIL"
fi

# Test 6: pnpm type-check succeeds
if pnpm type-check > /dev/null 2>&1; then
    report_test "pnpm type-check succeeds" "PASS"
else
    report_test "pnpm type-check succeeds" "FAIL"
fi

# Test 7: pnpm lint succeeds
if pnpm lint > /dev/null 2>&1; then
    report_test "pnpm lint succeeds" "PASS"
else
    report_test "pnpm lint succeeds" "FAIL"
fi

# Test 8: Unit tests pass
UNIT_TEST_RESULT=$(pnpm test:unit 2>&1 || true)
if echo "$UNIT_TEST_RESULT" | grep -q "Tests:.*passed"; then
    report_test "All unit tests pass" "PASS"
else
    report_test "All unit tests pass" "FAIL"
fi

# Test 9: Integration tests pass
INT_TEST_RESULT=$(pnpm test:integration 2>&1 || true)
if echo "$INT_TEST_RESULT" | grep -q "Tests:.*passed"; then
    report_test "All integration tests pass" "PASS"
else
    report_test "All integration tests pass" "FAIL"
fi

# Test 10: Test coverage >= 90%
COVERAGE_RESULT=$(pnpm test:coverage 2>&1 || true)
if echo "$COVERAGE_RESULT" | grep -E "All files.*9[0-9]\.[0-9]+"; then
    report_test "Test coverage >= 90%" "PASS"
else
    report_test "Test coverage >= 90%" "FAIL"
fi

echo "=========================================="
echo "Final Verification Results"
echo "=========================================="
echo "Total Tests: $TOTAL_TESTS"
echo "Passed: $PASS_COUNT"
echo "Failed: $FAIL_COUNT"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    echo "✅ ALL TESTS PASSED - Upgrade successful!"
    exit 0
else
    echo "❌ SOME TESTS FAILED - Review results above"
    exit 1
fi
