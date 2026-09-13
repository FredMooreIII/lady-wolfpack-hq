---
description: Build the Lady Wolfpack postgame Instagram graphic for the most recent game
---

Do not invoke or call a registered skill by name.

Instead, directly open and read:

`.claude/skills/postgame-graphic/SKILL.md`

Treat that file as the authoritative instructions for this workflow and follow it exactly.

Then do the following:

1. Read the latest `index.html` in this repository.
2. Determine the most likely recently played Lady Wolfpack game from the schedule/data in that file.
3. Identify the opponent and any opponent logo already stored in the repository or referenced by the site data.
4. Ask the user only:

   "I believe the game was vs. [OPPONENT]. What was the final score, and do you have a new photo you want to use?"

5. After the user provides the score and optionally a photo:
   - Follow all rules in `.claude/skills/postgame-graphic/SKILL.md`.
   - Use the existing reusable template:
     - `.claude/skills/postgame-graphic/template/template.html`
     - `.claude/skills/postgame-graphic/template/fill_template.py`
   - Do not redesign the graphic.
   - Do not create alternate layout rules.
   - Do not approximate or redraw logos.
   - Wolfpack score stays on the left.
   - Opponent score stays on the right.
   - Do not add GAME numbers.
   - Do not add league, tournament, CHC, NGHL, or event branding unless the user explicitly requests it.
   - Automatically generate the short top result line and contextual bottom line according to SKILL.md.
   - Highlight only the Wolfpack score box when the Wolfpack wins.
   - On a loss or tie, do not highlight either score box.

6. Render the completed graphic using the existing template.

7. Export the final Instagram graphic at 1080×1080.

8. Present the finished graphic to the user.