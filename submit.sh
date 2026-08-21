#!/usr/bin/env bash
set -e

# ─────────────────────────────────────────────
# submit — run checks and post result to Canvas
# Usage: bash submit.sh
# ─────────────────────────────────────────────

LAB_JSON="./lab.json"
API_URL="${SUBMIT_API_URL:-http://localhost:4000/submit}"
STUDENT_ID="${STUDENT_ID:-}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

pass() { echo -e "  ${GREEN}✓${NC} $1"; }
fail() { echo -e "  ${RED}✕${NC} $1"; }
info() { echo -e "  ${BLUE}→${NC} $1"; }

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Coding School — Lab Submission${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ── 0. Prerequisites ──────────────────────────────────────────────────────────
if [ ! -f "$LAB_JSON" ]; then
  echo -e "${RED}Error: lab.json not found. Are you in the right directory?${NC}"
  exit 1
fi

if [ -z "$STUDENT_ID" ]; then
  echo -e "${YELLOW}Warning: STUDENT_ID not set.${NC}"
  echo -e "  Add this to your ~/.bashrc:  export STUDENT_ID=your-student-id"
  echo ""
fi

LAB_ID=$(node -pe "require('./lab.json').id" 2>/dev/null || python3 -c "import json;print(json.load(open('lab.json'))['id'])")
LAB_TITLE=$(node -pe "require('./lab.json').title" 2>/dev/null || python3 -c "import json;print(json.load(open('lab.json'))['title'])")
CANVAS_COURSE_ID=$(node -pe "require('./lab.json').canvas.course_id" 2>/dev/null || python3 -c "import json;print(json.load(open('lab.json'))['canvas']['course_id'])")
CANVAS_ASSIGNMENT_ID=$(node -pe "require('./lab.json').canvas.assignment_id" 2>/dev/null || python3 -c "import json;print(json.load(open('lab.json'))['canvas']['assignment_id'])")

echo -e "Lab:    ${LAB_TITLE}"
echo -e "ID:     ${LAB_ID}"
echo ""

# ── 1. Run checks ─────────────────────────────────────────────────────────────
echo "Running checks..."
echo ""

CHECKS_PASSED=0
CHECKS_FAILED=0
FAILED_CHECKS=()

run_check_file_exists() {
  local id="$1" desc="$2"
  shift 2
  local paths=("$@")
  local ok=true
  for path in "${paths[@]}"; do
    if [ ! -f "$path" ] && [ ! -d "$path" ]; then
      ok=false
      break
    fi
  done
  if $ok; then
    pass "$desc"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
  else
    fail "$desc"
    CHECKS_FAILED=$((CHECKS_FAILED + 1))
    FAILED_CHECKS+=("$desc")
  fi
}

run_check_file_not_contains() {
  local id="$1" desc="$2" value="$3"
  shift 3
  local paths=("$@")
  local ok=true
  for path in "${paths[@]}"; do
    if [ -f "$path" ] && grep -q "$value" "$path" 2>/dev/null; then
      ok=false
      break
    fi
  done
  if $ok; then
    pass "$desc"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
  else
    fail "$desc — found placeholder: \"$value\""
    CHECKS_FAILED=$((CHECKS_FAILED + 1))
    FAILED_CHECKS+=("$desc")
  fi
}

run_check_git_commits() {
  local id="$1" desc="$2" min="$3"
  local count
  count=$(git rev-list --count HEAD 2>/dev/null || echo 0)
  if [ "$count" -ge "$min" ]; then
    pass "$desc ($count commits)"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
  else
    fail "$desc — only $count commit(s), need at least $min"
    CHECKS_FAILED=$((CHECKS_FAILED + 1))
    FAILED_CHECKS+=("$desc")
  fi
}

# Parse and run each check from lab.json
# (Checks are hardcoded here for shell simplicity — the API server handles the
# full dynamic version. Add new check types below as the system grows.)

CHECK_COUNT=$(node -pe "require('./lab.json').checks.length" 2>/dev/null || echo 0)

for i in $(seq 0 $((CHECK_COUNT - 1))); do
  TYPE=$(node -pe "require('./lab.json').checks[$i].type")
  ID=$(node -pe "require('./lab.json').checks[$i].id")
  DESC=$(node -pe "require('./lab.json').checks[$i].description")

  case "$TYPE" in
    file_exists)
      PATHS=$(node -pe "require('./lab.json').checks[$i].paths.join(' ')")
      read -ra PATH_ARR <<< "$PATHS"
      run_check_file_exists "$ID" "$DESC" "${PATH_ARR[@]}"
      ;;
    file_not_contains)
      VALUE=$(node -pe "require('./lab.json').checks[$i].value")
      PATHS=$(node -pe "require('./lab.json').checks[$i].paths.join(' ')")
      read -ra PATH_ARR <<< "$PATHS"
      run_check_file_not_contains "$ID" "$DESC" "$VALUE" "${PATH_ARR[@]}"
      ;;
    git_commits)
      MIN=$(node -pe "require('./lab.json').checks[$i].min")
      run_check_git_commits "$ID" "$DESC" "$MIN"
      ;;
    *)
      info "Unknown check type: $TYPE — skipping"
      ;;
  esac
done

# ── 2. Summary ────────────────────────────────────────────────────────────────
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ "$CHECKS_FAILED" -eq 0 ]; then
  RESULT="pass"
  echo -e "${GREEN}All $CHECKS_PASSED checks passed.${NC}"
else
  RESULT="fail"
  echo -e "${RED}$CHECKS_FAILED check(s) failed, $CHECKS_PASSED passed.${NC}"
  echo ""
  echo "Fix before resubmitting:"
  for msg in "${FAILED_CHECKS[@]}"; do
    echo -e "  ${RED}✕${NC} $msg"
  done
fi

echo ""

# ── 3. Post to submission API ─────────────────────────────────────────────────
info "Submitting to Canvas..."

PAYLOAD=$(cat <<EOF
{
  "lab_id": "$LAB_ID",
  "student_id": "$STUDENT_ID",
  "course_id": "$CANVAS_COURSE_ID",
  "assignment_id": "$CANVAS_ASSIGNMENT_ID",
  "result": "$RESULT",
  "checks_passed": $CHECKS_PASSED,
  "checks_failed": $CHECKS_FAILED,
  "failed_checks": $(node -pe "JSON.stringify($(printf '%s\n' "${FAILED_CHECKS[@]}" | node -e "const l=[];process.stdin.on('data',d=>l.push(...d.toString().trim().split('\n')));process.stdin.on('end',()=>console.log(JSON.stringify(l.filter(Boolean))))"))" 2>/dev/null || echo "[]"),
  "git_branch": "$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')",
  "git_commit": "$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')"
}
EOF
)

HTTP_STATUS=$(curl -s -o /tmp/submit_response.json -w "%{http_code}" \
  -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" 2>/dev/null || echo "000")

if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "201" ]; then
  pass "Submitted. Canvas gradebook updated."
  echo ""
  if [ "$RESULT" = "pass" ]; then
    echo -e "${GREEN}You're done. Mentor will review shortly.${NC}"
  else
    echo -e "${YELLOW}Submission recorded with failures. Fix the issues above and run submit again.${NC}"
  fi
else
  echo -e "${YELLOW}Warning: Could not reach submission server (status: $HTTP_STATUS).${NC}"
  echo -e "  Your work is saved locally. Try again or let your mentor know."
fi

echo ""