    // October 17: Simsbury B 3, Wolfpack 2 (away). Confirmed game report (Fred's scoresheet).
    {
      const gameId='game-oct-17-simsbury-b';
      const matches=h=>h && (h.gameId===gameId ||
        (h.date==='Oct 17' && h.opponent==='Simsbury B'));
      const saved=history.find(matches);
      const active=matches(game)?game:null;
      const reportMarker='simsbury-oct17-goal-1-v1';
      if(!saved || !(saved.events || []).some(e=>e.id===reportMarker)){
        const corrected=normalizeHistoryEntry({
          ...(saved || {}), id:saved?.id || 'h-oct17-simsbury', gameId,
          opponent:'Simsbury B', date:'Oct 17', home:2, away:3,
          manual:false, shootoutWinner:'', goalieStart:'Ana Straker',
          goalieChanges:[],
          absentPlayers:['Adde Zuck','Olivia Schortman','Eve Krause','Vivianne Currence'],
          events:[
            {id:'simsbury-oct17-goal-1-v1',type:'goal',team:'opp',period:2,elapsedMs:770000,oppNum:'13',oppAssist1:'5'},
            {id:'simsbury-oct17-goal-2',type:'goal',team:'us',period:2,elapsedMs:450000,scorer:'Mairead Hornish',assist1:'Mackenzie Moore'},
            {id:'simsbury-oct17-penalty-1',type:'penalty',team:'us',period:2,elapsedMs:272000,player:'Nia Lorenzi',infraction:'Tripping',minutes:1.5},
            {id:'simsbury-oct17-penalty-2',type:'penalty',team:'opp',period:2,elapsedMs:104000,oppNum:'12',infraction:'Checking',minutes:1.5},
            {id:'simsbury-oct17-penalty-3',type:'penalty',team:'opp',period:3,elapsedMs:762000,oppNum:'7',infraction:'Checking',minutes:1.5},
            {id:'simsbury-oct17-goal-3',type:'goal',team:'opp',period:3,elapsedMs:656000,oppNum:'5',oppAssist1:'7'},
            {id:'simsbury-oct17-goal-4',type:'goal',team:'opp',period:3,elapsedMs:333000,oppNum:'3'},
            {id:'simsbury-oct17-goal-5',type:'goal',team:'us',period:3,elapsedMs:255000,scorer:'Mackenzie Moore',assist1:'Whitney Noe',assist2:'Bailey Pelletier'}
          ]
        });
        history=[corrected,...history.filter(h=>!matches(h))];
      }
      const finalResult=history.find(matches);
      scheduleResults[gameId]=[finalResult.home,finalResult.away];
      if(active)game=blankGame();
    }

    // October 18: Girls Hat Trick Black 8, Wolfpack 0 (home). Confirmed game report (gamesheet 101826W).
    {
      const gameId='game-oct-18-girls-hat-trick-black';
      const matches=h=>h && (h.gameId===gameId ||
        (h.date==='Oct 18' && h.opponent==='Girls Hat Trick Black'));
      const saved=history.find(matches);
      const active=matches(game)?game:null;
      const reportMarker='hattrick-oct18-goal-1-v2';
      if(!saved || !(saved.events || []).some(e=>e.id===reportMarker)){
        const corrected=normalizeHistoryEntry({
          ...(saved || {}), id:saved?.id || 'h-oct18-hattrick', gameId,
          opponent:'Girls Hat Trick Black', date:'Oct 18', home:0, away:8,
          manual:false, shootoutWinner:'', goalieStart:'Ana Straker',
          goalieChanges:[],
          absentPlayers:['Adde Zuck','Lizzie Melchiorre','Eve Krause','Olivia Schortman','Vivianne Currence'],
          events:[
            {id:'hattrick-oct18-goal-1-v2',type:'goal',team:'opp',period:1,elapsedMs:666000},
            {id:'hattrick-oct18-goal-2',type:'goal',team:'opp',period:1,elapsedMs:571000},
            {id:'hattrick-oct18-goal-3',type:'goal',team:'opp',period:1,elapsedMs:476000},
            {id:'hattrick-oct18-penalty-1',type:'penalty',team:'opp',period:1,elapsedMs:377000,oppNum:'',infraction:'Tripping/Clipping/Leg Checking',minutes:2},
            {id:'hattrick-oct18-goal-4',type:'goal',team:'opp',period:2,elapsedMs:741000},
            {id:'hattrick-oct18-goal-5',type:'goal',team:'opp',period:2,elapsedMs:700000},
            {id:'hattrick-oct18-goal-6',type:'goal',team:'opp',period:2,elapsedMs:584000},
            {id:'hattrick-oct18-goal-7',type:'goal',team:'opp',period:3,elapsedMs:805000},
            {id:'hattrick-oct18-goal-8',type:'goal',team:'opp',period:3,elapsedMs:381000}
          ]
        });
        history=[corrected,...history.filter(h=>!matches(h))];
      }
      const finalResult=history.find(matches);
      scheduleResults[gameId]=[finalResult.home,finalResult.away];
      if(active)game=blankGame();
    }
