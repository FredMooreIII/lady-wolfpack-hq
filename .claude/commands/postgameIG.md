---
description: Build the Lady Wolfpack postgame Instagram graphic for the most recent game
---

Launch the postgame Instagram graphic workflow. This command does not define
its own rules — `.claude/skills/postgame-graphic/SKILL.md` is the single
source of truth for layout, logo, score-position, event-branding, and copy
rules. Do not redesign the graphic or improvise alternate rules here.

1. Read and follow `.claude/skills/postgame-graphic/SKILL.md` in full.
2. Read the latest `index.html` in this repository to identify the most
   likely recently played Lady Wolfpack game, the opponent, and the
   opponent's stored logo, per SKILL.md's sourcing rules.
3. Begin by asking only:

   "I believe the game was vs. [OPPONENT]. What was the final score, and do you have a new photo you want to use?"

4. After the user provides the score and (optionally) a photo, populate the
   existing reusable template under `.claude/skills/postgame-graphic/template/`
   (`template.html` + `fill_template.py`) — do not hand-build a new layout.
5. Follow all logo, layout, score-position, event-branding, and copy rules
   defined in SKILL.md exactly as written there.
6. Render and export the final graphic at 1080×1080 and present it.
