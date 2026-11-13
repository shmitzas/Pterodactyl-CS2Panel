# Development

Contributor notes: the theme's rules, the release workflow and keeping up with upstream. Operator documentation lives in
the [wiki](https://github.com/shmitzas/Pterodactyl-CS2Panel/wiki); building from source is on its
[Building](https://github.com/shmitzas/Pterodactyl-CS2Panel/wiki/Building) page.

## Theme

Colours come from the RGB-triplet variables in `resources/scripts/assets/css/cs2.css` (`rgba(var(--cs2-accent), 0.2)`)
or the Tailwind `cs2-*` colours. The panel runs Tailwind 3.0, whose opacity modifiers only accept the default scale:
`bg-cs2-accent/20` works, `bg-cs2-accent/15` silently generates nothing.

| Token | Use |
|-------|-----|
| `--cs2-accent` / `cs2-accent` | Orange. **Every interactive affordance** — links, focus rings, hover borders, active nav, progress, icon highlights |
| `--cs2-info` / `cs2-info` | Cyan. Informational notices only, never ordinary chrome |
| `--cs2-success`, `--cs2-warning`, `--cs2-danger` | Green / gold / red, semantic only |

Accent and info are a deliberate split, so an element can be marked as *merely informational*. Reach for `cs2-accent`
unless the element is telling the user something.

`cs2.css` also holds the shared surfaces: `glass-panel` (static section), `glass-row` (list row, no blur), `cs2-tile`
(icon tile) and `cs2-badge` (status pill), coloured with a `cs2-tone-info|success|warning|danger|muted` class. Two rules
apply when using them:

- Never put `backdrop-filter` on an element that contains a `Tooltip`: tooltips are `position: fixed` and would be
  placed relative to that element. `glass-panel` keeps its blur on `::before` for this reason.
- Don't put Tailwind display utilities (`hidden`, `sm:inline-flex`, ...) on `cs2-tile` / `cs2-badge` elements;
  `cs2.css` loads after Tailwind and its `display` wins. Toggle visibility on a wrapper instead.

### Admin theme

`public/themes/pterodactyl/css/cs2-admin.css` is plain CSS over AdminLTE / Bootstrap 3, not part of the webpack build.

- It must stay the last stylesheet in `resources/views/layouts/admin.blade.php`, and its rules are scoped to
  `body.cs2-admin` so they outrank the AdminLTE and Bootstrap selectors they replace.
- Admin boxes get no `backdrop-filter`: it would make each box a stacking context and hide its tooltips and dropdowns
  under the next box.
- Two values are shared with the client and must change together: the base font size (`html` at 106.25%, also in
  `cs2.css`) and the darkening overlay on the background image (also in `GlobalStylesheet.ts`).

## Releasing

Either push a tag:

```bash
git tag v1.15.2-cs2.1
git push origin v1.15.2-cs2.1
```

…or open **Actions → Release → Run workflow** and enter the tag; the workflow creates it on the head of the branch you
pick. The release carries `cs2-panel-<tag>.zip` and its `.sha256`. Tag format: `v<upstream version>-cs2.<n>`.
`config/app.php` carries the upstream version it tracks, so the admin area's update check compares against the matching
Pterodactyl release.

| Workflow | Runs on | Does |
|----------|---------|------|
| `.github/workflows/build.yaml` | Push or PR to `main` | Builds the zip and keeps it as an Actions artifact for 3 days |
| `.github/workflows/release.yaml` | `v*` tag or manual run | Builds the zip and publishes it as a GitHub release |

Both call `release.sh`. `tests/` holds upstream's PHPUnit suite, which CI does not run.

## Upstream

Upstream fixes are not picked up automatically. Watch the
[Pterodactyl advisories](https://github.com/pterodactyl/panel/security/advisories) and rebase when a new release lands.

The fork's migrations add columns only: `mounts.mount_on_install` and `mounts.auto_mount`, `subusers.file_rules` and
`users.dashboard_preferences`. Nothing upstream is altered, so a stock panel of the same version switches to this build
with `php artisan migrate`. `mounts.mount_on_install` is unused: Wings never mounts custom mounts into the install
container, so a mount limited to installation could not reach the install script.
