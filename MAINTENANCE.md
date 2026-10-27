# Profile and arcade maintenance

`README.md` renders on the GitHub profile. GitHub README pages do not execute JavaScript, so the contribution skyline links to the playable GitHub Pages arcade.

- `assets/hero-v2.svg`: original animated vector cover; no portrait is used.
- `assets/stack/`: technology logos reused from the owner's portfolio. Trademarks belong to their respective owners.
- `assets/contribution-snake.svg`: animated activity grid embedded directly in the README. `assets/stack-panel.svg` displays the technology logos.
- `arcade/`: static, dependency-free game and landing page. Google Fonts supplies the optional web fonts; system fonts are the fallback.
- `scripts/build-activity.mjs`: retrieves the public profile's contribution calendar through GitHub GraphQL and creates the skyline and JSON snapshot. It never modifies contributions.

## Preview

```sh
python -m http.server 5181 --directory arcade
```

Open `http://localhost:5181`. Snake supports arrow keys/WASD, Space to pause, R to restart, swipe gestures and directional touch buttons. The game pauses when its tab is hidden. The high score is stored only in that browser's local storage; blocked storage does not prevent play.

## Refresh and publish

With Node 22+, provide a GitHub token through `GH_TOKEN` and run:

```sh
node scripts/build-activity.mjs
node scripts/build-profile-art.mjs
node --check arcade/game.js
```

Never commit a token. The GitHub Actions workflow uses the repository's temporary `github.token`, builds fresh public activity on each push or manual run, and deploys only `arcade/` to GitHub Pages. Enable Pages with GitHub Actions as the build source. The README's committed skyline refreshes when the generated asset is committed; its footer records the snapshot date. The hosted arcade is regenerated on deployment.

Manual verification: start, change direction, pause/resume, collide with a wall, restart, check touch controls at narrow widths, and confirm keyboard focus stays usable. The activity-unavailable message must leave the game playable. Animations respect `prefers-reduced-motion`.

Developer background was adapted from the owner's portfolio source and GitHub profile. Keep personal history, research status, and contact links current when updating the README.
