# Lady Wolfpack Postgame Graphic

## Purpose

Create a consistent Instagram postgame score graphic for the Hartford Junior Lady Wolfpack U12 Tier 2 team using the established postgame template.

This is a TEMPLATE-BASED workflow, not a new-design workflow.

The graphic should look substantially the same after every game. Only game-specific information, opponent branding, result copy, and the game photo should change.

---

## Primary Source of Truth

The Lady Wolfpack HQ GitHub repository is the primary source of truth.

Repository:
FredMooreIII/lady-wolfpack-hq

Primary file:
index.html

Always read the latest version of the repository before preparing a postgame graphic.

Use index.html to determine, whenever available:

- Lady Wolfpack schedule
- opponent name
- opponent team level
- date
- home/away status
- location
- opponent logo
- Lady Wolfpack logo
- season record
- other game metadata already maintained by the site

Do NOT search CHC, Google, Crossbar, or other websites for an opponent logo if the logo already exists in the Lady Wolfpack HQ project.

Do NOT replace an existing logo with an AI-generated approximation.

The logo contained in the Lady Wolfpack HQ project is authoritative.

---

## Required User Interaction

After reading the current schedule, identify the game Claude believes the user just played.

Ask ONLY:

"I believe the game was vs. [OPPONENT]. What was the final score, and do you have a new photo you want to use?"

Do not ask the user for information already available in the Lady Wolfpack HQ project.

The user's response should normally provide:

- confirmation or correction of opponent
- Lady Wolfpack final score
- opponent final score
- whether a new photo should be used

If the user uploads a new photo, use it.

If the user says there is no new photo, use the standard fallback photo defined for the template.

Do not ask additional questions unless the opponent cannot reasonably be determined or a required asset is genuinely unavailable.

---

## Established Graphic Layout

The existing postgame graphic is the master visual reference.

The template should maintain the same visual system every game:

- Instagram square format
- 1080 × 1080
- dark navy Wolfpack background
- red, white, navy and ice-blue team palette
- full-width or large central team/game photo
- dark navy photo scrim/gradient for readability
- opponent matchup heading above the photo
- short result statement beneath the matchup heading
- Lady Wolfpack logo on the LEFT side of the score area
- opponent logo on the RIGHT side of the score area
- Lady Wolfpack score on the LEFT
- opponent score on the RIGHT
- FINAL indicator centered between scores
- short contextual result statement beneath the score
- social branding at the bottom

Do not redesign this layout from game to game.

Do not randomly change:
- typography hierarchy
- score box proportions
- logo placement
- score placement
- margins
- background treatment
- visual style
- color palette

Consistency is more important than novelty.

---

## Matchup Heading Rules

NEVER display:

GAME 1
GAME 2
GAME 3
or any other game-count heading.

The main matchup heading should be:

VS [OPPONENT]

If useful and supported by the schedule data, place the opponent level below it, such as:

12U AA

or

12U B

Do not duplicate information unnecessarily.

---

## League / Tournament Branding Rules

By default, DO NOT include:

- CHC
- CHC League
- NGHL
- tournament names
- tournament logos
- tournament locations
- league names
- event names

Only include league or tournament branding when the user explicitly says that the graphic should reference that event.

Examples:

If user says:
"This was our NGHL Labor Day Challenge game."

Then event branding may appear.

If user simply provides:
"We beat Wallingford 4-2."

Do not add CHC or any league reference.

---

## Logo Rules

Logos are protected visual assets.

Always use the actual Lady Wolfpack logo from the Lady Wolfpack HQ project.

Always use the actual opponent logo referenced by the Lady Wolfpack HQ project when available.

NEVER:

- redraw a logo
- generate a logo using AI
- approximate a logo
- modify text inside a logo
- substitute a similar mascot
- invent an opponent logo
- use a logo found through image generation

If an opponent logo is genuinely missing from the project, tell the user the logo asset is missing and ask for the logo file.

Do not silently substitute another image.

---

## Photo Rules

If the user supplies a new photo:

Use the uploaded photo as the main image.

Preserve the people in the photo naturally.

Do not AI-recreate the players.

Do not replace faces.

Do not add fake players.

Do not significantly alter uniforms.

Allowed photo adjustments include:

- cropping
- repositioning
- exposure correction
- contrast correction
- slight sharpening
- dark overlay/scrim
- subtle vignette
- background darkening for text readability

Keep edits realistic.

If no new photo is supplied, use the established fallback team image.

---

## Score Rules

Wolfpack is ALWAYS presented on the LEFT side of the scoreboard.

Opponent is ALWAYS presented on the RIGHT side.

This rule applies regardless of home or away status.

Example:

[LADY WOLFPACK LOGO]   4   FINAL   2   [OPPONENT LOGO]

Lady Wolfpack score must correspond to the left score.

Opponent score must correspond to the right score.

Double-check this before exporting.

---

## Result Copy

Generate two short pieces of contextual copy.

### Top Result Line

This appears near the matchup heading.

Examples:

SHUTOUT WIN. THE PACK RESPONDS.

BIG ROAD WIN.

HOME ICE. PACK WIN.

BATTLE WON.

THE PACK GETS IT DONE.

Do not use exactly the same line every game.

Keep it short and athletic.

Avoid cheesy or overly dramatic language.

### Bottom Result Line

This appears beneath the scoreboard.

It should reflect the specific result or season context.

Examples:

FIRST W OF THE SEASON. LET'S KEEP ROLLING.

BACK-TO-BACK WINS. KEEP BUILDING.

HOME OPENER. HOME WIN.

TWO POINTS EARNED. ON TO THE NEXT.

THE WORK CONTINUES.

Use season record/context from Lady Wolfpack HQ when useful.

Do not claim:
- first win
- winning streak
- shutout
- comeback
- home win
- road win

unless the available data supports the claim.

---

## Shutout Rule

Only use the word SHUTOUT when the opponent scored 0.

Example:

Wolfpack 3
Opponent 0

Allowed:
SHUTOUT WIN.

Example:

Wolfpack 3
Opponent 1

Not allowed:
SHUTOUT WIN.

---

## Win / Loss Language

If Lady Wolfpack score > opponent score:
Use winning language.

If Lady Wolfpack score < opponent score:
Do not use celebratory win language.

For a loss, use constructive copy such as:

KEEP BUILDING.

BACK TO WORK.

THE WORK CONTINUES.

NEXT GAME MENTALITY.

Do not use language that embarrasses the players or opponent.

---

## Social Branding

Use:

@ladywolfpack2015

Primary hashtag:

#hartfordjrwolfpack

Do not use:

#hartfordwolfpack

If hashtags are included, use no more than five.

Recommended general set:

#hartfordjrwolfpack
#ladywolfpack
#girlshockey
#u12hockey

Add an event-specific hashtag only when appropriate.

---

## Quality Control Before Export

Before producing the final graphic, verify:

1. Correct opponent
2. Correct Wolfpack score
3. Correct opponent score
4. Wolfpack score is on the LEFT
5. Opponent score is on the RIGHT
6. Correct opponent logo
7. Correct Lady Wolfpack logo
8. No AI-generated logos
9. No GAME # heading
10. No league/tournament reference unless explicitly requested
11. Correct spelling of opponent
12. Result copy matches the actual result
13. Photo is the user-provided photo when supplied
14. Graphic dimensions are 1080 × 1080
15. Layout remains consistent with the master template

If any of these checks fail, fix the graphic before presenting it.

---

## Workflow

When invoked:

1. Pull/read the latest Lady Wolfpack HQ repository.
2. Read index.html.
3. Determine the most likely recently played game from the schedule.
4. Locate that opponent's exact stored logo.
5. Locate the exact Lady Wolfpack logo.
6. Ask the user:

   "I believe the game was vs. [OPPONENT]. What was the final score, and do you have a new photo you want to use?"

7. Receive confirmation, score and optional photo.
8. Populate the established postgame template.
9. Generate contextual result copy.
10. Run the Quality Control checklist.
11. Export the final 1080 × 1080 image.
12. Present the finished image.
13. If requested, provide an Instagram caption separately.

Do not restart the design process from scratch.

Do not ask unnecessary questions.

Do not browse for information already stored in Lady Wolfpack HQ.

---

## Example

Schedule indicates:

September 12
Lady Wolfpack vs Wallingford Hawks Blue
Home
2:00 PM
Champions Skating Center

Claude asks:

"I believe the game was vs. Wallingford Hawks Blue. What was the final score, and do you have a new photo you want to use?"

User:

"Yes. We won 4-2. Use this photo."

Claude should then:

- use Wallingford Hawks Blue's stored logo
- use exact Lady Wolfpack logo
- place Wolfpack score 4 on left
- place Wallingford score 2 on right
- use uploaded photo
- generate appropriate win copy
- omit GAME #
- omit CHC branding
- omit tournament branding
- export the standard postgame graphic

No additional questions should normally be necessary.