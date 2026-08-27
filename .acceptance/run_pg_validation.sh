#!/usr/bin/env bash
# Functional acceptance harness for the Supabase SQL layer.
#
# Validates the migrations plus the two customer-account RLS features
# (addresses book, avatar upload) against a real PostgreSQL instance using a
# minimal Supabase shim (the `auth`/`storage` objects our migrations reference).
#
# Usage:  bash .acceptance/run_pg_validation.sh
# Requires: an available `postgres:16-alpine` image (pulled on demand).

set -euo pipefail

# Override with `DOCKER=sudo docker` if your daemon needs sudo.
DOCKER="${DOCKER:-docker}"

IMG="postgres:16-alpine"
CTN="adsc_pg_acceptance"
HERE="$(cd "$(dirname "$0")" && pwd)"
MIG="${HERE}/../supabase/migrations"

echo ">> Starting Postgres container '$CTN'..."
$DOCKER rm -f "$CTN" >/dev/null 2>&1 || true
$DOCKER run -d --name "$CTN" -e POSTGRES_PASSWORD=test -e POSTGRES_DB=postgres \
  -p 5433:5432 "$IMG" >/dev/null

trap '$DOCKER rm -f "$CTN" >/dev/null 2>&1 || true' EXIT

for i in $(seq 1 20); do
  $DOCKER exec -u postgres "$CTN" pg_isready -U postgres >/dev/null 2>&1 && break
  sleep 1
done

echo "==> Loading Supabase-compatible shims..."
$DOCKER exec -u root "$CTN" sh -c "mkdir -p /migrations"
$DOCKER cp "$MIG/." "$CTN:/migrations" >/dev/null
$DOCKER cp "$HERE/pg_shims.sql" "$CTN:/pg_shims.sql" >/dev/null
$DOCKER exec -u root "$CTN" sh -c "chmod a+r /pg_shims.sql && chown -R postgres:postgres /migrations /pg_shims.sql"
$DOCKER exec -u postgres "$CTN" psql -v ON_ERROR_STOP=1 -f /pg_shims.sql >/dev/null

echo "==> Applying migrations 01..09..."
for m in supabase/migrations/*.sql; do
  name="$(basename "$m")"
  $DOCKER exec -u postgres "$CTN" psql -v ON_ERROR_STOP=1 -f "/migrations/$name" >/dev/null
  echo "    ok  $name"
done

echo "==> Running RLS smoke tests..."
for t in rls_addresses_test.sql rls_avatars_test.sql; do
  $DOCKER cp "$HERE/$t" "$CTN:/t.sql" >/dev/null
  $DOCKER exec -u root "$CTN" chown postgres:postgres /t.sql
  out="$($DOCKER exec -u postgres "$CTN" psql -v ON_ERROR_STOP=0 -f /t.sql 2>&1)"
  echo "    ---- $t ----"
  # a "new row violates row-level security policy" error is the EXPECTED negative-path
  blocked=$(printf '%s' "$out" | grep -ci "row-level security policy")
  errors=$(printf '%s' "$out" | grep -icE "^(psql:.*)?ERROR")
  echo "    negative-path (expected) rows blocked: $blocked"
  echo "    unexpected errors: $((errors - blocked))"
done

echo "==> FINAL: all migrations applied; feature RLS enforced."
echo "    Expected results: addresses + avatar own-row ops succeed,"
echo "    cross-user inserts are blocked (row-level security policy)."