# Upgrading

Back up the database and `.env` before any of this. `.env` holds `APP_KEY`; without it, encrypted data is
unreadable.

## From an earlier CS2 Panel release (1.11.11-cs2.x)

This release rebases the fork from Pterodactyl **1.11.11 → 1.15.2** (Laravel 10 → 12) and **removes the Wings
1.12.1 ceiling**.

> [!IMPORTANT]
> **Upgrade the panel first, Wings second.** The old panel issued tokens without a `scope` claim, which Wings
> rejects from 1.12.2 onward. Upgrading Wings while still on the old panel breaks the console, file transfers and
> backups.

**1. Panel**

```bash
cd /var/www/pterodactyl
php artisan down
unzip -o /tmp/cs2-panel-<tag>.zip -d /var/www/pterodactyl
chmod -R 755 storage/* bootstrap/cache
php artisan view:clear && php artisan config:clear
php artisan migrate --seed --force
chown -R www-data:www-data /var/www/pterodactyl/*
php artisan queue:restart
php artisan up
```

**2. Wings** — now unpinned. On each node:

```bash
systemctl stop wings
curl -L -o /usr/local/bin/wings "https://github.com/pterodactyl/wings/releases/latest/download/wings_linux_amd64"
chmod u+x /usr/local/bin/wings
systemctl start wings
```

**3. Verify** a server's console, a file upload, a file download and a backup download. Those are the four surfaces
the scope claim affects.

### What changed under you

- The ~15 backported security fixes are gone from this fork — upstream 1.15.2 has all of them. No behaviour change.
- The custom `UserEmail` rule is gone; Laravel 12's validator covers CVE-2026-48019.
- The client API rate limit is upstream's again. Set `APP_API_CLIENT_RATELIMIT` if the dashboard needs more.
- **Auto mounts is still inert.** It never worked (see the README warning); the dead code was removed rather than
  carried forward.

## From stock Pterodactyl 1.15.2

A code swap. Extract the zip over the panel and run step 1 above. Keep your Wings as-is — this build tracks
upstream 1.15.2, so whatever already works keeps working.

The three added migrations are additive columns only: `mounts.auto_mount`, `subusers.file_rules`,
`users.dashboard_preferences`.

## From stock Pterodactyl older than 1.15.2

Upgrade stock Pterodactyl to 1.15.2 by its
[own instructions](https://pterodactyl.io/panel/1.0/updating.html) first, confirm the panel is healthy, then follow
the section above. Doing it in one jump mixes two sets of failure modes.

## From a different fork

Treat it as "stock, unknown version". Check `config/app.php` for the upstream version it tracks, get to 1.15.2 the
usual way, then swap. A fork carrying its own migrations may leave columns behind — harmless, but they are yours to
clean up.

## Rolling back

Restore the database backup and extract the previous zip. Migrations in this release are upstream's plus three
additive columns, so a restored older database works with an older panel. If you already upgraded Wings, roll it
back too — the old panel cannot talk to Wings 1.12.2+.
