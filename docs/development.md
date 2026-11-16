# Development

Contributor notes: the theme's rules, the release workflow and keeping up with upstream. Operator documentation lives in
the [wiki](https://github.com/shmitzas/Pterodactyl-CS2Panel/wiki); building from source is on its
[Building](https://github.com/shmitzas/Pterodactyl-CS2Panel/wiki/Building) page.

The panel lives in `src/`, laid out as upstream's repository root, and the panel paths below are relative to it.
`.github/`, `docs/`, the licences and `release.sh` stay at the repository root.

## Theme

Colours, fonts, radii, spacing and motion are custom properties in `public/themes/pterodactyl/css/cs2-tokens.css`.
`cs2.css` imports it into the client build, and the admin layout links it before `cs2-admin.css`. `tailwind.config.js`
mirrors the colours in hex (`bg-paper-2`, `text-accent-text`, `border-rule`) so opacity modifiers work in twin.macro;
change the two together. The panel runs Tailwind 3.0, whose opacity modifiers only accept the default scale:
`bg-accent/20` works, `bg-accent/15` silently generates nothing.

| Token | Use |
|-------|-----|
| `paper`, `paper-2`, `paper-3`, `raise` | Page, card, sunken well (console, inputs, meter tracks) and raised surfaces |
| `ink`, `ink-2`, `muted` | Text, strongest to weakest |
| `rule`, `rule-2` | Borders |
| `accent` | **Every interactive affordance** — primary buttons, links (`accent-text`), focus rings, active nav |
| `cpu`, `mem`, `disk`, `net` | One hue per metric, used by its tile, label, meter and chart on every screen |
| `ok`, `warn`, `bad` | Semantic only — status, usage bands, and the start and destructive actions |

`cs2.css` also holds the shared surfaces: `cs2-card` (with `cs2-card-head`, `-title`, `-sub` and `-body`),
`cs2-page-head`, `cs2-tile` (icon tile), `cs2-pill` (status), `cs2-tag`, `cs2-seg` (segmented toggle), `cs2-skel`
(loading placeholder) and `cs2-meter` (fill from `--v`, 0–1; `usageBand` in `lib/usage.ts` adds the amber and red
bands). A `cs2-tone-accent|ok|warn|bad|off|cpu|mem|disk|net` class sets their `--tone`, and `cs2-tone-text` colours
text with it. Two rules apply when using them:

- Never put `backdrop-filter` on an element that contains a `Tooltip`: tooltips are `position: fixed` and would be
  placed relative to that element. `ModalMask` has one, so a `Modal` can't hold a tooltip; `Dialog` keeps its blur on
  a sibling layer.
- Don't put Tailwind display utilities (`hidden`, `sm:inline-flex`, ...) on `cs2-tile`, `cs2-pill`, `cs2-tag` or
  `cs2-meter` elements; `cs2.css` loads after Tailwind and its `display` wins. Toggle visibility on a wrapper instead.

Fonts are linked from `resources/views/partials/fonts.blade.php`, not bundled: Clash Grotesk from Fontshare, its only
host, and Manrope and JetBrains Mono from Google Fonts.

### Admin theme

`public/themes/pterodactyl/css/cs2-admin.css` is plain CSS over AdminLTE / Bootstrap 3, not part of the webpack build.

- It and `cs2-tokens.css` must stay the last stylesheets in `resources/views/layouts/admin.blade.php`, tokens first.
  Its rules are scoped to `body.cs2-admin` so they outrank the AdminLTE and Bootstrap selectors they replace.
- Admin boxes get no `backdrop-filter`: it would make each box a stacking context and hide its tooltips and dropdowns
  under the next box.
- Three things are shared with the client and must change together: the base font size (`html` at 100%, over
  Bootstrap's 10px), the header height and sidebar width (`--cs2-header` and `--cs2-sidebar`, the tokens' `--topbar`
  and `--sidebar`), and the background image rule (`.cs2-admin::before`, `body::before` in `GlobalStylesheet.ts`).

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

Both call `release.sh`, which packs `src/` and the licences. `tests/` holds upstream's PHPUnit suite, which CI does not
run.

## Upstream

Upstream fixes are not picked up automatically. Watch the
[Pterodactyl advisories](https://github.com/pterodactyl/panel/security/advisories) and merge each new release into
`src/`:

```bash
git remote add upstream https://github.com/pterodactyl/panel.git
git fetch upstream --tags
git merge -X subtree=src <tag>
```

`-X subtree=src` maps upstream's repository root onto `src/`. A plain merge leaves upstream's new files at the
repository root, or in conflict.

The fork's migrations add columns only: `mounts.mount_on_install` and `mounts.auto_mount`, `subusers.file_rules` and
`users.dashboard_preferences`. Nothing upstream is altered, so a stock panel of the same version switches to this build
with `php artisan migrate`. `mounts.mount_on_install` is unused: Wings never mounts custom mounts into the install
container, so a mount limited to installation could not reach the install script.
