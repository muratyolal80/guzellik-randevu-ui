#!/usr/bin/env bash
# =============================================================================
# release.sh — salonara (staging) → kuaforara (prod) in the safe order. Roadmap F3.
# docs/infrastructure/deployment-and-alignment.md §3:
#   migrations BEFORE code; every migration backward compatible with running code.
#
#   STAGING_SSH=root@<staging> PROD_SSH=root@<prod-ip> ./scripts/release.sh
#
# Steps (each asks for confirmation):
#   1. preflight: clean tree, on salonara, pushed, tsc + tests green
#   2. staging migrations   (migrate.sh staging)
#   3. pause → smoke test salonara.com.tr
#   4. prod migrations      (migrate.sh prod → mandatory backup)
#   5. merge salonara → kuaforara + push → Coolify deploys prod
# =============================================================================
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; cd "$ROOT"
STAGING_BRANCH=salonara; PROD_BRANCH=kuaforara

ask() { read -r -p "$1 (evet/hayir): " a; [ "$a" = evet ] || { echo "Durduruldu."; exit 1; }; }

echo "── 1/5 Preflight"
[ -z "$(git status --porcelain)" ] || { echo "❌ Commit edilmemiş değişiklik var"; exit 1; }
[ "$(git branch --show-current)" = "$STAGING_BRANCH" ] || { echo "❌ $STAGING_BRANCH branch'inde değilsin"; exit 1; }
git fetch -q origin
[ "$(git rev-parse HEAD)" = "$(git rev-parse "origin/$STAGING_BRANCH")" ] || { echo "❌ $STAGING_BRANCH push edilmemiş"; exit 1; }
npx tsc --noEmit -p . && npx vitest run --reporter=dot
git rev-parse --verify -q "origin/$PROD_BRANCH" >/dev/null || {
  echo "ℹ️  origin/$PROD_BRANCH yok — ilk kez oluşturulacak (adım 5)."; }
echo "Prod'a gidecek commit'ler:"; git log --oneline "origin/$PROD_BRANCH..HEAD" 2>/dev/null | head -30 || git log --oneline -10

echo "── 2/5 Staging migration'ları"
"$ROOT/scripts/migrate.sh" staging --dry-run
ask "Staging'e uygulansın mı?"; "$ROOT/scripts/migrate.sh" staging

echo "── 3/5 Staging smoke test"
echo "   salonara.com.tr: login (her rol), randevu akışı, owner paneli, değişen özellik"
ask "Staging testi geçti mi?"

echo "── 4/5 Prod migration'ları (yedek otomatik)"
"$ROOT/scripts/migrate.sh" prod --dry-run
ask "Prod'a uygulansın mı?"; "$ROOT/scripts/migrate.sh" prod --yes

echo "── 5/5 Kod: $STAGING_BRANCH → $PROD_BRANCH"
ask "Merge + push (Coolify prod deploy başlar)?"
if git rev-parse --verify -q "origin/$PROD_BRANCH" >/dev/null; then
  git checkout -q "$PROD_BRANCH" 2>/dev/null || git checkout -q -b "$PROD_BRANCH" "origin/$PROD_BRANCH"
  git pull -q --ff-only origin "$PROD_BRANCH"
  git merge --no-ff -m "release: $STAGING_BRANCH → $PROD_BRANCH $(date +%Y-%m-%d)" "$STAGING_BRANCH"
  git push origin "$PROD_BRANCH"
  git checkout -q "$STAGING_BRANCH"
else
  git push origin "$STAGING_BRANCH:$PROD_BRANCH"
fi
echo "✅ Release tamam. Coolify → Deployments'ı izle, ardından kuaforara.com.tr smoke test."
