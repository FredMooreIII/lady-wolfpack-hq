# Lady Wolfpack HQ - Roadmap

_Last audited against the live code 2026-09-14 (Claude). Checkboxes below reflect what's actually in the code, not just what's been marked before._

_Updated 2026-09-14 (Claude) — implemented a batch of 10 items Fred requested directly (some overlap the Codex backlog below; see "Added September 14, 2026 (Fred)" for the ones that don't). See that section for two open follow-ups that need Fred's input before they can be finished._

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
- [x] Improve tag colors and contrast. Refined again 2026-09-14 (Claude): the W/L result tags were too transparent to read easily — solid-tinted backgrounds with a visible border swapped in for the previous low-opacity rgba fills.
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
- [x] **1. Condense completed games.** Done 2026-09-14 (Claude), per Fred's own restatement of this item (slimmer / less busy, clearly distinguishable from upcoming games) — implemented as a light blue-tinted, reduced-height row (~30% shorter) with a left accent border, rather than the darker-blue/half-height phrasing originally drafted by Codex. Confirm with Fred that the lighter treatment reads correctly against upcoming games; flip to a darker fill if he wants stronger contrast.
- [ ] **2. Show Past Games toggle.** Add a toggle at the top of the schedule page. When off, hide games already played. Preserve access to those games when the toggle is on.
- [ ] **3. Interactive calendar.** Add an interactive calendar view with color coding for games and practices.
- [ ] **4. MHR rankings and matchup analysis.** Once rankings are available, display each team's MyHockeyRankings (MHR) rating/ranking and investigate using the Schedule Analysis feature on MyHockeyRankings.com for upcoming matchups. Confirm data availability and integration options before implementation.
- [ ] **10. Schedule navigation.** Rename Season to Schedule and make it a dropdown with Season, Tournament, and Calendar views. Calendar depends on item 3.

### Scores and home page
- [ ] **14. Bug: live game scores do not update for other viewers.** Reported September 12, 2026. Confirmed 2026-09-14 (Claude): this is an architecture gap, not a small bug. Since the site moved off the Claude Artifact platform (which had a real cross-viewer publish/sync mechanism) onto static GitHub Pages, bench-control state only writes to `localStorage` and the in-memory seed on the device making the change — nothing pushes it to other viewers in real time. Fixing this needs an actual backend or realtime channel (e.g. Firebase/Supabase, a small serverless function, or similar), not a patch to the existing code. Worth a scoping conversation before anyone starts on it.
- [ ] **5. Goals Scored / Goals Against.** Replace goal differential with Goals Scored / Goals Against, displayed as a pair such as `3-18`. Derive the displayed totals from current stats when implemented. Confirmed not done — Season stat strip still shows "Goal Diff."
- [x] **7. Upcoming-weekend map.** Done 2026-09-14 (Claude). The home map now pins only the current Fri–Sun weekend's games (via the same `homeWeekendGroups()` helper the This Weekend/Recap cards use) instead of the next eight scheduled games; section header retitled "This Weekend's Games Map." HOME/AWAY marker coloring was not added — pins are unstyled by side; flag if that's still wanted.
- [x] **8. Last week recap styling and details.** Done 2026-09-14 (Claude). Recap cards now render with a lighter blue gradient than This Weekend cards, and any card with a final score (both This Weekend and Recap) opens a play-by-play popup on click/tap — see the new item below on replacing the Season page's inline expand with the same popup.
- [ ] **9. This Weekend location markers.** Add clearly visible HOME or AWAY markers to each This Weekend game. Confirmed not done — those cards currently only use a "vs./@" prefix, no badge.

### Resources
- [ ] **6. Champions rink schedule.** Add the filtered Champions Skating Center schedule to Resources: [Champions schedule — 12U-2 hockey](https://schedule.bondsports.co/schedule/Champions-Skating-Center-Schedule?layout=list&eventType=reservation&activityType=hockey&search=12U-2). Confirmed not done.

### Accounts and communication
- [ ] **11. Logins and permissions.** Revisit user accounts, role-based permissions, and assigning parents to players so their player's information can be highlighted for them.
- [ ] **12. Team contacts.** Once logins are available, add contacts for each team. Define visibility and editing permissions as part of that work. Depends on item 11.
- [ ] **13. Crossbar chat feasibility.** Investigate whether Crossbar chat can be shared or embedded on the site for live conversations, including supported integration options and sign-in requirements. Research item; feasibility not yet established.

---

## Added September 14, 2026 (Fred)

_A batch of 10 items Fred requested directly while reviewing the site. Items above that overlap this list are cross-referenced rather than duplicated. All items below were implemented the same day by Claude unless noted._

- [x] Hide the Scores tab from the main nav until cross-device live sync exists (see backlog item 14). It's no longer in the tab bar; Resources → "Live Scoring" now links to it behind the same bench passcode used for bench controls, so only the bench manager can reach it for now.
- [x] Replace the Season page's inline "tap to expand" boxscore with a popup modal showing the same play-by-play, and reuse the same popup on Last Week Recap (and This Weekend) cards that have a final score. Fixes both this item and backlog item 8's "expandable details" ask.
- [x] Make "This Week's Rinks" compute live from the actual weekend schedule instead of the old hand-kept `WEEK_RINKS` list (which had drifted to always show Newington). It now lists every rink the team plays at that weekend, with game counts and a Directions link for each.
- [ ] **Roster photos.** Infrastructure is in place — drop a file named exactly `First Last.jpeg` (matching each player's roster name) into `assets/roster-photos/`, and it will appear automatically as a circular photo badge on that player's roster card, layered over the jersey art (jersey stays as-is if a photo is missing or fails to load, no broken-image icon). **Blocked:** Claude does not have access to Fred's local photo folder from this session — Fred needs to either attach the photos here or connect that folder from the Claude desktop app so they can be added to the repo.
- [~] **Team Fund live balance.** Investigated 2026-09-14 (Claude): the displayed balance was hardcoded and stale ($784.90 shown vs. $1,463.90 actual per the spreadsheet's most recent transaction row as of 9/10/2026) — this was never a live figure, just periodic manual updates. Applied a stopgap: corrected the displayed balance to $1,463.90 and added a small "updated manually, not live" note under it. A true live pull needs Fred to turn on Google Sheets' "Publish to web" for that tab (File → Share → Publish to web), which produces a public CSV/JSON URL the site can `fetch()` client-side with no backend — Claude cannot enable that setting itself via the Drive connector. **Needs Fred's decision:** turn on Publish to web for a real live balance, or keep this as a periodic manual/weekly update.

---

## Added September 21, 2026 (Fred)

_Three feature questions Fred asked directly. First two implemented and verified with Playwright; third is a recommendation only, not yet built._

- [x] **Game MVP section.** New section on the Home page, between Last Week Recap and Upcoming Practices. Data lives in `data/mvp.js` — one entry per game with an MVP (supports co-MVPs and an optional shared photo for that case), section hides itself entirely when the list is empty. Shipped with the Sep 20 West Haven co-MVP entry (Ana Straker & Adde Zuck) using a shared photo Fred provided (`assets/mvp-photos/2026-09-20-west-haven.jpg`).
- [x] **Player of the Week section.** New section on the Home page, below Upcoming Practices. Reuses the existing Roster jersey/stat flip-card component for the named player plus a curated set of her answers from the "Get to Know Me" Google Sheet (spreadsheet `1SrySqsEVRaBC_PLDmeFB6-VFQ9CSm0cmFL-Oq05IQd4`, gid `502291596`). Data lives in `data/potw.js`; set to `null` to hide. Shipped with Nia Lorenzi as the first pick.
- [ ] **Video section.** Not implemented — Fred has a Google Drive folder of team videos shared with him and asked for the best way to get them on the site. Recommended YouTube (unlisted) over Drive-embed (permission risk since Fred doesn't own that folder) and self-hosting (GitHub Pages/repo size is a bad fit for video). Needs Fred to pick a path and provide at least one video link before this can be built.

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
- Batch of 10 items Fred requested directly, implemented 2026-09-14 (Claude) — see "Added September 14, 2026 (Fred)" and the backlog items it cross-references above. Verified with Playwright (gate/bench-passcode flows, popup boxscore on both Season and Home cards, slimmed row heights, dynamic rink list, corrected Team Fund balance) before delivery.
- Game MVP + Player of the Week Home sections, implemented 2026-09-21 (Claude) — see "Added September 21, 2026 (Fred)" above. Verified with Playwright (empty-state hiding, populated rendering, POTW flip interaction) before delivery.
