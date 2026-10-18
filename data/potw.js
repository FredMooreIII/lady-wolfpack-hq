// Lady Wolfpack HQ -- Player of the Week, shown on the Home page right below
// "Upcoming Practices". Update PLAYER_OF_WEEK each week:
//   - `name` must match a name in data/roster.js exactly -- it reuses her
//     existing Roster jersey/stat flip-card automatically, photo included.
//   - `weekOf` is the label shown next to the section heading (the week the
//     player is featured -- NOT the date she filled out the form). Leave it
//     "" for no label.
//   - `answers` are pulled from the "Get to Know Me" Google Sheet
//     (spreadsheet 1SrySqsEVRaBC_PLDmeFB6-VFQ9CSm0cmFL-Oq05IQd4, gid=502291596)
//     -- include as many or as few of her answers as you want, in any order.
// Set PLAYER_OF_WEEK to null to hide the whole section.

const PLAYER_OF_WEEK = {
  name: "Mairead Hornish",
  weekOf: "Week of Oct 19, 2026",
  answers: [
    {q:"Position & favorite thing about it", a:"Center — winning the face-offs"},
    {q:"Stick tape color", a:"Red"},
    {q:"Invent one hockey rule for a day", a:"No icing"},
    {q:"Funniest moment at practice/a game", a:"One of my shots knocked the opposing goalie’s water bottle off the net"},
    {q:"Favorite player", a:"Connor McDavid"},
    {q:"Pre-game ritual", a:"Listen to pump up music"},
    {q:"Outside of hockey", a:"Flag football and soccer"},
    {q:"Superpower she'd want", a:"Flying"},
    {q:"Favorite movie/show", a:"Toy Story"},
    {q:"Favorite candy", a:"Starburst"},
    {q:"Favorite color", a:"Red"},
    {q:"Hobby / collection", a:"Word searches"},
  ],
};
