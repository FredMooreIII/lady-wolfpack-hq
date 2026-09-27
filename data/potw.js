// Lady Wolfpack HQ -- Player of the Week, shown on the Home page right below
// "Upcoming Practices". Update PLAYER_OF_WEEK each week:
//   - `name` must match a name in data/roster.js exactly -- it reuses her
//     existing Roster jersey/stat flip-card automatically, photo included.
//   - `weekOf` is just a label shown next to the section heading.
//   - `answers` are pulled from the "Get to Know Me" Google Sheet
//     (spreadsheet 1SrySqsEVRaBC_PLDmeFB6-VFQ9CSm0cmFL-Oq05IQd4, gid=502291596)
//     -- pick whichever of her answers you want to feature, in any order.
// Set PLAYER_OF_WEEK to null to hide the whole section.

const PLAYER_OF_WEEK = {
  name: "Mackenzie Moore",
  weekOf: "Week of Sep 27, 2026",
  answers: [
    {q:"Position & favorite thing about it", a:"Forward; I get to skate everywhere"},
    {q:"Stick tape color", a:"Blue or white"},
    {q:"Pre-game ritual", a:"Tie my skates"},
    {q:"Invent one hockey rule for a day", a:"No penalties"},
    {q:"Favorite hockey player", a:"Bailey — because she’s my sister"},
    {q:"Funniest moment at practice/a game", a:"Falling over"},
    {q:"Outside of hockey", a:"Rugby, lacrosse, swim team, flag football, and walking her dog"},
    {q:"Hobby / collection", a:"Frogs"},
    {q:"Favorite candy & color", a:"Feastables chocolate & blue"},
  ],
};
