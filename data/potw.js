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
  name: "Bailey Pelletier",
  weekOf: "Week of Oct 26, 2026",
  answers: [
    {q:"Position & favorite thing about it", a:"Center — we get to go all around the ice where needed and always be on the puck for more shots"},
    {q:"Stick tape color", a:"Dark blue"},
    {q:"Invent one hockey rule for a day", a:"No penalties"},
    {q:"Funniest moment at practice/a game", a:"IDK"},
    {q:"Favorite player", a:"I like the Wolfpack and the Bruins"},
    {q:"Pre-game ritual", a:"I put on my gear in a specific order or I just can't function!"},
    {q:"Outside of hockey", a:"Soccer, playing with friends"},
    {q:"Superpower she'd want", a:"Flying"},
    {q:"Favorite movie/show", a:"A Dog's Purpose and a Dog's Journey"},
    {q:"Favorite candy", a:"Lollipops"},
    {q:"Favorite color", a:"Blue"},
    {q:"Hobby / collection", a:"Barbies and reading"},
  ],
};
