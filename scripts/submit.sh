#!/usr/bin/env bash
# Stop on errors
set -e

# Colors for pretty output
GREEN="\e[32m"
YELLOW="\e[33m"
RED="\e[31m"
CYAN="\e[36m"
RESET="\e[0m"

# ===============================
# 1️⃣ Setup and validation
# ===============================

echo -e "${CYAN}→ Starting submission process...${RESET}"

if [ -z "$1" ]; then
  echo -e "${RED}✖ Error: Missing GitHub username.${RESET}"
  echo -e "Usage: npm submit <github_username>"
  exit 1
fi

person_name=$1

echo -e "${GREEN}✔ GitHub username:${RESET} $person_name"

# ===============================
# 2️⃣ Install dependencies
# ===============================

echo -e "${CYAN}→ Installing dependencies...${RESET}"
npm install --silent

# ===============================
# 3️⃣ Create temporary branch
# ===============================

branch_name_string="$(openssl rand -hex 12 | tr -d '[:digit:]' | head -c 16)"
branch_name="BRANCH-$person_name-$branch_name_string"

echo -e "${CYAN}→ Creating new branch:${RESET} $branch_name"

git checkout -b "$branch_name" >/dev/null 2>&1
git push --set-upstream origin "$branch_name" >/dev/null 2>&1

# ===============================
# 4️⃣ Start server
# ===============================

echo -e "${CYAN}→ Starting server in background...${RESET}"
npm start >/dev/null 2>&1 &
server_pid=$!
sleep 3 # Give server time to start

# ===============================
# 5️⃣ Run tests
# ===============================

echo -e "${CYAN}→ Running tests...${RESET}"

# Run tests and capture output
test_output=$(npm test 2>&1 || true)

# Parse Jest test summary from output
# Jest outputs: "Tests:       17 failed, 26 passed, 43 total"
total_tests=$(echo "$test_output" | grep -E "Tests:.*total" | grep -oE "[0-9]+ total" | grep -oE "[0-9]+" || echo "0")
passed_tests=$(echo "$test_output" | grep -E "Tests:.*passed" | grep -oE "[0-9]+ passed" | grep -oE "[0-9]+" || echo "0")
failed_tests=$(echo "$test_output" | grep -E "Tests:.*failed" | grep -oE "[0-9]+ failed" | grep -oE "[0-9]+" || echo "0")

# Calculate percentages
if [ "$total_tests" -gt 0 ]; then
  passed_ratio=$((passed_tests * 100 / total_tests))
  failed_ratio=$((failed_tests * 100 / total_tests))
else
  passed_ratio=0
  failed_ratio=0
fi

echo -e "${GREEN}✔ Test Results:${RESET}"
echo -e "   Total tests: ${YELLOW}$total_tests${RESET}"
echo -e "   Passed: ${YELLOW}$passed_tests${RESET}"
echo -e "   Failed: ${YELLOW}$failed_tests${RESET}"
echo -e "   Pass rate: ${YELLOW}$passed_ratio%${RESET}"

# ===============================
# 6️⃣ Cleanup server
# ===============================

echo -e "${CYAN}→ Stopping server...${RESET}"
kill -9 "$server_pid" >/dev/null 2>&1 || true

# ===============================
# 7️⃣ Commit and push results
# ===============================

echo -e "${CYAN}→ Committing results...${RESET}"
git add . >/dev/null 2>&1
git commit -m "Test Results: $total_tests total, $passed_tests passed, $failed_tests failed ($passed_ratio% pass rate)" >/dev/null 2>&1
git push -f >/dev/null 2>&1

# ===============================
# 8️⃣ Cleanup branches
# ===============================

echo -e "${CYAN}→ Cleaning up...${RESET}"
git checkout main >/dev/null 2>&1
git branch -D "$branch_name" >/dev/null 2>&1

# ===============================
# ✅ Done
# ===============================

echo -e "${GREEN}✅ Submission complete!${RESET}"