#!/usr/bin/env bash
set -euo pipefail

echo "== Tailwind config sanity =="
node -e "console.log('content:', require('./tailwind.config.js').content)" || true
node -e "console.log('postcss plugins:', Object.keys(require('./postcss.config.js').plugins))" || true

echo
echo "== NEXT specific traps =="
echo "-- Duplicate Link imports:"
grep -RIn "import Link from ['\"]next/link['\"]" src 2>/dev/null | cut -d: -f1 | sort | uniq -d || true

echo "-- <Link ...> without import:"
while IFS= read -r f; do
  grep -q "from ['\"]next/link['\"]" "$f" || echo "MISSING import: $f"
done < <(grep -RIwl --include="*.tsx" "<Link" src || true)

echo "-- Wrong Button import (should be default):"
grep -RIn "import\s*{\s*Button\s*}\s*from\s*['\"]@/components/ui/Button['\"]" src || true

echo "-- Illegal <html> outside app/layout.tsx:"
grep -RIn "<html" src/app 2>/dev/null | awk '$1 !~ /src\/app\/layout\.tsx:/ {print}'

echo "-- Files that use client-only APIs but may miss 'use client':"
PATTERN="useState|useEffect|useRef|useLayoutEffect|useReducer|useContext|useTransition|useOptimistic|useRouter|useSearchParams|usePathname|window|document|localStorage|onClick=|onChange=|onSubmit=|onKeyDown="
while IFS= read -r f; do
  # skip server-only roots
  if [[ "$f" =~ \.tsx$ ]]; then
    if ! head -n1 "$f" | grep -q "^'use client'"; then
      echo "POSSIBLE client (missing 'use client'): $f"
    fi
  fi
done < <(grep -RIl --include="*.tsx" -E "$PATTERN" src || true)

echo
echo "== Imports overview =="
grep -RIn "import Link from 'next/link'" src | wc -l | xargs echo "Link imports:"
grep -RIn "import Button from \"@/components/ui/Button\"" src | wc -l | xargs echo "Button default imports:"
