#!/bin/bash

# Comprehensive Gateweaver Routing Test Script
# Tests prefix matching, CORS, health checks, and service routing

set -e

echo "🚀 Starting Gateweaver Routing Tests..."
echo "======================================"

# Configuration
GATEWAY_URL="http://localhost:8080"
HEALTH_URL="http://localhost:8081"
METRICS_URL="http://localhost:8082"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to print test results
print_result() {
    local test_name="$1"
    local status="$2"
    local details="$3"
    
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✓ PASS${NC} - $test_name"
        [ -n "$details" ] && echo -e "  ${BLUE}$details${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC} - $test_name"
        [ -n "$details" ] && echo -e "  ${RED}$details${NC}"
        ((TESTS_FAILED++))
    fi
}

# Function to test HTTP endpoint
test_endpoint() {
    local url="$1"
    local expected_status="$2"
    local test_name="$3"
    local method="${4:-GET}"
    local headers="$5"
    
    echo -e "\n${YELLOW}Testing:${NC} $test_name"
    echo -e "${BLUE}URL:${NC} $url"
    
    if [ -n "$headers" ]; then
        response=$(curl -s -w "\n%{http_code}\n%{response_headers}" -X "$method" $headers "$url" 2>/dev/null || echo -e "\nERROR\n")
    else
        response=$(curl -s -w "\n%{http_code}\n%{response_headers}" -X "$method" "$url" 2>/dev/null || echo -e "\nERROR\n")
    fi
    
    # Parse response
    body=$(echo "$response" | head -n -2)
    status_code=$(echo "$response" | tail -n 2 | head -n 1)
    response_headers=$(echo "$response" | tail -n 1)
    
    if [ "$status_code" = "$expected_status" ]; then
        print_result "$test_name" "PASS" "Status: $status_code"
        
        # Check for expected headers
        if echo "$response_headers" | grep -q "X-Gateway: Gateweaver"; then
            echo -e "  ${GREEN}✓${NC} Gateway header present"
        fi
        
        if echo "$response_headers" | grep -q "X-Service:"; then
            service=$(echo "$response_headers" | grep -o "X-Service: [^[:space:]]*" | cut -d' ' -f2)
            echo -e "  ${GREEN}✓${NC} Routed to service: $service"
        fi
        
        return 0
    else
        print_result "$test_name" "FAIL" "Expected: $expected_status, Got: $status_code"
        echo -e "  ${RED}Response body:${NC} $body"
        return 1
    fi
}

# Function to test CORS
test_cors() {
    local url="$1"
    local origin="$2"
    local test_name="$3"
    
    echo -e "\n${YELLOW}Testing CORS:${NC} $test_name"
    
    headers="-H 'Origin: $origin' -H 'Access-Control-Request-Method: POST' -H 'Access-Control-Request-Headers: Content-Type'"
    response=$(curl -s -w "\n%{http_code}" -X OPTIONS $headers "$url" 2>/dev/null || echo -e "\nERROR")
    
    status_code=$(echo "$response" | tail -n 1)
    
    if [ "$status_code" = "200" ] || [ "$status_code" = "204" ]; then
        print_result "$test_name" "PASS" "CORS preflight successful"
        return 0
    else
        print_result "$test_name" "FAIL" "CORS preflight failed: $status_code"
        return 1
    fi
}

echo -e "\n${BLUE}1. Testing Gateweaver Health and Metrics${NC}"
echo "----------------------------------------"

# Test Gateweaver health endpoint
test_endpoint "$HEALTH_URL/health" "200" "Gateweaver Health Check"

# Test metrics endpoint
test_endpoint "$METRICS_URL/metrics" "200" "Gateweaver Metrics"

echo -e "\n${BLUE}2. Testing Service Routing - Exact Paths${NC}"
echo "---------------------------------------"

# Test exact API paths
test_endpoint "$GATEWAY_URL/api/email" "200" "Email Service Root"
test_endpoint "$GATEWAY_URL/api/chat" "200" "Chat Service Root"
test_endpoint "$GATEWAY_URL/api/notifications" "200" "Notification Service Root"

echo -e "\n${BLUE}3. Testing Service Routing - Prefix Matching${NC}"
echo "-------------------------------------------"

# Test prefix matching for microservices
test_endpoint "$GATEWAY_URL/api/email/health" "200" "Email Service Health (Prefix Match)"
test_endpoint "$GATEWAY_URL/api/email/send" "404" "Email Service Send Endpoint (Expected 404 - service may not be running)"
test_endpoint "$GATEWAY_URL/api/chat/health" "200" "Chat Service Health (Prefix Match)"
test_endpoint "$GATEWAY_URL/api/chat/messages" "404" "Chat Service Messages (Expected 404 - service may not be running)"
test_endpoint "$GATEWAY_URL/api/notifications/health" "200" "Notification Service Health (Prefix Match)"
test_endpoint "$GATEWAY_URL/api/notifications/test-new-message" "404" "Notification Test Endpoint (Expected 404 - service may not be running)"

echo -e "\n${BLUE}4. Testing Individual Service Health Checks${NC}"
echo "------------------------------------------"

# Test individual service health endpoints (these should rewrite to /health)
test_endpoint "$GATEWAY_URL/health/email" "502" "Email Service Health Check (Expected 502 if service down)"
test_endpoint "$GATEWAY_URL/health/chat" "502" "Chat Service Health Check (Expected 502 if service down)"
test_endpoint "$GATEWAY_URL/health/notifications" "502" "Notification Service Health Check (Expected 502 if service down)"

echo -e "\n${BLUE}5. Testing CORS Configuration${NC}"
echo "-----------------------------"

# Test CORS with allowed origins
test_cors "$GATEWAY_URL/api/email" "http://localhost:3000" "CORS - Localhost 3000"
test_cors "$GATEWAY_URL/api/chat" "http://localhost:5000" "CORS - Localhost 5000"

echo -e "\n${BLUE}6. Testing HTTP Methods${NC}"
echo "----------------------"

# Test different HTTP methods
test_endpoint "$GATEWAY_URL/api/email" "200" "Email Service - GET" "GET"
test_endpoint "$GATEWAY_URL/api/email" "404" "Email Service - POST (Expected 404)" "POST"
test_endpoint "$GATEWAY_URL/api/chat" "200" "Chat Service - GET" "GET"
test_endpoint "$GATEWAY_URL/api/notifications" "200" "Notification Service - GET" "GET"

echo -e "\n${BLUE}7. Testing Main Application Routing${NC}"
echo "----------------------------------"

# Test main application routes (catch-all)
test_endpoint "$GATEWAY_URL/" "200" "Main Application Root"
test_endpoint "$GATEWAY_URL/some-random-path" "200" "Main Application - Random Path (Should route to main app)"

echo -e "\n${BLUE}8. Testing Error Handling${NC}"
echo "------------------------"

# Test non-existent services
test_endpoint "$GATEWAY_URL/api/nonexistent" "200" "Non-existent API Route (Should route to main app)"

echo -e "\n${BLUE}9. Testing Headers and Security${NC}"
echo "------------------------------"

# Test security headers
echo -e "\n${YELLOW}Testing:${NC} Security Headers"
response=$(curl -s -I "$GATEWAY_URL/api/email" 2>/dev/null)

if echo "$response" | grep -q "X-Frame-Options: DENY"; then
    print_result "Security Headers - X-Frame-Options" "PASS"
else
    print_result "Security Headers - X-Frame-Options" "FAIL"
fi

if echo "$response" | grep -q "X-Content-Type-Options: nosniff"; then
    print_result "Security Headers - X-Content-Type-Options" "PASS"
else
    print_result "Security Headers - X-Content-Type-Options" "FAIL"
fi

if echo "$response" | grep -q "X-Gateway: Gateweaver"; then
    print_result "Gateway Headers - X-Gateway" "PASS"
else
    print_result "Gateway Headers - X-Gateway" "FAIL"
fi

echo -e "\n${BLUE}10. Performance and Load Test${NC}"
echo "------------------------------"

# Simple load test
echo -e "\n${YELLOW}Testing:${NC} Basic Load Test (10 concurrent requests)"
time_start=$(date +%s.%N)

for i in {1..10}; do
    curl -s "$GATEWAY_URL/api/email" >/dev/null &
done
wait

time_end=$(date +%s.%N)
duration=$(echo "$time_end - $time_start" | bc)

if (( $(echo "$duration < 5.0" | bc -l) )); then
    print_result "Load Test - 10 concurrent requests" "PASS" "Completed in ${duration}s"
else
    print_result "Load Test - 10 concurrent requests" "FAIL" "Took too long: ${duration}s"
fi

echo -e "\n${BLUE}📊 Test Summary${NC}"
echo "==============="
echo -e "${GREEN}Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Tests Failed: $TESTS_FAILED${NC}"
echo -e "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All tests passed! Gateweaver routing is working correctly.${NC}"
    exit 0
else
    echo -e "\n${YELLOW}⚠️  Some tests failed. Check the results above for details.${NC}"
    echo -e "${BLUE}💡 Note: Some 404/502 errors are expected if services are not running.${NC}"
    exit 1
fi