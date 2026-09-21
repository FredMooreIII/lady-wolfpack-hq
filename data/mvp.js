// Lady Wolfpack HQ -- weekly Game MVP picks, shown on the Home page right below
// "Last Week Recap". Add one entry per game that has an MVP -- games without an
// entry are simply skipped (the section itself hides completely when this list
// is empty), so it doesn't need to be filled in every week.
//
// `players` is a list, not a single name, so a game can have co-MVPs.
// By default each player's photo comes from the same
// assets/roster-photos/First Last.jpeg files the Roster tab already uses -- no
// separate upload needed. If you'd rather use one shared photo for the whole
// entry (e.g. a candid of the co-MVPs together), set `photo` to an image path
// under assets/mvp-photos/ and it replaces the individual roster photos for
// that entry. `note` is optional and shows under the name(s).

const MVPS = [
  {date:"Sep 20", opp:"West Haven A1", side:"away",
    photo:"assets/mvp-photos/2026-09-20-west-haven.jpg",
    players:[{name:"Ana Straker"}, {name:"Adde Zuck"}],
    note:"Shared MVP in net after the West Haven game."},
];
