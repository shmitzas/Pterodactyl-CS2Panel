#!/usr/bin/env bash
# Builds the drop-in archive release/cs2-panel-<version>.zip (extract over /var/www/pterodactyl).
# Needs git, Node 16 + Yarn 1, PHP 8.2+ with Composer 2, and zip. Packs the committed HEAD, not local edits.
set -euo pipefail

cd "$(dirname "$0")"
version="${1:-$(git describe --tags --always)}"
if [[ ! "$version" =~ ^[A-Za-z0-9._-]+$ ]]; then
    echo "release.sh: invalid version '$version' (allowed: letters, digits, '.', '_', '-')" >&2
    exit 1
fi

out="$PWD/release"
stage="$out/panel"
archive="cs2-panel-$version.zip"
rm -rf "$out"
mkdir -p "$stage"

# Tracked files only, so a local .env, logs or caches can never end up in the archive.
git archive --format=tar HEAD | tar -x -C "$stage"
cd "$stage"
rm -rf .github tests phpunit.xml .php-cs-fixer.dist.php .env.ci .editorconfig .gitignore release.sh README.md CHANGELOG.md

yarn install --frozen-lockfile --non-interactive
yarn build:production
rm -rf node_modules

# .env.example sets APP_ENVIRONMENT_ONLY=true, so artisan boots without a database.
cp .env.example .env
composer install --no-dev --optimize-autoloader --no-interaction --no-progress --prefer-dist
# Composer swallows discovery failures; a stale packages.php on the server breaks boot after a drop-in.
php artisan package:discover
rm .env
# Booting artisan wrote logs and cache files; ship only the directory placeholders.
find storage -type f ! -name .gitignore -delete
find storage -mindepth 1 -type d -empty -delete

test -f public/assets/manifest.json
test -f bootstrap/cache/packages.php

# Never pack an .env: it would overwrite the server's APP_KEY on drag-and-drop.
zip -qrX "$out/$archive" . -x .env
cd "$out"
sha256sum "$archive" > "$archive.sha256"
echo "Built $out/$archive"
