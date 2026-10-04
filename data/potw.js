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
  name: "Olivia Schortman",
  weekOf: "Week of Oct 5, 2026",
  answers: [
    {q:"Position & favorite thing about it", a:"Defense — stopping a breakaway"},
    {q:"Stick tape color", a:"Black"},
    {q:"Invent one hockey rule for a day", a:"Get physical, don’t be soft"},
    {q:"Funniest moment at practice/a game", a:"Falling in a celly"},
    {q:"Pre-game ritual", a:"Wear my lucky hair tie"},
    {q:"Outside of hockey", a:"Play lacrosse"},
    {q:"Superpower she'd want", a:"See into the future"},
    {q:"Favorite movie/show", a:"Harry Potter"},
    {q:"Favorite candy", a:"Skittles"},
    {q:"Favorite color", a:"Yellow"},
    {q:"Hobby / collection", a:"Bracelets"},
  ],
};
