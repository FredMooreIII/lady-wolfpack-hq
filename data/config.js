// Lady Wolfpack HQ -- access passcodes + misc season config.
const TEAM_PASSCODE = "LADYWP2026";
const BENCH_PASSCODE = "WPBENCH26";
const CHC_GIRLS_T2_OPPONENTS = new Set(['darien ice cats g12u - tier 2','polar bears g12u - tier 2','ct polar bears','ct hat trick g12u - tier 2','girls hat trick black']);
const RINK_COORDS = {
    "Newington Arena":[41.6868,-72.7203], "Champions Skating Center":[41.6142,-72.7103],
    "Avon Old Farms School":[41.7785,-72.8400], "Edward L. Bennett Rink":[41.296,-72.949],
    "Northford Ice Pavilion":[41.3967,-72.8133], "South Windsor Arena":[41.835,-72.579],
    "Jackson Hockey Rink":[41.8908,-72.7966], "The Rinks at the Sports Center":[41.2647,-73.0919],
    "MassMutual Center":[42.1009,-72.5898], "Newington Red":[41.6868,-72.7203], "Louis Astorino Ice Arena":[41.3406,-72.9536]
  };
const KNOWN_ABSENCES = {
    'g87055': ['Ana Straker'],
    'g87042': ['Lizzie Melchiorre'],
    'g87058': ['Lizzie Melchiorre'],
    'game-sep-6-ptl-12u-aa': ['Olivia Schortman','Mackenzie Moore','Lizzie Melchiorre']
  };
const ANA_BASELINE_GAME_IDS = new Set(['g87055','g87043','g87042','g87058','game-sep-6-ptl-12u-aa']);
const ANA_CONFIRMED_BASELINE = {gp:4, starts:1, changesIn:3, wins:1, losses:3};
