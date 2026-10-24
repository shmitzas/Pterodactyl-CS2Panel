# Pterodactyl CS2 Panel

A standalone build of the [Pterodactyl](https://pterodactyl.io) panel for Counter-Strike 2 hosting: upstream
**v1.15.2**, a dark CS2 theme, CS2-aware file shortcuts and the changes below. GitHub Actions compiles each release
into a drop-in zip, so the server needs no Node, Yarn or Composer: extract the zip over `/var/www/pterodactyl` and run
the [update commands](#updating-the-server).

> Pairs with [**CS2-Ptero-Egg**](https://github.com/shmitzas/CS2-Ptero-Egg) — the egg this panel is built around.
> The dashboard's SwiftlyS2 pre-release toggle and the CS2 config shortcuts both key off that egg's variables and
> directory layout.

> [!IMPORTANT]
> Upstream fixes are **not** picked up automatically. Watch the
> [Pterodactyl advisories](https://github.com/pterodactyl/panel/security/advisories) and rebase when a new release
> lands.

## Compatibility

| | Supported | Latest upstream |
|---|---|---|
| **Pterodactyl Panel** | **1.15.2** | 1.15.2 |
| **Wings** | **1.13.x** (any version a stock 1.15.2 panel supports) | 1.13.4 |
| **PHP** | 8.2 / 8.3 | |
| **Node** (building only) | ≥ 22 | |

This tracks upstream exactly, so a stock Pterodactyl install of the same version runs it with no version juggling:
keep the Wings you already have.

### Moving from a stock Pterodactyl install

If you are already on **1.15.2**, switching is a code swap plus `php artisan migrate` — follow
[Updating the server](#updating-the-server). Back the database up first regardless.

This fork adds three migrations, all additive columns, so nothing upstream is altered:
`mounts.auto_mount`, `subusers.file_rules`, `users.dashboard_preferences`.

Coming from an **older** panel, or from a different fork? See the
[Upgrade guide](docs/upgrading.md), which covers the Wings and database steps in order.

## Panel changes

| Change | Behaviour | Main files |
|--------|-----------|------------|
| Subuser file rules | The server owner or a root admin can limit a subuser's file manager to path prefixes (e.g. `/plugins`, `/logs`); no rules means no limit. File endpoints answer 403 outside the prefixes. Wings can't apply the rules to SFTP or uploads (it takes the upload folder from the browser), so a restricted subuser is refused SFTP logins and upload links. | `subusers.file_rules` migration, `Server::fileRulesFor()`, `Api/Client/Servers/FileController.php`, `FileUploadController.php`, `SftpAuthenticationController.php`, `SubuserController.php`, `EditSubuserModal.tsx` |
| Auto mounts | Adds **Mount on Install** and **Auto Mount** checkboxes to a mount. **Currently inert — see the warning below.** | `mounts.mount_on_install` / `mounts.auto_mount` migration, `admin/mounts/view.blade.php` |
| Dashboard tools | Drag a server's grip handle to reorder the dashboard. A saved **Power Actions** group gets Start / Restart / Stop / Kill in one click, and a saved **SwiftlyS2 Pre-release** group (only servers whose egg has the `PRERELEASE` variable) gets the flag switched on or off; it applies on each server's next restart. Order and groups are stored per account and cover up to 100 servers (root admins pick from every server on the panel). Above the list, an **All servers** strip sums the listed servers' CPU, memory and disk (the total limit is ∞ if any one server is unlimited) and counts how many are running; it reuses the rows' own 30-second polls, so it costs no extra requests. | `users.dashboard_preferences` migration, `PUT /api/client/account/dashboard`, `DashboardContainer.tsx`, `BulkActions.tsx`, `ServerTotals.tsx` |
| Server sidebar | Links come in three groups: Console / Startup / Settings / Admin (root admins), then files, then Schedules / Users / Network / Activity / Backups / Databases. On CS2 servers (the startup command contains `cs2` or `csgo`) the files group also has file manager shortcuts to CS2 Configs (`game/csgo/cfg`), SW2 Configs, Plugins Configs and Plugins. The shortcut covering the open directory is highlighted instead of Files. A page added to `routes.ts` but missing from this layout is appended to the last group. | `routers/ServerRouter.tsx`, `assets/css/sidebar.css` |
| CS2 theme | Dark glass surfaces over the site background, orange accent, Roboto, tinted outline buttons. The nav bar, sidebar, dashboard and every server page (console, files, databases, schedules, users, backups, network, startup, settings, activity) are redesigned, each server page opening with the shared `PageHeader`; account pages pick up the restyled sidebar and controls. The Blade admin area gets the same look from `cs2-admin.css`, a stylesheet over AdminLTE / Bootstrap 3; its sidebar is defined once in the admin layout, and each page header reuses the icon of its sidebar section. The base font size is 17px on every page. | `assets/css/cs2.css` (tokens and shared classes), `assets/css/sidebar.css`, `tailwind.config.js` (`cs2` colours), `public/cs2/`, `components/elements/**`, `components/server/**`, `dashboard/dashboard.module.css`, `NavigationBar.tsx`, `public/themes/pterodactyl/css/cs2-admin.css`, `views/layouts/admin.blade.php` |

### Theme

Colours come from the RGB-triplet variables in `cs2.css` (`rgba(var(--cs2-accent), 0.2)`) or the Tailwind `cs2-*`
colours. The panel runs Tailwind 3.0, whose opacity modifiers only accept the default scale: `bg-cs2-accent/20`
works, `bg-cs2-accent/15` silently generates nothing.

| Token | Use |
|-------|-----|
| `--cs2-accent` / `cs2-accent` | Orange. **Every interactive affordance** — links, focus rings, hover borders, active nav, progress, icon highlights |
| `--cs2-info` / `cs2-info` | Cyan. Informational notices only, never ordinary chrome |
| `--cs2-success`, `--cs2-warning`, `--cs2-danger` | Green / gold / red, semantic only |

Accent and info are a deliberate split: before, one cyan token did both jobs, so nothing could be marked as *merely
informational*. Reach for `cs2-accent` unless the element is telling the user something.

`cs2.css` also holds the shared surfaces: `glass-panel` (static section), `glass-row` (list row, no blur),
`cs2-tile` (icon tile) and `cs2-badge` (status pill), coloured with a `cs2-tone-info|success|warning|danger|muted`
class. Two rules apply when using them:

- Never put `backdrop-filter` on an element that contains a `Tooltip`: tooltips are `position: fixed` and would be
  placed relative to that element. `glass-panel` keeps its blur on `::before` for this reason.
- Don't put Tailwind display utilities (`hidden`, `sm:inline-flex`, ...) on `cs2-tile` / `cs2-badge` elements;
  `cs2.css` loads after Tailwind and its `display` wins. Toggle visibility on a wrapper instead.

The panel ships **no logo image**: the nav bar draws an accent bar next to the configured app name, so there is
nothing to replace on a fresh install. `public/cs2/background.webp` is the site background and can be swapped freely.

The admin theme (`public/themes/pterodactyl/css/cs2-admin.css`) is plain CSS, not part of the webpack build:

- It must stay the last stylesheet in `layouts/admin.blade.php`, and its rules are scoped to `body.cs2-admin` so
  they outrank the AdminLTE and Bootstrap selectors they replace.
- Admin boxes get no `backdrop-filter`: it would make each box a stacking context and hide its tooltips and dropdowns
  under the next box.
- Two values are shared with the client and must change together: the base font size (`html` at 106.25%, also in
  `cs2.css`) and the darkening overlay on the background image (also in `GlobalStylesheet.ts`).

> [!WARNING]
> **Auto mounts does not work.** `ServerCreationService::storeActiveMounts()` was never called from anywhere (and
> was dropped during the 1.15.2 rebase), and `EventServiceProvider` registers `RemoveMountsAfterInstall` against its
> own class instead of `Server\Installed`, so that never fires either. The columns and the admin checkboxes exist,
> but nothing acts on them. Implementing it properly is an open task.

## Removed in the 1.15.2 rebase

This fork used to carry ~15 panel-side security fixes backported from upstream 1.12.0 – 1.15.1, plus a custom
`UserEmail` rule for CVE-2026-48019. Upstream 1.15.2 contains all of them, so they were dropped: the fork now holds
only the features listed above. The two fixes that were previously *not* portable — the JWT scope fix
(GHSA-8r6w-3qq5-4p4r) and SFTP session revocation (GHSA-8c39-xppg-479c, GHSA-hr7j-63v7-vj7g) — come with upstream
too, which is what removed the old Wings 1.12.1 ceiling.


## Repository layout

| Path | Contents |
|------|----------|
| `app/`, `bootstrap/`, `config/`, `database/`, `routes/` | Laravel backend (PHP) |
| `resources/scripts/` | React/TypeScript frontend, compiled into `public/assets/` |
| `resources/views/`, `resources/lang/` | Blade templates (admin area) and translations |
| `public/` | Web root. Compiled `public/assets/*` is git-ignored except `svgs/` |
| `storage/` | Runtime files; git tracks only the directory placeholders |
| `tests/` | Upstream PHPUnit suite (not run in CI) |
| `release.sh` | Builds the drop-in zip; both workflows call it |
| `.github/workflows/build.yaml` | Push or PR to `main`: builds the zip and keeps it as an Actions artifact for 3 days |
| `.github/workflows/release.yaml` | `v*` tag or manual run: builds the zip and publishes it as a GitHub release |

## Releasing

Either push a tag:

```bash
git tag v1.15.2-cs2.1
git push origin v1.15.2-cs2.1
```

…or open **Actions → Release → Run workflow** and enter the tag; the workflow creates it on the head of the branch you
pick. The release carries `cs2-panel-<tag>.zip` and its `.sha256`. Suggested tag format:
`v<upstream version>-cs2.<n>`. `config/app.php` carries the upstream version it tracks (`1.15.2`), so the admin
area's update check compares against the matching Pterodactyl release.

The zip holds everything the server runs: PHP source, compiled `public/assets/`, a production `vendor/`
(`composer install --no-dev --optimize-autoloader` on PHP 8.2), the matching `bootstrap/cache/packages.php`,
`.env.example` and the empty `storage/` skeleton. It never contains `.env`, `node_modules/`, tests or repo tooling.

## Updating the server

The server needs PHP 8.2+ with the extensions from the
[official dependency list](https://pterodactyl.io/panel/1.0/getting_started.html#dependencies). Adjust the path and
the web server user (`www-data`, `nginx`, `caddy`, …) to your system.

```bash
cd /var/www/pterodactyl
php artisan down

# Upload the zip (e.g. to /tmp) and extract it over the panel:
unzip -o /tmp/cs2-panel-<tag>.zip -d /var/www/pterodactyl
# ...or extract it on your PC and drag its contents into /var/www/pterodactyl over SFTP, overwriting everything.

chmod -R 755 storage/* bootstrap/cache
php artisan view:clear
php artisan config:clear
php artisan migrate --seed --force
chown -R www-data:www-data /var/www/pterodactyl/*
php artisan queue:restart
php artisan up
```

- Keep the server's `.env`: it holds `APP_KEY`, and without it encrypted data is unreadable. The zip has no `.env`.
- Upload all of it, `vendor/` and `bootstrap/cache/` included: the shipped package manifest must match the shipped
  `vendor/`. Dragging ~11k files over SFTP is slow; uploading the ~17 MB zip and running `unzip` is much faster.
- Old hashed bundles left in `public/assets/` are harmless; `manifest.json` points at the new ones.

For a fresh install, follow the [official guide](https://pterodactyl.io/panel/1.0/getting_started.html) but extract
this zip instead of downloading `panel.tar.gz`, and skip `composer install`.

## Local development

Needs Node.js 22+, Yarn 1, PHP 8.2+ and Composer 2.

```bash
yarn install
composer install
yarn build              # development build into public/assets/
yarn watch              # rebuild on change
yarn build:production   # minified build, what releases ship
```

`bash release.sh [version]` builds a release zip into `release/` on Linux or WSL (also needs `zip`). It packs the
committed `HEAD`, not uncommitted edits, and leaves the unpacked tree in `release/panel/`.

## Credits

- [**Pterodactyl Panel**](https://github.com/pterodactyl/panel) — Dane Everitt and contributors. The panel this is
  built on.
- [**NookTheme**](https://github.com/Nookure/NookTheme) — Nookure. The UI fork this theme grew out of; its sidebar
  and layout groundwork are still in here.
- [**CS2-Ptero-Egg**](https://github.com/shmitzas/CS2-Ptero-Egg) — the companion CS2 egg.

## License

Pterodactyl® Copyright © 2015 - 2023 Dane Everitt and contributors.

> Neither Nookure nor this project is affiliated with Pterodactyl® Panel or its contributors.

Pterodactyl code released under the [MIT License](./LICENSE.md).

NookTheme-derived code released under the [GNU GPLv3 License](./NookLicense.md).
