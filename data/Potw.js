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
  name: "Nia Lorenzi",
  weekOf: "Week of Sep 21, 2026",
  answers: [
    {q:"Position & favorite thing about it", a:"Defense & I enjoy scoring on the other team’s net from the blue line"},
    {q:"Stick tape color", a:"White"},
    {q:"Pre-game ritual", a:"Have a dance party in the locker room"},
    {q:"Invent one hockey rule for a day", a:"Every goal you get is worth $10"},
    {q:"Favorite hockey player", a:"Kayla Kutes — she plays for Providence College"},
    {q:"Funniest moment at practice/a game", a:"Walked onto the ice with her skate guards still on before a game"},
    {q:"Outside of hockey", a:"Cross country"},
    {q:"Hobby / collection", a:"Collecting seashells"},
    {q:"Favorite candy & color", a:"Rolo & black"},
  ],
};
