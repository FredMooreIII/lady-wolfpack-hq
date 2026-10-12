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
  name: "Khloe Starkey",
  weekOf: "Week of Oct 12, 2026",
  answers: [
    {q:"Position & favorite thing about it", a:"Winger — you can make a lot of goals"},
    {q:"Stick tape color", a:"White"},
    {q:"Invent one hockey rule for a day", a:"No penalties so you can do anything"},
    {q:"Funniest moment at practice/a game", a:"My stick got caught in a space in the boards and it tripped me"},
    {q:"Favorite player", a:"Alex Ovechkin"},
    {q:"Pre-game ritual", a:"Pray that we win"},
    {q:"Outside of hockey", a:"Camping and fishing"},
    {q:"Superpower she'd want", a:"To fly"},
    {q:"Favorite movie/show", a:"Coraline"},
    {q:"Favorite candy", a:"Twix"},
    {q:"Favorite color", a:"Baby blue"},
    {q:"Hobby / collection", a:"Reading and hockey"},
  ],
};
