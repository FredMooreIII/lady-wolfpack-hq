# Lady Wolfpack HQ - Roadmap

_Last audited against the live code 2026-09-14 (Claude). Checkboxes below reflect what's actually in the code, not just what's been marked before._

## Current Priorities

### High Priority
- [x] Fix game data saving after End Game. Ordered/versioned persistence prevents stale async publishes and restores the newest valid saved state.
- [x] Make sure completed games remain saved in schedule/history. End Game archives remain linked to schedule results across reloads.
- [x] Verify Next Period resets the clock correctly.
- [x] Add overtime and shootout support.
- [x] Make shootout goals count correctly toward team score.
- [x] Add 1:00 and 1:30 penalty options.

### Bench Manager
- [x] Make Start/Pause controls larger and easier to use.
- [x] Separate Wolfpack and Opponent controls.
- [x] Each side has Goal + Penalty buttons.
- [x] Add Goalie Change event.
- [x] Allow players to be marked absent.
- [x] Automatically update games played when a game is archived.
- [x] Improve period controls.
- [ ] After the 3rd period, allow End Game / Overtime / Shootout. Partial: all three actions exist and work, but Overtime/Shootout buttons are always visible rather than only appearing after period 3 ends.

### Season Page
- [x] Improve spacing and readability.
- [x] Make completed games visually different from upcoming games.
- [x] Improve tag colors and contrast.
- [ ] Add A-Z / Z-A sorting where appropriate. Done on the Stats page (6 sort options); no sort control on the Season page itself — the schedule is chronological, so unclear this is needed there. Confirm intent before building.
- [x] Make arrival time exactly 1 hour before game time.
- [x] Remove outdated TBD/opponent notes.

### Statistics
- [x] Improve player stats table sorting.
- [x] Separate goalie statistics from skater statistics.
- [x] Track goalie games played.
- [x] Include appropriate goalie stats beyond shots and saves (Starts, Relief, W-L, Shutouts, GA/GP).

### Live Game Experience
- [x] Add a red LIVE banner when a game is active.
- [x] Show current score in the banner.
- [x] Make the banner clickable to open the live score/game page.

### Design / UI
- [x] Use white or off-white as the main site background.
- [x] Improve mobile usability.
- [x] Improve contrast where red text appears on dark backgrounds.
- [x] Keep branding consistent throughout the site.

### Technical
- [ ] Add or verify favicon. Not done — no favicon anywhere in the site.
- [x] Preserve all existing roster and game data.
- [x] Avoid breaking the live GitHub-hosted version.

---

## Planned / Backlog

_Added September 9, 2026 (Codex). All items below are planned only and have not been implemented. Implementation should begin only when requested._

### Schedule presentation
- [ ] **1. Condense completed games.** Show played season games in a slightly darker blue and at approximately half their current height. Use a slightly thicker border between weekends to make weekend groups easier to distinguish.
- [ ] **2. Show Past Games toggle.** Add a toggle at the top of the schedule page. When off, hide games already played. Preserve access to those games when the toggle is on.
- [ ] **3. Interactive calendar.** Add an interactive calendar view with color coding for games and practices.
- [ ] **4. MHR rankings and matchup analysis.** Once rankings are available, display each team's MyHockeyRankings (MHR) rating/ranking and investigate using the Schedule Analysis feature on MyHockeyRankings.com for upcoming matchups. Confirm data availability and integration options before implementation.
- [ ] **10. Schedule navigation.** Rename Season to Schedule and make it a dropdown with Season, Tournament, and Calendar views. Calendar depends on item 3.

### Scores and home page
- [ ] **14. Bug: live game scores do not update for other viewers.** Reported September 12, 2026. Confirmed 2026-09-14 (Claude): this is an architecture gap, not a small bug. Since the site moved off the Claude Artifact platform (which had a real cross-viewer publish/sync mechanism) onto static GitHub Pages, bench-control state only writes to `localStorage` and the in-memory seed on the device making the change — nothing pushes it to other viewers in real time. Fixing this needs an actual backend or realtime channel (e.g. Firebase/Supabase, a small serverless function, or similar), not a patch to the existing code. Worth a scoping conversation before anyone starts on it.
- [ ] **5. Goals Scored / Goals Against.** Replace goal differential with Goals Scored / Goals Against, displayed as a pair such as `3-18`. Derive the displayed totals from current stats when implemented. Confirmed not done — Season stat strip still shows "Goal Diff."
- [ ] **7. Upcoming-weekend map.** Limit the home page map to the upcoming weekend instead of the next eight games. Match HOME markers to the site's home color and AWAY markers to its away color.
- [ ] **8. Last week recap styling and details.** Give last week's recap a slightly lighter background than This Weekend games. Add expandable play-by-play details like those on the Scores page. Confirmed not done — recap and This Weekend cards currently share identical styling with no expand affordance.
- [ ] **9. This Weekend location markers.** Add clearly visible HOME or AWAY markers to each This Weekend game. Confirmed not done — those cards currently only use a "vs./@" prefix, no badge.

### Resources
- [ ] **6. Champions rink schedule.** Add the filtered Champions Skating Center schedule to Resources: [Champions schedule — 12U-2 hockey](https://schedule.bondsports.co/schedule/Champions-Skating-Center-Schedule?layout=list&eventType=reservation&activityType=hockey&search=12U-2). Confirmed not done.

### Accounts and communication
- [ ] **11. Logins and permissions.** Revisit user accounts, role-based permissions, and assigning parents to players so their player's information can be highlighted for them.
- [ ] **12. Team contacts.** Once logins are available, add contacts for each team. Define visibility and editing permissions as part of that work. Depends on item 11.
- [ ] **13. Crossbar chat feasibility.** Investigate whether Crossbar chat can be shared or embedded on the site for live conversations, including supported integration options and sign-in requirements. Research item; feasibility not yet established.

---

## Collaboration Status

### ChatGPT
- No task assigned yet.

### Claude
- No task assigned yet.

---

## Completed
- Shared AGENTS.md created.
- Shared ROADMAP.md created.
- Full Current Priorities audit against live code (2026-09-14, Claude) — see checkboxes above.
