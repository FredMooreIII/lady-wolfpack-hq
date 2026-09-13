---
name: postgameIG
description: Build the Lady Wolfpack postgame Instagram graphic for the most recent game
user-invocable: true
---

Read `.claude/skills/postgame-graphic/SKILL.md` and treat it as the authoritative instructions for this workflow.

Then:

1. Read the latest `index.html` in this repository.
2. Determine the most likely recently played Lady Wolfpack game.
3. Identify the opponent and any stored opponent logo.
4. Ask only:

   "I believe the game was vs. [OPPONENT]. What was the final score, and do you have a new photo you want to use?"

5. After the user provides the score and optionally a photo:
   - Follow `.claude/skills/postgame-graphic/SKILL.md` exactly.
   - Use:
     `.claude/skills/postgame-graphic/template/template.html`
     `.claude/skills/postgame-graphic/template/fill_template.py`
   - Do not redesign the layout.
   - Do not approximate or redraw logos.
   - Wolfpack score stays left.
   - Opponent score stays right.
   - Do not add GAME numbers.
   - Do not add league, tournament, CHC, NGHL, or event branding unless explicitly requested.
   - Generate the top result line and bottom contextual line according to SKILL.md.
   - Highlight only the Wolfpack score box when the Wolfpack wins.
   - On a loss or tie, do not highlight either score box.

6. Render and export the final graphic at 1080×1080.
7. Present the finished graphic to the user.