// Lady Wolfpack HQ -- app logic (rendering, bench controls, passcode gate, stats).
// Data now lives in data/*.js (loaded before this file); images live in assets/.
// Snapshot of the untouched page template, captured before any script below
  // mutates the DOM (gate unlock classes, populated grids, active tab, etc.) —
  // this is what the live-game tracker republishes from, so a republish never
  // bakes in one viewer's incidental UI state.
  const PRISTINE_HTML = '<!doctype html>' + document.documentElement.outerHTML;

  // --- Access gate ---
  
  // Separate, coach/manager-only passcode gating the bench controls toggle below.
  // Anyone who knows the site passcode can still see the toggle exists, but
  // switching it on requires this second passcode. This is client-side (viewable
  // in page source by anyone who looks), same trust model as TEAM_PASSCODE above —
  // not real security, just a deterrent for casual parents. Change it any time.
  
  (function(){
    const gate = document.getElementById('gate');
    const content = document.getElementById('site-content');
    const form = document.getElementById('gate-form');
    const input = document.getElementById('gate-input');
    const err = document.getElementById('gate-err');
    let unlocked = false;
    try { unlocked = localStorage.getItem('lwpUnlocked') === '1'; } catch(e) {}
    if (unlocked) {
      gate.classList.add('hidden');
      content.classList.add('unlocked');
    }
    form.addEventListener('submit', function(e){
      e.preventDefault();
      const val = (input.value || '').trim().toUpperCase();
      if (val === TEAM_PASSCODE) {
        try { localStorage.setItem('lwpUnlocked', '1'); } catch(e) {}
        gate.classList.add('hidden');
        content.classList.add('unlocked');
        err.classList.remove('show');
      } else {
        err.classList.add('show');
        input.value = '';
        input.focus();
      }
    });
  })();

  // side: 'home' if listed "vs." on Crossbar, 'away' if listed "@"
  // result: [us, them] when Final; null when upcoming
  

  // Give every scheduled game a stable ID so live results can always reconnect
  // to the correct schedule row after a reload, even for rows that originally
  // came in without an explicit Crossbar/game ID.
  function stableGameId(g){
    const slug = v => String(v || '').trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
    return `game-${slug(g.date)}-${slug(g.opp)}`;
  }
  GAMES.forEach(g => { if (!g.id) g.id = stableGameId(g); });

  // Practice/skills/dry-land slots for the rest of the season, pulled from Crossbar
  // 2026-09-06 (Tuesday "Practice" entries are always relabeled "Skills" per Fred —
  // Crossbar itself just calls them Practice). Re-check Crossbar periodically since
  // it has no practices export/API and times shift week to week.
  // Verified CHC Girls 2026–27 G12U Tier 2: https://www.chchockey.org/division/29835
  // User confirmed Girls Hat Trick Black is the division team; CGHL is separate.
  
  GAMES.forEach(g=>{if(g.type!=='Tournament') g.type=CHC_GIRLS_T2_OPPONENTS.has(g.opp.trim().toLowerCase())?'League':'Non-League';});

  

  function dateNum(d){ const n = parseInt(String(d).split(' ')[1], 10); return isNaN(n) ? 0 : n; }
  // Full calendar Date for a GAMES row, combining its "Sep 4"-style date with the year from its month group.
  function gameDate(g){
    const year = g.m.split(' ').pop();
    const d = new Date(g.date + ', ' + year);
    return isNaN(d.getTime()) ? new Date(0) : d;
  }
  function parseGameStart(g){ const d=gameDate(g); const m=String(g.time||'').match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i); if(!m) return null; let h=parseInt(m[1],10); const min=parseInt(m[2],10); if(m[3].toUpperCase()==='PM' && h<12) h+=12; if(m[3].toUpperCase()==='AM' && h===12) h=0; d.setHours(h,min,0,0); return d; }
  function arrivalTime(g){ const d=parseGameStart(g); if(!d) return 'TBD'; d.setHours(d.getHours()-1); return d.toLocaleTimeString([], {hour:'numeric',minute:'2-digit'}); }
  function gameTagClass(type){ return String(type||'').toLowerCase().replace(/[^a-z]+/g,''); }
  


  // ---- Season-tab accordion: expand a played game's row to show its full boxscore ----
  // The live/bench tracker (further below) exposes history + a few render helpers on
  // window.__lwp once it initializes, so this can stay decoupled from that IIFE.
  function normalizeOpp(s){
    return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\b(12u|12 2|aa)\b/g, '').replace(/\s+/g, ' ').trim();
  }
  function findHistoryForGame(g){
    const lwp = window.__lwp;
    const hist = (lwp && typeof lwp.getHistory === 'function') ? (lwp.getHistory() || []) : [];
    if (g.id) {
      const byId = hist.find(h => h.gameId === g.id);
      if (byId) return byId;
    }
    const nOpp = normalizeOpp(g.opp);
    return hist.find(h => h.date && g.date && h.date === g.date && normalizeOpp(h.opponent) === nOpp) || null;
  }
  function gameRowKey(g){ return g.id || (g.date + '__' + g.opp); }
  let gameByKeyMap = {};
  function penaltySection(events,opponent,helpers,actions=()=> ''){
    const penalties=(events||[]).filter(e=>e.type==='penalty');
    if(!penalties.length)return '';
    const periods=[...new Set(penalties.map(e=>Number(e.period)))].sort((a,b)=>a-b);
    return '<section class="penalty-summary" aria-label="Penalties"><h4>Penalties</h4>'+periods.map(p=>
      '<div class="penalty-period"><h5>'+helpers.periodHeading(p)+'</h5>'+penalties.filter(e=>Number(e.period)===p).sort((a,b)=>b.elapsedMs-a.elapsedMs).map(e=>
        '<div class="penalty-summary-row"><span class="penalty-clock">'+helpers.fmtClock(e.elapsedMs)+'</span><div class="penalty-description">'+helpers.eventDesc(e,opponent)+'</div>'+actions(e)+'</div>'
      ).join('')+'</div>'
    ).join('')+'</section>';
  }

  function winningGoal(finalGame){
    if(!finalGame || finalGame.active) return null;
    const events=finalGame.events||[];
    if(finalGame.shootoutWinner){
      // The scorer records the winning shootout as a team event, not an individual shot.
      return events.filter(e=>e.type==='shootout' && e.team===finalGame.shootoutWinner).slice(-1)[0] || null;
    }
    if(finalGame.home===finalGame.away) return null;
    const goals=events.filter(e=>e.type==='goal');
    // Do not guess a scorer if the event log cannot reproduce the final score.
    if(goals.filter(e=>e.team==='us').length!==finalGame.home || goals.filter(e=>e.team==='opp').length!==finalGame.away) return null;
    const winner=finalGame.home>finalGame.away?'us':'opp';
    const losingScore=Math.min(finalGame.home,finalGame.away);
    return goals.filter(e=>e.team===winner).sort((a,b)=>a.period-b.period || b.elapsedMs-a.elapsedMs)[losingScore] || null;
  }
  function winningGoalBadge(e,finalGame){
    return winningGoal(finalGame)===e ? ' <span class="gwg-badge" title="Game-winning goal" aria-label="Game-winning goal">🏆 GWG</span>' : '';
  }

  function renderGameDetailHtml(g){
    const [us, them] = g.result;
    const resultLine = `Final: Wolfpack ${us}&ndash;${them} ${g.side === 'home' ? 'vs' : '@'} ${g.opp}`;
    const h = findHistoryForGame(g);
    const lwp = window.__lwp;
    if (!h || !h.events || !h.events.length || !lwp) {
      return `<div class="muted" style="padding:2px 2px 4px; font-size:13px;"><div class="season-final">${resultLine}</div><span style="font-size:13px;">${h ? 'Logged, but no play-by-play was recorded for this game.' : 'No detailed boxscore recorded for this game yet.'}</span></div>`;
    }
    const { computeLeaders, eventDesc, periodHeading, fmtClock, playerLabel } = lwp;
    const leaders = computeLeaders(h.events);
    let html = `<div class="season-final">${resultLine}</div>`;
    if (leaders.length) {
      html += '<div class="boxscore-leaders">' + leaders.map(l => `
        <div class="leader-cell">
          <div class="ln">${playerLabel(l.name)}</div>
          <div class="ls">${l.g}G ${l.a}A &middot; ${l.pts} PTS</div>
        </div>
      `).join('') + '</div>';
    }
    const byPeriod = {};
    h.events.filter(e=>e.type!=='penalty').forEach(e => { (byPeriod[e.period] = byPeriod[e.period] || []).push(e); });
    const periods = Object.keys(byPeriod).map(Number).sort((a, b) => a - b);
    html += periods.map(p => `
      <div class="period-block">
        <h4>${periodHeading(p)}</h4>
        ${byPeriod[p].map(e => `
          <div class="play-row${e.type === 'penalty' ? ' penalty' : ''}">
            <span class="play-time">${fmtClock(e.elapsedMs)}</span>
            <div class="play-desc">${eventDesc(e, g.opp)}</div>${winningGoalBadge(e,h)}
          </div>
        `).join('')}
      </div>
    `).join('');
    return html + penaltySection(h.events,g.opp,lwp);
  }
  function openBoxscoreModal(g){
    if (!g || !g.result) return;
    const title = (g.side === 'home' ? 'vs. ' : '@ ') + g.opp + ' — ' + g.day + ', ' + g.date;
    openModal({ title, bodyHtml: renderGameDetailHtml(g), okText: 'Close', cancelHidden: true });
  }

  function renderRecord(){
    let wins = 0, losses = 0, ties = 0, gf = 0, ga = 0, played = 0;
    GAMES.forEach(g => {
      if (!g.result) return;
      played++;
      const [us, them] = g.result;
      gf += us; ga += them;
      if (us > them) wins++; else if (us < them) losses++; else ties++;
    });
    document.getElementById('season-record-num').textContent = ties ? `${wins}-${losses}-${ties}` : `${wins}-${losses}`;
    const gdEl = document.getElementById('season-gd');
    gdEl.textContent = (gf - ga >= 0 ? '+' : '') + (gf - ga);
    gdEl.classList.toggle('good', gf - ga > 0);
    gdEl.classList.toggle('bad', gf - ga < 0);
    document.getElementById('season-played').textContent = played;
    document.getElementById('header-record').textContent = ties ? `${wins}-${losses}-${ties}` : `${wins}-${losses}`;
    document.getElementById('stats-record-num').textContent = ties ? `${wins}-${losses}-${ties}` : `${wins}-${losses}`;
    const gfEl = document.getElementById('stats-gf');
    const gaEl = document.getElementById('stats-ga');
    gfEl.textContent = gf; gfEl.classList.add('good');
    gaEl.textContent = ga; gaEl.classList.add('bad');
  }
  renderRecord();

  // Exact team aliases only: keep CGHL, age groups and team levels separate.
  function matchupOpponentKey(name){
    const key=String(name||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
    const aliases={'ct polar bears':'polar bears g12u tier 2','ct hat trick g12u tier 2':'girls hat trick black'};
    return aliases[key]||key;
  }
  function matchupSummary(g,games=GAMES){
    const key=matchupOpponentKey(g.opp);
    const meetings=games.map((game,index)=>({game,index})).filter(x=>matchupOpponentKey(x.game.opp)===key)
      .sort((a,b)=>gameDate(a.game)-gameDate(b.game) || ((parseGameStart(a.game)||gameDate(a.game))-(parseGameStart(b.game)||gameDate(b.game))) || a.index-b.index);
    const index=meetings.findIndex(x=>x.game===g);
    if(index===0) return {first:true,wins:0,losses:0,ties:0,played:0};
    const result={first:false,wins:0,losses:0,ties:0,played:0};
    meetings.slice(0,Math.max(0,index)).forEach(({game})=>{
      if(!Array.isArray(game.result)) return;
      const [us,them]=game.result;result.played++;
      if(us>them)result.wins++;else if(us<them)result.losses++;else result.ties++;
    });
    return result;
  }
  function matchupBadge(g){
    const s=matchupSummary(g);
    if(s.first) return '<span class="matchup-badge first" title="First scheduled matchup against this team this season">🆕 First Matchup</span>';
    if(!s.played) return '';
    return '<span class="matchup-badge" title="Head-to-head record from completed games before this matchup (wins–losses–ties)">🏒 H2H '+s.wins+'–'+s.losses+(s.ties?'–'+s.ties:'')+'</span>';
  }

  
  
  function scheduleOpponentLogo(name){
    const key=String(name||'').toLowerCase();
    const prefix=Object.keys(SCHEDULE_LOGO_PREFIXES).find(p=>key===p || key.startsWith(p+' '));
    if(!prefix) return '';
    return '<img class="schedule-team-logo" src="'+SCHEDULE_LOGO_IMAGES[SCHEDULE_LOGO_PREFIXES[prefix]]+'" alt="" aria-hidden="true" loading="lazy">';
  }

  function renderMonths(){
    const showPractices = document.getElementById('toggle-practices').checked;
    const container = document.getElementById('season-months');
    gameByKeyMap = {};

    const items = GAMES.map(g => ({ kind:'game', m:g.m, dnum: dateNum(g.date), g }));
    if (showPractices) {
      PRACTICES.forEach(p => {
        items.push({ kind:'practice', m:p.m, dnum: dateNum(p.date), p });
      });
    }

    const months = [...new Set(items.map(i => i.m))];
    container.innerHTML = months.map(month => {
      const monthItems = items.filter(i => i.m === month).sort((a,b) => a.dnum - b.dnum);
      const gameCount = monthItems.filter(i => i.kind === 'game').length;
      const donePlayed = monthItems.filter(i => i.kind === 'game' && i.g.result).length;
      const practiceCount = monthItems.filter(i => i.kind === 'practice').length;
      const countLabel = `${gameCount} game${gameCount === 1 ? '' : 's'}${donePlayed ? ` &middot; ${donePlayed} played` : ''}${practiceCount ? ` &middot; ${practiceCount} practice${practiceCount === 1 ? '' : 's'}` : ''}`;

      const rows = monthItems.map((item, idx) => {
        const isLast = idx === monthItems.length - 1;
        if (item.kind === 'game') {
          const g = item.g;
          const sideClass = g.side === 'home' ? 'home' : 'away';
          const sideLabel = g.side === 'home' ? 'HOME' : 'AWAY';
          let resultHtml;
          if (g.result) {
            const [us, them] = g.result;
            resultHtml = `<div class="result ${us > them ? 'w' : 'l'}">${us > them ? 'W' : 'L'} ${us}&ndash;${them}</div>`;
          } else {
            resultHtml = `<div class="result pending">${g.time === 'TBD' ? 'Time TBD' : g.time}</div>`;
          }
          const oppLabel = `${g.side === 'home' ? 'vs' : '@'} ${g.opp}`;
          if (g.result) {
            const key = gameRowKey(g);
            gameByKeyMap[key] = g;
            return `
            <div class="game-row played" role="button" tabindex="0" data-game-key="${key}" style="cursor:pointer;${isLast ? 'border-bottom:none;' : ''}">
              <div class="side ${sideClass}">${sideLabel}</div>
              <div class="schedule-opponent"><div class="schedule-opponent-heading">${scheduleOpponentLogo(g.opp)}<div class="opp">${oppLabel} ${matchupBadge(g)} <span class="muted" style="font-weight:400;font-size:11px;">&#9662; tap for boxscore</span></div></div><div class="meta">${g.day}, ${g.date} &middot; ${g.loc} <span class="type-tag ${gameTagClass(g.type)}">${g.type}</span></div></div>
              ${resultHtml}
            </div>`;
          }
          return `
          <div class="game-row upcoming"${isLast ? ' style="border-bottom:none;"' : ''}>
            <div class="side ${sideClass}">${sideLabel}</div>
            <div class="schedule-opponent"><div class="schedule-opponent-heading">${scheduleOpponentLogo(g.opp)}<div class="opp">${oppLabel} ${matchupBadge(g)}</div></div><div class="meta">${g.day}, ${g.date} &middot; ${g.loc} <span class="type-tag ${gameTagClass(g.type)}">${g.type}</span><span class="arrival">Arrive <b>${arrivalTime(g)}</b></span></div></div>
            ${resultHtml}
          </div>`;
        } else {
          const p = item.p;
          const tag = p.session === 'Skills' ? 'SKILLS' : (p.session === 'Dry Land Training' ? 'DRY LAND' : 'PRACTICE');
          return `
          <div class="game-row practice">
            <div class="side ${p.session === 'Skills' ? 'skills' : p.session === 'Dry Land Training' ? 'dryland' : 'practice'}">${tag}</div>
            <div><div class="opp">${p.session}</div><div class="meta">${p.day}, ${p.date} &middot; ${p.loc}</div></div>
            <div class="result pending">${p.time}</div>
          </div>`;
        }
      }).join('');

      return `
      <div class="month-group">
        <div class="month-title"><span>${month}</span><span>${countLabel}</span></div>
        <div class="card">${rows}</div>
      </div>`;
    }).join('');

    container.querySelectorAll('[data-game-key]').forEach(row => {
      row.addEventListener('click', () => openBoxscoreModal(gameByKeyMap[row.dataset.gameKey]));
      row.addEventListener('keydown', e => { if(e.key==='Enter' || e.key===' '){ e.preventDefault(); openBoxscoreModal(gameByKeyMap[row.dataset.gameKey]); } });
    });
  }
  renderMonths();
  document.getElementById('toggle-practices').addEventListener('change', renderMonths);


  function homeCalendarDay(now=new Date()){
    return new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
  }
  function homePracticeWeek(now=new Date()){
    const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',year:'numeric',month:'numeric',day:'numeric'}).formatToParts(now);
    const value=type=>Number(parts.find(p=>p.type===type).value);
    const today=new Date(value('year'),value('month')-1,value('day'));
    const monday=new Date(today);monday.setDate(today.getDate()-((today.getDay()+6)%7));
    const end=new Date(monday);end.setDate(end.getDate()+7);
    return PRACTICES.filter(p=>gameDate(p)>=monday && gameDate(p)<end)
      .sort((a,b)=>gameDate(a)-gameDate(b));
  }
  function renderHomePractices(now=new Date()){
    const esc=s=>String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const rows=homePracticeWeek(now);
    document.getElementById('home-practice-rows').innerHTML=rows.map(p=>{
      const session=gameDate(p).getDay()===2 && /practice|skills/i.test(p.session)?'Skills':p.session;
      const cls=/dry/i.test(session)?'dryland':/skills/i.test(session)?'skills':'practice';
      return '<tr><td><span class="day-pill '+cls+'">'+esc(p.day.toUpperCase()+' '+p.date)+'</span></td><td>'+esc(p.time)+' &middot; '+esc(session)+(p.optional?' (Optional)':'')+'</td><td class="muted">'+esc(p.loc)+'</td></tr>';
    }).join('') || '<tr><td colspan="3" class="muted">No practices scheduled this week.</td></tr>';
  }

  // Friday–Sunday of this calendar week; Monday advances to the next weekend.
  function homeWeekendGroups(now = new Date()){
    const parts = new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',year:'numeric',month:'numeric',day:'numeric'}).formatToParts(now);
    const value = type => Number(parts.find(p => p.type === type).value);
    const today = new Date(value('year'),value('month')-1,value('day'));
    const friday = new Date(today); friday.setDate(today.getDate() - ((today.getDay()+6)%7) + 4);
    function group(offset){
      const start = new Date(friday); start.setDate(start.getDate()+offset);
      const end = new Date(start); end.setDate(end.getDate()+3);
      const last = new Date(end); last.setDate(last.getDate()-1);
      const games = GAMES.filter(g => gameDate(g)>=start && gameDate(g)<end).sort((a,b)=>(parseGameStart(a)||gameDate(a))-(parseGameStart(b)||gameDate(b)));
      const format = d => d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
      return {games,label:format(start)+' – '+format(last)};
    }
    return {current:group(0),previous:group(-7)};
  }
  function renderHomeWeekends(liveGame, liveScore){
    renderHomePractices();
    const groups = homeWeekendGroups();
    const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    function cards(group,kind){
      document.getElementById('home-'+kind+'-count').textContent=group.games.length+' game'+(group.games.length===1?'':'s');
      document.getElementById('home-'+kind+'-dates').textContent=group.label;
      const container = document.getElementById('home-'+kind+'-games');
      const keyMap = {};
      container.innerHTML=group.games.map(g=>{
        const live = liveGame && liveGame.active && ((liveGame.gameId && liveGame.gameId===g.id) || (!liveGame.gameId && liveGame.date===g.date && liveGame.opponent===g.opp));
        let status = esc(g.time), details='Arrive '+esc(arrivalTime(g));
        if(live){status='<span class="result">LIVE '+liveScore.home+'–'+liveScore.away+'</span>';details='In progress';}
        else if(g.result){const [us,them]=g.result;status='<span class="result '+(us>them?'w':us<them?'l':'pending')+'">'+(us>them?'W':us<them?'L':'T')+' '+us+'–'+them+'</span>';details='Final';}
        else if(kind==='recap'){details='Result not recorded';}
        const cardClass = 'card game-card'+(kind==='recap'?' recap':'');
        const key = gameRowKey(g);
        if (g.result) keyMap[key] = g;
        const clickable = g.result ? ' role="button" tabindex="0" data-home-game-key="'+esc(key)+'" style="cursor:pointer;"' : '';
        const note = g.result ? 'Tap for boxscore &#9662;' : (live?'Live now':'<a href="https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(g.loc)+'" target="_blank" rel="noopener">Directions ↗</a>');
        return '<div class="'+cardClass+'"'+clickable+'><div class="gc-when"><span class="day-pill">'+esc(g.day)+' '+esc(g.date)+'</span><span class="gc-time">'+status+'</span></div><div class="gc-mid"><div class="gc-opp">'+(g.side==='home'?'vs. ':'@ ')+esc(g.opp)+'</div><div class="gc-meta">'+esc(g.loc)+' · '+esc(g.type)+' · '+details+'</div></div><div class="gc-note">'+note+'</div></div>';
      }).join('') || '<div class="card" style="padding:20px;">No games scheduled for this weekend.</div>';
      container.querySelectorAll('[data-home-game-key]').forEach(card=>{
        card.addEventListener('click', () => openBoxscoreModal(keyMap[card.dataset.homeGameKey]));
        card.addEventListener('keydown', e => { if(e.key==='Enter' || e.key===' '){ e.preventDefault(); openBoxscoreModal(keyMap[card.dataset.homeGameKey]); } });
      });
    }
    cards(groups.current,'weekend'); cards(groups.previous,'recap');
  }
  renderHomeWeekends();

  // This week's rinks (Home tab) — computed live from this weekend's games so it
  // never goes stale, instead of a hand-kept WEEK_RINKS list.
  function renderWeekRinks(){
    const weekendGames = homeWeekendGroups().current.games;
    const byRink = {};
    weekendGames.forEach(g => {
      if (!byRink[g.loc]) byRink[g.loc] = { name: g.loc, games: [] };
      byRink[g.loc].games.push(g);
    });
    const rinks = Object.values(byRink);
    const escR = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    document.getElementById('week-rinks-card').innerHTML = rinks.map(r => {
      const days = [...new Set(r.games.map(g => g.day + ' ' + g.date))];
      const mapsQuery = r.name + ', CT';
      return `
      <div class="rink-row">
        <div>
          <div class="rink-name">${escR(r.name)}</div>
          <div class="rink-games">${escR(days.join(' & '))} &middot; ${r.games.length} game${r.games.length === 1 ? '' : 's'} this weekend</div>
        </div>
        <a class="cta" style="margin-top:0;" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}" target="_blank" rel="noopener">Directions →</a>
      </div>`;
    }).join('') || '<div class="rink-row"><div class="rink-games">No games scheduled this weekend.</div></div>';
  }
  renderWeekRinks();

  // Mini-map: static rink coordinates keep the map fast and avoid runtime geocoding.
  
  function renderScheduleMap(){
    const el=document.getElementById('schedule-map'); if(!el || !window.L) return;
    if(el._map){ el._map.remove(); }
    const map=L.map(el,{scrollWheelZoom:false}).setView([41.70,-72.75],9.5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'© OpenStreetMap contributors'}).addTo(map);
    // Pins show this weekend's games only (Fri–Sun), matching the Home tab's "This Weekend" cards.
    const games=homeWeekendGroups().current.games;
    const points=[]; games.forEach(g=>{ const c=RINK_COORDS[g.loc]; if(!c) return; points.push(c); L.marker(c).addTo(map).bindPopup(`<b>${g.day} ${g.date} · ${g.time}</b><br>${g.side==='home'?'vs':'@'} ${g.opp}<br>${g.loc}<br><b>Arrive ${arrivalTime(g)}</b>`); });
    if(points.length) map.fitBounds(points,{padding:[24,24]});
    setTimeout(()=>map.invalidateSize(),100);
  }
  renderScheduleMap();

  // Stats synced from Fred's Google Sheet "Players" tab (g/a/pts/gp/gm/appg/pim)
  

  const JERSEY_IMAGE = "assets/jersey.webp";
  // Player headshots: drop a file named "First Last.jpeg" (matching the roster
  // name exactly) into assets/roster-photos/ and it shows automatically as a
  // badge on the jersey card. A player's own `photo` field in roster.js can
  // override the guessed path. If the image fails to load (no photo yet), the
  // badge is silently removed and the jersey art alone is shown, unchanged.
  const rosterPhotoSrc = p => p.photo || ('assets/roster-photos/' + encodeURIComponent(p.name) + '.jpeg');
  const lastName = name => String(name || '').trim().split(/\s+/).slice(-1)[0] || '';
  const positionName = p => p === 'G' ? 'Goalie' : (p === 'D' ? 'Defense' : 'Forward');
  const grid = document.getElementById('roster-grid');
  grid.innerHTML = ROSTER.map((p, i) => `
    <div class="card flip-card pos-${p.pos}" tabindex="0" role="button" aria-label="${p.name}, tap to flip for stats" data-idx="${i}">
      <div class="flip-inner">
        <div class="flip-face front">
          ${p.r ? '<span class="r-tag" title="Returning player" aria-label="Returning player">R</span>' : ''}
          <div class="jersey-stage">
            <img class="player-photo" src="${rosterPhotoSrc(p)}" alt="${p.name}" loading="lazy" onerror="this.remove()" onload="this.closest('.jersey-stage').classList.add('has-photo')">
            <svg class="jersey-art" viewBox="0 0 1000 1000" role="img" aria-label="${lastName(p.name)}, number ${p.n} Wolfpack jersey">
              <image href="${JERSEY_IMAGE}" width="1000" height="1000"/>
              <text class="jersey-last" x="500" y="252" text-anchor="middle" font-size="52" textLength="${Math.min(330,lastName(p.name).length*30)}" lengthAdjust="spacingAndGlyphs" opacity=".94">${lastName(p.name).toUpperCase()}</text>
              <text class="jersey-num" x="500" y="532" text-anchor="middle" font-size="272" textLength="${String(p.n).length===1?138:280}" lengthAdjust="spacingAndGlyphs" opacity=".95">${p.n}</text>
            </svg>
          </div>
          <div class="jersey-card-footer">
            <div class="name">${p.name}</div>
            <div class="pos">${positionName(p.pos)}</div>
          </div>
          <div class="flip-hint">🔄 stats</div>
        </div>
        <div class="flip-face back">
          <div class="stat-face">
            <div class="sf-head">
              <div class="sf-name">#${p.n} ${p.name}</div>
              <div class="sf-sub">2026&ndash;27 Season</div>
            </div>
            <div class="stat-grid">
              <div class="stat-cell"><div class="sv mono">${p.g}</div><div class="sl">Goals</div></div>
              <div class="stat-cell"><div class="sv mono">${p.a}</div><div class="sl">Assists</div></div>
              <div class="stat-cell"><div class="sv mono">${p.pts}</div><div class="sl">Points</div></div>
              <div class="stat-cell"><div class="sv mono">${p.gp}</div><div class="sl">GP</div></div>
              <div class="stat-cell"><div class="sv mono">${p.appg.toFixed(1)}</div><div class="sl">Pts/Gm</div></div>
              <div class="stat-cell"><div class="sv mono">${p.pim}</div><div class="sl">PIM</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('.flip-card').forEach(card => {
    card.setAttribute('aria-pressed','false');
    const toggle = () => {
      const open = !card.classList.contains('flipped');
      grid.querySelectorAll('.flip-card').forEach(other => {
        const active = other === card && open;
        other.classList.toggle('flipped',active);
        other.setAttribute('aria-pressed',String(active));
      });
    };
    card.addEventListener('click', toggle);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  });

  const statsBody = document.getElementById('stats-table-body');

  // Confirmed attendance corrections through Sep 6. These are merged with any
  // absences recorded from the bench manager, so historical GP remains accurate
  // even for games played before the attendance control existed.
  
  function absencesForHistory(h){
    const known = KNOWN_ABSENCES[h.gameId] || [];
    return [...new Set([...(h.absentPlayers || []), ...known])];
  }
  function archivedGP(name){
    const hist = (window.__lwp && window.__lwp.getHistory) ? window.__lwp.getHistory() : [];
    if (!hist.length) return null;
    return hist.filter(h => !absencesForHistory(h).includes(name)).length;
  }
  function effectiveRoster(){
    // Before the game tracker loads, keep the initial display totals.
    if (!window.__lwp || !window.__lwp.getHistory) return ROSTER.map(p => ({...p}));
    const history = window.__lwp.getHistory();
    const players = ROSTER.map(p => ({...p, g:0, a:0, pts:0, pim:0,
      gp:archivedGP(p.name) ?? p.gp, appg:0}));
    const byName = new Map(players.map(p => [p.name,p]));
    history.forEach(game => {
      (game.events || []).forEach(event => {
        if (event.team !== 'us') return;
        if (event.type === 'goal') {
          const scorer = byName.get(event.scorer);
          if (scorer) scorer.g++;
          // A scorer cannot assist their own goal; repeated assists count once.
          new Set([event.assist1,event.assist2]).forEach(name => {
            const player = byName.get(name);
            if (player && name !== event.scorer) player.a++;
          });
        } else if (event.type === 'penalty') {
          const player = byName.get(event.player);
          if (player) player.pim += Math.max(0,Number(event.minutes) || 0);
        }
      });
    });
    players.forEach(p => {p.pts=p.g+p.a; p.appg=p.gp?p.pts/p.gp:0;});
    return players;
  }
  function updateSkaterRosterCards(players){
    players.forEach(p => {
      const index=ROSTER.findIndex(original => original.name===p.name);
      const card=grid.querySelector('[data-idx="'+index+'"]');
      if (!card) return;
      const values=[p.g,p.a,p.pts,p.gp,p.appg.toFixed(1),p.pim];
      card.querySelectorAll('.stat-grid .sv').forEach((cell,i) => {
        if (i<values.length) cell.textContent=String(values[i]);
      });
    });
  }
  function renderStats(){
    const players = effectiveRoster().filter(p => p.pos !== 'G');
    updateSkaterRosterCards(players);
    const sort = document.getElementById('stats-sort')?.value || 'name-asc';
    const dirs = {
      'name-asc':(a,b)=>a.name.localeCompare(b.name),'name-desc':(a,b)=>b.name.localeCompare(a.name),
      'pts-desc':(a,b)=>b.pts-a.pts || a.name.localeCompare(b.name),'gp-desc':(a,b)=>b.gp-a.gp || a.name.localeCompare(b.name),
      'g-desc':(a,b)=>b.g-a.g || a.name.localeCompare(b.name),'a-desc':(a,b)=>b.a-a.a || a.name.localeCompare(b.name)
    };
    const leaderboard = players.sort(dirs[sort] || dirs['name-asc']);
    const colMax = key => Math.max(0,...leaderboard.map(p=>p[key]));
    const maxG=colMax('g'),maxA=colMax('a'),maxPts=colMax('pts'),maxAppg=colMax('appg'),maxPim=colMax('pim');
    const leadCls=(v,m)=>m>0&&v===m?' stat-lead':'';
    statsBody.innerHTML = leaderboard.map(p => `<tr><td class="mono">${p.n}</td><td>${p.name}${p.r ? ' <span style="display:inline-block;margin-left:4px;font-size:10px;font-weight:800;color:var(--ice-2);border:1px solid var(--ice-2);border-radius:4px;padding:0 4px;vertical-align:middle;">R</span>' : ''}</td><td class="mono">${p.gp}</td><td class="mono${leadCls(p.g,maxG)}">${p.g}</td><td class="mono${leadCls(p.a,maxA)}">${p.a}</td><td class="mono${leadCls(p.pts,maxPts)}">${p.pts}</td><td class="mono${leadCls(p.appg,maxAppg)}">${p.appg.toFixed(1)}</td><td class="mono${leadCls(p.pim,maxPim)}">${p.pim}</td></tr>`).join('');
  }
  renderStats();
  document.getElementById('stats-sort')?.addEventListener('change', renderStats);

  // The first five tournament games pre-date reliable goalie-participation logging.
  // Preserve the confirmed Ana totals through Sep 6, then add any later games
  // from the live scorer normally. This prevents her W-L from falling back to 0-0.
  
  
  function goalieStats(name){
    const hist=(window.__lwp && window.__lwp.getHistory)?window.__lwp.getHistory():[];
    let gp=0,starts=0,changesIn=0,wins=0,losses=0,shutouts=0,ga=0;

    if(name==='Ana Straker') {
      gp=ANA_CONFIRMED_BASELINE.gp; starts=ANA_CONFIRMED_BASELINE.starts;
      changesIn=ANA_CONFIRMED_BASELINE.changesIn; wins=ANA_CONFIRMED_BASELINE.wins; losses=ANA_CONFIRMED_BASELINE.losses;
    }

    hist.forEach(h=>{
      if(name==='Ana Straker' && ANA_BASELINE_GAME_IDS.has(h.gameId)) return;
      if (absencesForHistory(h).includes(name)) return;
      const changes=h.goalieChanges||[]; const start=h.goalieStart||'Adde Zuck';
      const played=name===start || changes.some(c=>c.to===name); if(!played) return;
      gp++; if(name===start) starts++; else changesIn++;
      const goalieAtEnd=changes.length?changes[changes.length-1].to:start;
      const decisionGoalie = changes.length ? goalieAtEnd : start;
      if(goalieAtEnd===name){ ga+=h.away||0; if((h.away||0)===0) shutouts++; }
      if(decisionGoalie===name){ if((h.home||0)>(h.away||0)) wins++; else if((h.home||0)<(h.away||0)) losses++; }
    });

    // If there is no historical goalie tracking at all, retain the roster GP for
    // other goalies rather than displaying a misleading zero.
    if(name!=='Ana Straker' && !hist.some(h => h.goalieStart || (h.goalieChanges||[]).length)) {
      const base = ROSTER.find(p=>p.name===name);
      gp=base ? base.gp : 0; starts=gp;
    }
    return {gp,starts,changesIn,wins,losses,shutouts,ga,gpg:gp?ga/gp:0};
  }
  function renderGoalies(){
    const box=document.getElementById('goalie-leaderboard');
    const goalieCards=ROSTER.filter(p=>p.pos==='G').map(p=>{
      const s=goalieStats(p.name);
      // Both views use the same calculated values on every game update.
      const stats=[['GP',s.gp],['Starts',s.starts],['Relief',s.changesIn],['W-L',s.wins+'-'+s.losses],['SO',s.shutouts],['GA/GP',s.gpg.toFixed(2)]];
      const card=document.querySelector('#roster-grid .flip-card[data-idx="'+ROSTER.indexOf(p)+'"]');
      if(card){
        const grid=card.querySelector('.stat-grid');
        if(grid) grid.innerHTML=stats.map(([label,value])=>'<div class="stat-cell"><div class="sv mono">'+value+'</div><div class="sl">'+label+'</div></div>').join('');
      }
      return '<div class="goalie-card"><h3>#'+p.n+' '+p.name+'</h3><div class="goalie-statgrid">'+stats.map(([label,value])=>'<div class="goalie-stat"><b>'+value+'</b><span>'+label+'</span></div>').join('')+'</div></div>';
    });
    if(box) box.innerHTML=goalieCards.join('');
  }
  renderGoalies();

  const buttons = document.querySelectorAll('#tabs button');
  function activateTab(name, opts){
    const btn = document.querySelector('#tabs button[data-panel="' + name + '"]');
    if (!btn) return;
    buttons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.getElementById('panel-' + name).classList.add('active');
    try { localStorage.setItem('lwpActiveTab', name); } catch(e) {}
    if (opts && opts.scrollToBench) {
      setTimeout(() => {
        const el = document.getElementById('bench-panel');
        if (el && !el.hidden) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }
  const liveBannerLink = document.getElementById('live-banner-link');
  if (liveBannerLink) liveBannerLink.addEventListener('click', e => { e.preventDefault(); activateTab('scores'); window.scrollTo({top:0, behavior:'smooth'}); });

  // Scores tab is hidden from the main nav until cross-device live sync is ready
  // (see roadmap item 14). The Resources page offers it as a bench-manager-only
  // link, gated behind the same bench passcode used for bench controls.
  const scoresGateLink = document.getElementById('scores-gate-link');
  if (scoresGateLink) scoresGateLink.addEventListener('click', async e => {
    e.preventDefault();
    let authed = false;
    try { authed = localStorage.getItem('lwpBenchAuth') === '1'; } catch(err) {}
    if (!authed) {
      const result = await openModal({
        title: 'Bench Passcode',
        fields: [{ id: 'code', label: 'Team manager / coach only', placeholder: 'Bench passcode', type: 'password' }],
        okText: 'Unlock'
      });
      const val = ((result && result.code) || '').trim().toUpperCase();
      if (result && val === BENCH_PASSCODE) {
        try { localStorage.setItem('lwpBenchAuth', '1'); } catch(err) {}
        authed = true;
      } else if (result && val !== '') {
        await openAlert('That passcode isn’t right — the Scores page stays hidden on this device.');
      }
    }
    if (authed) { activateTab('scores'); window.scrollTo({top:0, behavior:'smooth'}); }
  });
  // Mobile nav: on narrow screens the tab row collapses behind a ☰ toggle so it
  // doesn't force landscape/pinch-zoom just to see or switch tabs.
  const menuToggle = document.getElementById('menu-toggle');
  const navTabs = document.getElementById('tabs');
  function closeMobileMenu(){
    if (!navTabs || !navTabs.classList.contains('mobile-open')) return;
    navTabs.classList.remove('mobile-open');
    if (menuToggle) { menuToggle.setAttribute('aria-expanded', 'false'); menuToggle.textContent = '☰'; }
  }
  if (menuToggle && navTabs) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navTabs.classList.toggle('mobile-open');
      menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      menuToggle.textContent = isOpen ? '✕' : '☰';
    });
  }
  buttons.forEach(btn => {
    btn.addEventListener('click', () => { activateTab(btn.dataset.panel); closeMobileMenu(); });
  });
  // Publishing a live-game update reloads the whole page (the Artifact platform's
  // publish() behavior — "every open view, this one included, reloads to it"), which
  // would otherwise always drop the bench operator back on the Home tab. Restore
  // whichever tab was open before that reload, and if it's Scores with bench controls
  // open, scroll back down to them instead of leaving the operator at the top.
  try {
    const savedTab = localStorage.getItem('lwpActiveTab');
    if (savedTab && document.getElementById('panel-' + savedTab)) {
      activateTab(savedTab, { scrollToBench: savedTab === 'scores' });
    }
  } catch(e) {}

  // --- Custom modal helpers ---
  // The artifact viewer's sandbox silently no-ops window.prompt()/alert(),
  // so bench-passcode entry and goal logging use this in-page modal instead.
  function openModal({title, fields = [], okText = 'OK', note = '', extraText = '', safeFocus = false, bodyHtml = null, cancelHidden = false}){
    return new Promise((resolve) => {
      const overlay = document.getElementById('modal-overlay');
      const cardEl = overlay.querySelector('.modal-card');
      const titleEl = document.getElementById('modal-title');
      const fieldsEl = document.getElementById('modal-fields');
      const noteEl = document.getElementById('modal-note');
      const okBtn = document.getElementById('modal-ok');
      const cancelBtn = document.getElementById('modal-cancel');
      const extraBtn = document.getElementById('modal-extra');
      const previousFocus = document.activeElement;
      if (cardEl) cardEl.classList.toggle('modal-boxscore', bodyHtml != null);
      extraBtn.hidden = !extraText;
      extraBtn.textContent = extraText;
      extraBtn.style.order = '0';
      okBtn.style.order = extraText ? '1' : '2';
      cancelBtn.style.order = extraText ? '2' : '1';
      cancelBtn.hidden = !!cancelHidden;

      titleEl.textContent = title;
      if (bodyHtml != null) { fieldsEl.innerHTML = bodyHtml; }
      else fieldsEl.innerHTML = fields.map(f => {
        if (f.type === 'select') {
          const opts = (f.options || []).map(o =>
            `<option value="${o.value}"${o.value === f.value ? ' selected' : ''}>${o.label}</option>`
          ).join('');
          return `
            <div class="modal-field">
              <label for="modal-f-${f.id}">${f.label}</label>
              <select id="modal-f-${f.id}">${opts}</select>
            </div>`;
        }
        return `
          <div class="modal-field">
            <label for="modal-f-${f.id}">${f.label}</label>
            <input id="modal-f-${f.id}" type="${f.type || 'text'}" placeholder="${f.placeholder || ''}" value="${f.value != null ? f.value : ''}" autocomplete="off">
          </div>`;
      }).join('');
      if (note) { noteEl.textContent = note; noteEl.style.display = 'block'; } else { noteEl.style.display = 'none'; }
      okBtn.textContent = okText;
      overlay.hidden = false;
      const firstField = fieldsEl.querySelector('input, select');
      const focusTimer = setTimeout(() => { (safeFocus ? cancelBtn : (firstField || okBtn)).focus(); }, 50);

      function collect(){
        const out = {};
        fields.forEach(f => { out[f.id] = document.getElementById('modal-f-' + f.id).value; });
        return out;
      }
      function cleanup(result){
        overlay.hidden = true;
        clearTimeout(focusTimer);
        extraBtn.removeEventListener('click', onExtra);
        if (previousFocus && previousFocus.isConnected) previousFocus.focus();
        okBtn.removeEventListener('click', onOk);
        cancelBtn.removeEventListener('click', onCancel);
        overlay.removeEventListener('keydown', onKey);
        resolve(result);
      }
      function onOk(){ cleanup(collect()); }
      function onCancel(){ cleanup(null); }
      function onExtra(){ cleanup({action:'delete'}); }
      function onKey(e){
        // Ignore Enter while a <select> has focus — arrow-key-then-Enter is how you
        // confirm a dropdown choice, and treating that as "submit the whole form" was
        // causing accidental early submits before every field was filled in.
        if (e.key === 'Enter' && e.target && !['SELECT','BUTTON'].includes(e.target.tagName)) { e.preventDefault(); onOk(); }
        if (e.key === 'Escape') { e.preventDefault(); onCancel(); }
        if (e.key === 'Tab') {
          const focusable = Array.from(overlay.querySelectorAll('input, select, button')).filter(el => !el.hidden && !el.disabled);
          const first = focusable[0], last = focusable[focusable.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      }
      extraBtn.addEventListener('click', onExtra);
      okBtn.addEventListener('click', onOk);
      cancelBtn.addEventListener('click', onCancel);
      overlay.addEventListener('keydown', onKey);
    });
  }
  function openAlert(message){
    return openModal({ title: 'Heads up', fields: [], okText: 'OK', note: message });
  }

  // --- Live Game Tracker ---
  (function(){
    const board = document.getElementById('live-board');
    const boxscoreCard = document.getElementById('boxscore-card');
    const benchToggle = document.getElementById('bench-toggle');
    const benchPanel = document.getElementById('bench-panel');
    const statusMsg = document.getElementById('bc-status');
    const seedEl = document.getElementById('live-game-seed');
    const oppSelect = document.getElementById('bc-opponent');
    const oppOther = document.getElementById('bc-opponent-other');
    const goalieStartSelect = document.getElementById('bc-goalie-start');

    function isBenchAuthed(){
      try { return localStorage.getItem('lwpBenchAuth') === '1'; } catch(e) { return false; }
    }
    function newId(){ return 'e' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

    const PERIOD_LENGTH_MS = 12 * 60 * 1000; // default period length: 12:00, counting down
    function blankGame(){
      return { active:false, opponent:'', gameId:'', date:'', period:1, events:[], clockRunning:false, clockStartedAt:null, clockElapsedMs:PERIOD_LENGTH_MS, periodLabel:'', periodLengthMs:PERIOD_LENGTH_MS, absentPlayers:[], goalieStart:'Adde Zuck', goalieChanges:[] };
    }
    function normalizeEvent(e){
      return {
        id: e.id || newId(),
        type: ['penalty','goal','goalieChange','shootout'].includes(e.type) ? e.type : 'goal',
        team: e.team === 'opp' ? 'opp' : 'us',
        from: e.from || '', to: e.to || '',
        scorer: e.scorer || '',
        assist1: e.assist1 || e.assist || '',
        assist2: e.assist2 || '',
        player: e.player || '',
        oppNum: e.oppNum || '',
        oppAssist1: e.oppAssist1 || '',
        oppAssist2: e.oppAssist2 || '',
        note: e.note || '',
        minutes: parseFloat(e.minutes) || 2,
        infraction: e.infraction || '',
        period: e.period || 1,
        elapsedMs: typeof e.elapsedMs === 'number' ? e.elapsedMs : 0
      };
    }
    function normalizeGame(g){
      if (!g || typeof g !== 'object') return blankGame();
      const out = Object.assign(blankGame(), g);
      out.events = Array.isArray(g.events) ? g.events.map(normalizeEvent) : [];
      out.absentPlayers = Array.isArray(g.absentPlayers) ? g.absentPlayers : [];
      out.goalieStart = g.goalieStart || 'Adde Zuck';
      out.goalieChanges = Array.isArray(g.goalieChanges) ? g.goalieChanges : [];
      out.shootoutWinner = g.shootoutWinner === 'opp' ? 'opp' : (g.shootoutWinner === 'us' ? 'us' : '');
      return out;
    }

    function normalizeHistoryEntry(h){
      return {
        id: h.id || newId(),
        opponent: h.opponent || 'Opponent',
        date: h.date || '',
        gameId: h.gameId || '',
        home: typeof h.home === 'number' ? h.home : 0,
        away: typeof h.away === 'number' ? h.away : 0,
        events: Array.isArray(h.events) ? h.events.map(normalizeEvent) : [],
        absentPlayers: Array.isArray(h.absentPlayers) ? h.absentPlayers : [],
        goalieStart: h.goalieStart || '', goalieChanges: Array.isArray(h.goalieChanges) ? h.goalieChanges : [],
        endedAt: Number(h.endedAt) || 0,
        displaySuppressed: !!h.displaySuppressed,
        manual: !!h.manual,
        shootoutWinner: h.shootoutWinner === 'opp' ? 'opp' : (h.shootoutWinner === 'us' ? 'us' : '')
      };
    }

    let game, history, scheduleResults = {};
    let embeddedStateRevision = 0, embeddedSavedAt = 0;
    try {
      const seed = JSON.parse(seedEl.textContent || '{}');
      if (seed && typeof seed === 'object' && seed.game) {
        game = normalizeGame(seed.game);
        history = Array.isArray(seed.history) ? seed.history.map(normalizeHistoryEntry) : [];
        scheduleResults = (seed.scheduleResults && typeof seed.scheduleResults === 'object') ? seed.scheduleResults : {};
        embeddedStateRevision = Number(seed.stateRevision) || 0;
        embeddedSavedAt = Number(seed.savedAt) || 0;
      } else {
        game = normalizeGame(seed);
        history = [];
      }
    } catch(e) { game = blankGame(); history = []; scheduleResults = {}; }
    // Restore local-device state when it is newer/more complete than the embedded
    // artifact seed. This matters when a newly downloaded site file still contains
    // the pre-game seed but this browser has already archived a completed game.
    try {
      const local = JSON.parse(localStorage.getItem('lwpGameState') || 'null');
      if (local) {
        const localHist = Array.isArray(local.history) ? local.history : [];
        const localResults = (local.scheduleResults && typeof local.scheduleResults === 'object') ? local.scheduleResults : {};
        const embeddedResultCount = Object.keys(scheduleResults || {}).length;
        const localSavedAt = Number(local.savedAt) || 0;
        const localStateRevision = Number(local.stateRevision) || 0;
        const localHasVersion = localSavedAt > 0 || localStateRevision > 0;
        const embeddedHasVersion = embeddedSavedAt > 0 || embeddedStateRevision > 0;
        const localIsNewer = localHasVersion && (!embeddedHasVersion ||
          localSavedAt > embeddedSavedAt ||
          (localSavedAt === embeddedSavedAt && localStateRevision > embeddedStateRevision));
        // Keep the old completeness fallback for states written before versioning.
        const localIsMoreComplete = !localHasVersion && !embeddedHasVersion &&
          (localHist.length > history.length || Object.keys(localResults).length > embeddedResultCount || !!(local.game && local.game.active));
        if (local.game && Array.isArray(local.history) && local.scheduleResults && (localIsNewer || localIsMoreComplete)) {
          game = normalizeGame(local.game);
          history = localHist.map(normalizeHistoryEntry);
          scheduleResults = localResults;
        }
      }
    } catch(e) {}

    // Sep 6 PTL result is embedded as an authoritative recovery record supplied
    // directly after the game, so an older local browser cache cannot erase it.
    const sep6Recovery = normalizeHistoryEntry({
      id:'h-sep6-ptl', gameId:'game-sep-6-ptl-12u-aa', opponent:'PTL 12U AA', date:'Sep 6', home:0, away:1,
      manual:false, goalieStart:'Ana Straker', shootoutWinner:'opp',
      absentPlayers:['Olivia Schortman','Mackenzie Moore','Lizzie Melchiorre'],
      goalieChanges:[{from:'Ana Straker',to:'Adde Zuck',period:2,elapsedMs:360000}],
      events:[
        {type:'goalieChange',team:'us',from:'Ana Straker',to:'Adde Zuck',period:2,elapsedMs:360000},
        {type:'penalty',team:'opp',period:2,elapsedMs:554000,infraction:'Cross-Checking',minutes:1},
        {type:'penalty',team:'opp',period:3,elapsedMs:317000,infraction:'Cross-Checking',minutes:1},
        {type:'shootout',team:'opp',period:5,elapsedMs:0}
      ]
    });
    const savedPTL=history.find(h=>h.gameId===sep6Recovery.gameId || (h.date==='Sep 6' && h.opponent==='PTL 12U AA'));
    if(savedPTL){
      (savedPTL.events||[]).filter(e=>e.type==='goalieChange').forEach(e=>{
        const swap=(savedPTL.goalieChanges||[]).find(c=>c.period===e.period && c.elapsedMs===e.elapsedMs);
        if(!e.from)e.from=swap?.from || 'Ana Straker';
        if(!e.to)e.to=swap?.to || 'Adde Zuck';
      });
    }
    if(!savedPTL)history.unshift(sep6Recovery);
    scheduleResults['game-sep-6-ptl-12u-aa'] = [0,1];

    // September 12: Wolfpack 2, Wallingford Hawks Blue 2.
    {
      const gameId = 'game-sep-12-wallingford-hawks-blue';
      const matches = h => h && (h.gameId === gameId ||
        (h.date === 'Sep 12' && h.opponent === 'Wallingford Hawks Blue'));
      const saved = history.find(matches);
      const active = matches(game) ? game : null;
      const details = saved || active || {};
      const marker = 'whb-sep12-goal-1-v2';

      if (!saved || !(saved.events || []).some(e => e.id === marker)) {
        const corrected = normalizeHistoryEntry({
          ...details,
          id: saved?.id || 'h-sep12-wallingford',
          gameId,
          opponent: 'Wallingford Hawks Blue', date: 'Sep 12',
          home: 2, away: 2, manual: false, shootoutWinner: '',
          goalieStart: 'Ana Straker',
          goalieChanges: [],
          absentPlayers: [...new Set([
            ...(details.absentPlayers || []).filter(name => name !== 'Ana Straker'),
            'Adde Zuck'
          ])],
          events: [
            {id:'whb-sep12-penalty-1', type:'penalty', team:'us',
              player:'Bailey Pelletier', infraction:'Tripping', minutes:1,
              period:2, elapsedMs:438000},
            {id:marker, type:'goal', team:'us', scorer:'Bailey Moore',
              assist1:'Mackenzie Moore', period:3, elapsedMs:701000},
            {id:'whb-sep12-goal-2', type:'goal', team:'us', scorer:'Bailey Moore',
              assist1:'Whitney Noe', period:3, elapsedMs:233000},
            {id:'whb-sep12-goal-3', type:'goal', team:'opp', oppNum:'11',
              oppAssist1:'13', oppAssist2:'23', period:3, elapsedMs:150000},
            {id:'whb-sep12-goal-4', type:'goal', team:'opp', oppNum:'4',
              oppAssist1:'11', period:3, elapsedMs:16000}
          ]
        });
        history = [corrected, ...history.filter(h => !matches(h))];
      }
      const finalResult = history.find(matches);
      scheduleResults[gameId] = [finalResult.home, finalResult.away];
      if (active) game = blankGame();
    }

    // September 13: Avon 4, Wolfpack 1. Confirmed game report.
    {
      const gameId='game-sep-13-avon-12u-b';
      const matches=h=>h && (h.gameId===gameId ||
        (h.date==='Sep 13' && h.opponent==='Avon 12U B'));
      const saved=history.find(matches);
      const active=matches(game)?game:null;
      const reportMarker='avon-sep13-goal-1-v1';
      if(!saved || !(saved.events || []).some(e=>e.id===reportMarker)){
        const corrected=normalizeHistoryEntry({
          ...(saved || {}), id:saved?.id || 'h-sep13-avon', gameId,
          opponent:'Avon 12U B', date:'Sep 13', home:1, away:4,
          manual:false, shootoutWinner:'', goalieStart:'Ana Straker',
          goalieChanges:[], absentPlayers:['Adde Zuck'],
          events:[
            {id:reportMarker,type:'goal',team:'opp',period:1,elapsedMs:657000,oppNum:'11',oppAssist1:'1'},
            {id:'avon-sep13-goal-2',type:'goal',team:'opp',period:2,elapsedMs:346000,oppNum:'93',oppAssist1:'21'},
            {id:'avon-sep13-goal-3',type:'goal',team:'us',period:2,elapsedMs:289000,scorer:'Evangeline Zhang'},
            {id:'avon-sep13-goal-4',type:'goal',team:'opp',period:3,elapsedMs:84000,oppNum:'21'},
            {id:'avon-sep13-goal-5',type:'goal',team:'opp',period:3,elapsedMs:17000,oppNum:'34'}
          ]
        });
        history=[corrected,...history.filter(h=>!matches(h))];
      }
      const finalResult=history.find(matches);
      scheduleResults[gameId]=[finalResult.home,finalResult.away];
      if(active)game=blankGame();
    }

    // September 19: Wonderland Wizards 12U B Blue 6, Wolfpack 1. Confirmed game report.
    {
      const gameId='game-sep-19-wonderland-wizards-12u-b-blue';
      const matches=h=>h && (h.gameId===gameId ||
        (h.date==='Sep 19' && h.opponent==='Wonderland Wizards 12U B Blue'));
      const saved=history.find(matches);
      const active=matches(game)?game:null;
      const reportMarker='wonderland-sep19-goal-1-v1';
      if(!saved || !(saved.events || []).some(e=>e.id===reportMarker)){
        const corrected=normalizeHistoryEntry({
          ...(saved || {}), id:saved?.id || 'h-sep19-wonderland', gameId,
          opponent:'Wonderland Wizards 12U B Blue', date:'Sep 19', home:1, away:6,
          manual:false, shootoutWinner:'', goalieStart:'Ana Straker',
          goalieChanges:[], absentPlayers:['Eve Krause','Hailey Reilly','Adde Zuck'],
          events:[
            {id:reportMarker,type:'goal',team:'us',period:1,elapsedMs:605000,scorer:'Bailey Pelletier'},
            {id:'wonderland-sep19-goal-2',type:'goal',team:'opp',period:2,elapsedMs:639000,oppNum:'9',oppAssist1:'17'},
            {id:'wonderland-sep19-goal-3',type:'goal',team:'opp',period:2,elapsedMs:570000,oppNum:'23',oppAssist1:'24'},
            {id:'wonderland-sep19-goal-4',type:'goal',team:'opp',period:2,elapsedMs:482000,oppNum:'86'},
            {id:'wonderland-sep19-goal-5',type:'goal',team:'opp',period:3,elapsedMs:169000,oppNum:'33'},
            {id:'wonderland-sep19-goal-6',type:'goal',team:'opp',period:3,elapsedMs:94000,oppNum:'9',oppAssist1:'7'},
            {id:'wonderland-sep19-goal-7',type:'goal',team:'opp',period:3,elapsedMs:81000,oppNum:'29',oppAssist1:'32',note:'Jersey #s unclear on scoresheet'}
          ]
        });
        history=[corrected,...history.filter(h=>!matches(h))];
      }
      const finalResult=history.find(matches);
      scheduleResults[gameId]=[finalResult.home,finalResult.away];
      if(active)game=blankGame();
    }

    // September 20: West Haven A1 4, Wolfpack 4. Confirmed game report.
    {
      const gameId='game-sep-20-west-haven-a1';
      const matches=h=>h && (h.gameId===gameId ||
        (h.date==='Sep 20' && h.opponent==='West Haven A1'));
      const saved=history.find(matches);
      const active=matches(game)?game:null;
      const reportMarker='westhaven-sep20-goal-1-v1';
      if(!saved || !(saved.events || []).some(e=>e.id===reportMarker)){
        const corrected=normalizeHistoryEntry({
          ...(saved || {}), id:saved?.id || 'h-sep20-westhaven', gameId,
          opponent:'West Haven A1', date:'Sep 20', home:4, away:4,
          manual:false, shootoutWinner:'', goalieStart:'Adde Zuck',
          goalieChanges:[{from:'Adde Zuck',to:'Ana Straker',period:2,elapsedMs:360000}],
          absentPlayers:['Hailey Reilly'],
          events:[
            {id:reportMarker,type:'goal',team:'opp',period:1,elapsedMs:386000,oppNum:'7',oppAssist1:'3'},
            {id:'westhaven-sep20-goal-2',type:'goal',team:'us',period:1,elapsedMs:205000,scorer:'Bailey Pelletier',assist1:'Lizzie Melchiorre'},
            {id:'westhaven-sep20-goal-3',type:'goal',team:'opp',period:1,elapsedMs:195000,oppNum:'3',oppAssist1:'8'},
            {id:'westhaven-sep20-penalty-1',type:'penalty',team:'opp',period:2,elapsedMs:677000,infraction:'Hooking',minutes:1.5},
            {id:'westhaven-sep20-goal-4',type:'goal',team:'opp',period:2,elapsedMs:575000,oppNum:'63'},
            {id:'westhaven-sep20-goal-5',type:'goal',team:'us',period:2,elapsedMs:420000,scorer:'Eve Krause'},
            {id:'westhaven-sep20-goalie-change',type:'goalieChange',team:'us',from:'Adde Zuck',to:'Ana Straker',period:2,elapsedMs:360000},
            {id:'westhaven-sep20-goal-6',type:'goal',team:'opp',period:2,elapsedMs:101000,oppNum:'48'},
            {id:'westhaven-sep20-goal-7',type:'goal',team:'us',period:3,elapsedMs:672000,scorer:'Bailey Pelletier'},
            {id:'westhaven-sep20-goal-8',type:'goal',team:'us',period:3,elapsedMs:409000,scorer:'Nia Lorenzi',assist1:'Bailey Pelletier'}
          ]
        });
        history=[corrected,...history.filter(h=>!matches(h))];
      }
      const finalResult=history.find(matches);
      scheduleResults[gameId]=[finalResult.home,finalResult.away];
      if(active)game=blankGame();
    }

    GAMES.forEach(g => {
      if (scheduleResults[g.id]) g.result = [Number(scheduleResults[g.id][0]) || 0, Number(scheduleResults[g.id][1]) || 0];
    });

    function periodLabel(p){
      if (p === 4) return 'OT';
      if (p >= 5) return 'SO';
      return ({1:'1st',2:'2nd',3:'3rd'})[p] || (p + 'th');
    }
    function periodHeading(p){
      return p <= 3 ? periodLabel(p) + ' Period' : periodLabel(p);
    }
    function fmtClock(ms){
      const total = Math.max(0, Math.floor((ms || 0) / 1000));
      const m = Math.floor(total / 60), s = total % 60;
      return String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
    }
    function parseClock(str, fallbackMs){
      const m = String(str || '').trim().match(/^(\d{1,3}):([0-5]?\d)$/);
      if (!m) return fallbackMs || 0;
      return (parseInt(m[1], 10) * 60 + parseInt(m[2], 10)) * 1000;
    }
    // Clock counts DOWN from PERIOD_LENGTH_MS to 0 each period (game.clockElapsedMs holds
    // the time REMAINING, not elapsed — matches how imported official-scoresheet times are stored).
    function currentElapsedMs(){
      if (game.clockRunning && game.clockStartedAt) return Math.max(0, game.clockElapsedMs - (Date.now() - game.clockStartedAt));
      return Math.max(0, game.clockElapsedMs);
    }
    function tallyEvents(events){
      let home = 0, away = 0;
      (events || []).forEach(e => {
        if (e.type === 'goal' || e.type === 'shootout') {
          if (e.team === 'us') home++; else away++;
        }
      });
      return { home, away };
    }
    function tally(){ return tallyEvents(game.events); }
    function rosterSorted(){ return ROSTER.slice().sort((a, b) => a.n - b.n); }
    function playerLabel(name){
      const p = ROSTER.find(r => r.name === name);
      return p ? `#${p.n} ${p.name}` : (name || '');
    }
    function rosterSelectOptions(blankLabel){
      const opts = blankLabel != null ? [{ value:'', label: blankLabel }] : [];
      return opts.concat(rosterSorted().map(p => ({ value:p.name, label:`#${p.n} ${p.name}` })));
    }
    function periodSelectOptions(){
      return [1,2,3,4,5].map(p => ({ value:String(p), label: periodHeading(p) }));
    }
    function goalieChangeFields(ev){
      const options=ROSTER.filter(p=>p.pos==='G').map(p=>({value:p.name,label:'#'+p.n+' '+p.name}));
      return [
        {id:'from',type:'select',label:'Goalie leaving',options,value:ev.from},
        {id:'to',type:'select',label:'Goalie entering',options,value:ev.to},
        {id:'period',type:'select',label:'Period',options:periodSelectOptions(),value:String(ev.period)},
        {id:'time',label:'Time remaining (mm:ss)',value:fmtClock(ev.elapsedMs)}
      ];
    }
    async function editGoalieChange(ev,owner){
      const result=await openModal({title:'Edit Goalie Change',fields:goalieChangeFields(ev),okText:'Save'});
      if(!result)return false;
      if(!result.from || !result.to || result.from===result.to){await openAlert('Choose two different goalies.');return false;}
      ev.from=result.from;ev.to=result.to;
      ev.period=parseInt(result.period,10)||ev.period;
      ev.elapsedMs=parseClock(result.time,ev.elapsedMs);
      owner.goalieChanges=(owner.events||[]).filter(e=>e.type==='goalieChange').slice().sort((a,b)=>a.period-b.period||b.elapsedMs-a.elapsedMs).map(e=>({from:e.from,to:e.to,period:e.period,elapsedMs:e.elapsedMs}));
      if(owner.goalieChanges.length)owner.goalieStart=owner.goalieChanges[0].from;
      return true;
    }

    function goalFields(ev){
      return [
        { id:'scorer', type:'select', label:'Who scored?', options: rosterSelectOptions('— Select scorer —'), value: ev.scorer || '' },
        { id:'assist1', type:'select', label:'Assist 1 (optional)', options: rosterSelectOptions('No assist'), value: ev.assist1 || '' },
        { id:'assist2', type:'select', label:'Assist 2 (optional)', options: rosterSelectOptions('No assist'), value: ev.assist2 || '' },
        { id:'period', type:'select', label:'Period', options: periodSelectOptions(), value: String(ev.period || game.period) },
        { id:'time', label:'Time remaining (mm:ss)', placeholder:'e.g. 08:45', value: fmtClock(ev.elapsedMs) }
      ];
    }
    function applyGoalFields(ev, result){
      ev.scorer = (result.scorer || '').trim();
      ev.assist1 = (result.assist1 || '').trim();
      ev.assist2 = (result.assist2 || '').trim();
      ev.period = parseInt(result.period, 10) || ev.period;
      ev.elapsedMs = parseClock(result.time, ev.elapsedMs);
    }
    function penaltyFields(ev){
      const playerOpts = [{ value:'__opp__', label:'Opponent Penalty' }].concat(rosterSorted().map(p => ({ value:p.name, label:`#${p.n} ${p.name}` })));
      return [
        { id:'player', type:'select', label:'Player', options: playerOpts, value: ev.team === 'opp' ? '__opp__' : (ev.player || '') },
        { id:'minutes', type:'select', label:'Minutes', options:[1,1.5,2,4,5,10].map(m => ({ value:String(m), label:(m===1.5?'1:30':m+' min') })), value: String(ev.minutes || 2) },
        { id:'infraction', label:'Infraction (optional)', placeholder:'e.g. Tripping', value: ev.infraction || '' },
        { id:'period', type:'select', label:'Period', options: periodSelectOptions(), value: String(ev.period || game.period) },
        { id:'time', label:'Time remaining (mm:ss)', placeholder:'e.g. 08:45', value: fmtClock(ev.elapsedMs) }
      ];
    }
    function applyPenaltyFields(ev, result){
      if (result.player === '__opp__') { ev.team = 'opp'; ev.player = ''; }
      else { ev.team = 'us'; ev.player = (result.player || '').trim(); }
      ev.minutes = parseFloat(result.minutes) || 2;
      ev.infraction = (result.infraction || '').trim();
      ev.period = parseInt(result.period, 10) || ev.period;
      ev.elapsedMs = parseClock(result.time, ev.elapsedMs);
    }

    // events + opponentName are explicit params so this also serves the Season-tab
    // boxscore accordion (via window.__lwp below), not just the live game.
    function computeLeaders(events){
      const map = {};
      (events || []).forEach(e => {
        if (e.type !== 'goal' || e.team !== 'us') return;
        if (e.scorer) { map[e.scorer] = map[e.scorer] || { g:0, a:0 }; map[e.scorer].g++; }
        [e.assist1, e.assist2].forEach(a => { if (a) { map[a] = map[a] || { g:0, a:0 }; map[a].a++; } });
      });
      return Object.entries(map)
        .map(([name, v]) => ({ name, g:v.g, a:v.a, pts: v.g + v.a }))
        .sort((x, y) => y.pts - x.pts || y.g - x.g);
    }
    function eventDesc(e, opponentName){
      const oppName = opponentName || 'Opponent';
      if (e.type === 'shootout') {
        const winner = e.team === 'us' ? 'Wolfpack' : oppName;
        return `<b>Shootout</b> — ${winner} wins`;
      }
      if (e.type === 'goalieChange') { return `<b>Goalie change</b> — ${e.from || 'Unknown'} → ${e.to || 'Unknown'}`; }
      if (e.type === 'penalty') {
        if (e.team === 'us') {
          const who = playerLabel(e.player) || 'Wolfpack';
          return `<b>${who}</b> penalty &mdash; ${e.minutes === 1.5 ? '1:30' : (e.minutes || 2) + ' min'}${e.infraction ? ' &middot; ' + e.infraction : ''}`;
        }
        const who = e.oppNum ? `${oppName} #${e.oppNum}` : oppName;
        return `<b>${who}</b> penalty &mdash; ${e.minutes === 1.5 ? '1:30' : (e.minutes || 2) + ' min'}${e.infraction ? ' &middot; ' + e.infraction : ''}`;
      }
      if (e.team === 'us') {
        const assists = [e.assist1, e.assist2].filter(Boolean).map(playerLabel);
        let main = `<b>${e.scorer ? playerLabel(e.scorer) : 'Wolfpack'}</b> goal`;
        if (e.note) main += ` <span class="muted">(${e.note})</span>`;
        const sub = assists.length ? `Assisted by ${assists.join(' &amp; ')}` : 'Unassisted';
        return `<div class="play-main">${main}</div><div class="play-sub${assists.length ? '' : ' none'}">${sub}</div>`;
      }
      let main = `<b>${oppName}${e.oppNum ? ' #' + e.oppNum : ''}</b> goal`;
      const oAssists = [e.oppAssist1, e.oppAssist2].filter(Boolean).map(n => '#' + n);
      if (e.note) main += ` <span class="muted">(${e.note})</span>`;
      const oSub = oAssists.length ? `Assisted by ${oAssists.join(' &amp; ')}` : 'Unassisted';
      return `<div class="play-main">${main}</div><div class="play-sub${oAssists.length ? '' : ' none'}">${oSub}</div>`;
    }

    // Bridge for the Season-tab boxscore accordion (defined outside this IIFE, further
    // up the page) — it needs live access to history plus these render helpers.
    window.__lwp = {
      getHistory: () => history,
      getGame: () => game,
      computeLeaders, eventDesc, periodHeading, fmtClock, playerLabel, isBenchAuthed
    };

    const RINK_BG_SVG = `<svg viewBox="0 0 600 300" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="592" height="292" rx="70" ry="70" fill="none" stroke="rgba(127,212,232,.35)" stroke-width="4"/>
      <line x1="300" y1="4" x2="300" y2="296" stroke="rgba(226,35,63,.4)" stroke-width="3"/>
      <line x1="185" y1="4" x2="185" y2="296" stroke="rgba(127,212,232,.28)" stroke-width="3"/>
      <line x1="415" y1="4" x2="415" y2="296" stroke="rgba(127,212,232,.28)" stroke-width="3"/>
      <circle cx="300" cy="150" r="48" fill="none" stroke="rgba(226,35,63,.4)" stroke-width="3"/>
      <circle cx="300" cy="150" r="3.5" fill="rgba(226,35,63,.5)"/>
      <circle cx="120" cy="78" r="36" fill="none" stroke="rgba(226,35,63,.26)" stroke-width="2.5"/>
      <circle cx="120" cy="222" r="36" fill="none" stroke="rgba(226,35,63,.26)" stroke-width="2.5"/>
      <circle cx="480" cy="78" r="36" fill="none" stroke="rgba(226,35,63,.26)" stroke-width="2.5"/>
      <circle cx="480" cy="222" r="36" fill="none" stroke="rgba(226,35,63,.26)" stroke-width="2.5"/>
      <path d="M 34 122 A 28 28 0 0 1 34 178" fill="none" stroke="rgba(127,212,232,.3)" stroke-width="3"/>
      <path d="M 566 122 A 28 28 0 0 0 566 178" fill="none" stroke="rgba(127,212,232,.3)" stroke-width="3"/>
    </svg>`;

    function updateLiveBanner(t){
      const banner = document.getElementById('live-banner');
      const score = document.getElementById('live-banner-score');
      const meta = document.getElementById('live-banner-meta');
      if (!banner || !score || !meta) return;
      if (!game.active) { banner.classList.remove('show'); return; }
      banner.classList.add('show');
      score.textContent = `Lady Wolfpack U12-2 ${t.home} – ${game.opponent || 'Opponent'} ${t.away}`;
      meta.textContent = `${periodLabel(game.period)} · ${fmtClock(currentElapsedMs())}`;
    }

    // Legacy latest game has no end timestamp: give this version one fixed 24-hour window.
    const LEGACY_FINAL_STARTED_AT = 1788716821562;
    function retainedFinal(now = Date.now()){
      if(game.active) return null;
      const latest=history.filter(h=>!h.manual).slice().sort((a,b)=>(b.endedAt||0)-(a.endedAt||0))[0];
      if(!latest || latest.displaySuppressed) return null;
      const ended=latest.endedAt || (latest.gameId==='game-sep-6-ptl-12u-aa'?LEGACY_FINAL_STARTED_AT:0);
      return ended && now>=ended && now-ended<24*60*60*1000 ? latest : null;
    }
    function renderWeekendResults(){
      const el=document.getElementById('scores-weekend-results');
      if(!el) return;
      const games=homeWeekendGroups().current.games.filter(g=>g.result);
      el.innerHTML=games.map(g=>{
        const [us,them]=g.result;
        return '<div class="card" style="padding:16px 20px;"><div style="display:flex;justify-content:space-between;gap:16px;align-items:center;"><div><b>'+g.opp+'</b><div class="muted">'+g.day+' · '+g.date+' · '+g.loc+'</div></div><span class="result '+(us>them?'w':us<them?'l':'pending')+'">'+(us>them?'W':us<them?'L':'T')+' '+us+'–'+them+'</span></div></div>';
      }).join('') || '<div class="card muted" style="padding:18px;">No completed games this weekend yet.</div>';
    }

    function render(){
      const finalGame = retainedFinal();
      const shownGame = finalGame || game;
      const t = finalGame ? {home:finalGame.home,away:finalGame.away} : tally();
      updateLiveBanner(t);
      renderWeekendResults();
      renderHomeWeekends(game, t);
      const liveDot = document.getElementById('scores-live-dot');
      if (liveDot) liveDot.hidden = !game.active;
      if (!game.active && !game.opponent && !finalGame) {
        board.innerHTML = '<div class="muted" style="text-align:center;padding:10px 0;">No live game right now. When the bench turns on controls below and starts a game, the score shows here live for everyone watching.</div>';
      } else {
        board.innerHTML = `
          <div class="scoreboard">
            <div class="rink-bg" aria-hidden="true">${RINK_BG_SVG}</div>
            <div class="sb-side us">
              <div class="sb-name">Wolfpack</div>
              <div class="sb-score mono">${t.home}</div>
            </div>
            <div class="sb-mid">
              <div class="sb-clock">${finalGame ? 'Final score' : periodLabel(game.period)+' &middot; '+fmtClock(currentElapsedMs())}</div>
              <div class="sb-status${game.active && game.clockRunning ? ' live' : ''}">${!game.active ? 'FINAL' : (game.clockRunning ? '● LIVE' : 'PAUSED')}</div>
            </div>
            <div class="sb-side opp">
              <div class="sb-name">${shownGame.opponent || 'Opponent'}</div>
              <div class="sb-score mono">${t.away}</div>
            </div>
          </div>`;
      }
      renderBoxscore(finalGame);
      updateGameToggleButton();
      updateClockDisplay();
      renderBenchHistoryList();
      if (typeof renderRecord === 'function') renderRecord();
      if (typeof renderMonths === 'function') renderMonths();
      if (typeof renderStats === 'function') renderStats();
      if (typeof renderGoalies === 'function') renderGoalies();
    }

    const gameToggleBtn = document.getElementById('bc-game-toggle');
    function updateGameToggleButton(){
      if (!gameToggleBtn) return;
      if (game.active) {
        gameToggleBtn.textContent = 'End Game';
        gameToggleBtn.classList.remove('bench-btn');
        gameToggleBtn.classList.add('bench-btn', 'red');
        oppSelect.disabled = true;
        oppOther.disabled = true;
        if (goalieStartSelect) goalieStartSelect.disabled = true;
      } else {
        gameToggleBtn.textContent = 'Start Game';
        gameToggleBtn.classList.remove('red');
        oppSelect.disabled = false;
        oppOther.disabled = false;
        if (goalieStartSelect) goalieStartSelect.disabled = false;
      }
    }

    const clockToggleBtn = document.getElementById('bc-clock-toggle');
    const clockBigEl = document.getElementById('bc-clock-big');
    const clockSubEl = document.getElementById('bc-clock-sub');
    function updateClockDisplay(){
      if (clockToggleBtn) clockToggleBtn.textContent = game.clockRunning ? 'Pause Clock' : 'Start Clock';
      if (clockBigEl) clockBigEl.textContent = fmtClock(currentElapsedMs());
      if (clockSubEl) clockSubEl.textContent = periodHeading(game.period) + (game.active ? (game.clockRunning ? ' · Running' : ' · Paused') : ' · No active game');
    }

    // Bench-only management list (Bench Controls panel, passcode-gated) — the public
    // Scores tab no longer shows a Season Log list; full boxscores live on the Season
    // tab instead (tap a played game there to expand it). This is for Fred to fix a
    // mistyped past game, correct a goal/penalty after the fact, or delete a stray
    // test entry. "Manage" expands a row in place to show its full play-by-play with
    // per-entry Edit/Delete — the same controls available on an in-progress game are
    // available here for games that have already been ended/archived.
    let expandedHistoryKey = null;
    function findHistoryGame(id){ return history.find(h => h.id === id); }
    function recomputeHistoryScore(h){
      // Only auto-derive the score from events for games that actually have
      // play-by-play; a manually-added past game (no events) keeps its typed-in score.
      if (h.events && h.events.length) {
        const t = tallyEvents(h.events);
        h.home = t.home; h.away = t.away;
      }
    }
    function renderHistoryEventsHtml(h){
      const events = h.events || [];
      if (!events.length) {
        return '<div class="muted" style="font-size:12px;padding:6px 2px;">No play-by-play recorded for this game — use the buttons above to add it, or edit the score directly via "Game Info".</div>';
      }
      const byPeriod = {};
      events.filter(e=>e.type!=='penalty').forEach(e => { (byPeriod[e.period] = byPeriod[e.period] || []).push(e); });
      const periods = Object.keys(byPeriod).map(Number).sort((a, b) => a - b);
      return periods.map(p => `
        <div class="period-block">
          <h4>${periodHeading(p)}</h4>
          ${byPeriod[p].map(e => `
            <div class="play-row${e.type === 'penalty' ? ' penalty' : ''}">
              <span class="play-time">${fmtClock(e.elapsedMs)}</span>
              <div class="play-desc">${eventDesc(e, h.opponent)}</div>${winningGoalBadge(e,h)}
              <span class="event-row-actions">
                <button type="button" data-hev-edit="${h.id}|${e.id}">Edit</button>
                <button type="button" data-hev-del="${h.id}|${e.id}">Delete</button>
              </span>
            </div>
          `).join('')}
        </div>
      `).join('') + penaltySection(events,h.opponent,{periodHeading,fmtClock,eventDesc},e=>'<span class="event-row-actions"><button type="button" data-hev-edit="'+h.id+'|'+e.id+'">Edit</button><button type="button" data-hev-del="'+h.id+'|'+e.id+'">Delete</button></span>');
    }
    function renderHistoryManagePanel(h){
      return `
        <div class="hist-manage-panel">
          <div class="event-row-actions" style="margin:0 0 12px; justify-content:flex-start;">
            <button type="button" data-hist-info="${h.id}">Game Info</button>
            <button type="button" data-hist-addgoal-us="${h.id}">+ Wolfpack Goal</button>
            <button type="button" data-hist-addgoal-opp="${h.id}">+ Opponent Goal</button>
            <button type="button" data-hist-addpen="${h.id}">+ Penalty</button>
          </div>
          ${renderHistoryEventsHtml(h)}
        </div>`;
    }
    function renderBenchHistoryList(){
      const card = document.getElementById('bench-history-list');
      if (!card) return;
      if (!history.length) {
        card.innerHTML = '<div class="muted" style="text-align:center;padding:10px 0;font-size:12.5px;">No games logged yet.</div>';
        return;
      }
      card.innerHTML = history.map(h => {
        const resultClass = h.home > h.away ? 'w' : (h.home < h.away ? 'l' : 'pending');
        const resultLabel = h.home > h.away ? 'W' : (h.home < h.away ? 'L' : 'T');
        const isOpen = expandedHistoryKey === h.id;
        return `
        <div>
          <div class="game-row" style="${isOpen ? 'border-bottom:none;' : ''}">
            <div class="side home">${h.manual ? 'LOGGED' : 'TRACKED'}</div>
            <div><div class="opp">vs ${h.opponent}</div><div class="meta">${h.date || 'Date not set'}${h.events.length ? ' &middot; ' + h.events.filter(e=>e.type==='goal').length + ' goals logged' : ''}</div></div>
            <div style="text-align:right;">
              <div class="result ${resultClass}">${resultLabel} ${h.home}&ndash;${h.away}</div>
              <span class="event-row-actions" style="margin-top:6px;">
                <button type="button" data-hist-manage="${h.id}">${isOpen ? 'Close' : 'Manage'}</button>
                <button type="button" data-hist-del="${h.id}">Delete</button>
              </span>
            </div>
          </div>
          ${isOpen ? renderHistoryManagePanel(h) : ''}
        </div>`;
      }).join('');
      card.querySelectorAll('[data-hist-manage]').forEach(b => b.addEventListener('click', () => {
        expandedHistoryKey = expandedHistoryKey === b.dataset.histManage ? null : b.dataset.histManage;
        renderBenchHistoryList();
      }));
      card.querySelectorAll('[data-hist-del]').forEach(b => b.addEventListener('click', () => deleteHistoryEntry(b.dataset.histDel)));
      card.querySelectorAll('[data-hist-info]').forEach(b => b.addEventListener('click', () => editHistoryEntry(b.dataset.histInfo)));
      card.querySelectorAll('[data-hist-addgoal-us]').forEach(b => b.addEventListener('click', () => addHistoryGoal(b.dataset.histAddgoalUs, 'us')));
      card.querySelectorAll('[data-hist-addgoal-opp]').forEach(b => b.addEventListener('click', () => addHistoryGoal(b.dataset.histAddgoalOpp, 'opp')));
      card.querySelectorAll('[data-hist-addpen]').forEach(b => b.addEventListener('click', () => addHistoryPenalty(b.dataset.histAddpen)));
      card.querySelectorAll('[data-hev-edit]').forEach(b => b.addEventListener('click', () => editHistoryEvent(b.dataset.hevEdit)));
      card.querySelectorAll('[data-hev-del]').forEach(b => b.addEventListener('click', () => deleteHistoryEvent(b.dataset.hevDel)));
    }

    function pastGameFields(h){
      return [
        { id:'opponent', label:'Opponent', placeholder:'e.g. Florida Cyclones 12U', value: h.opponent || '' },
        { id:'date', label:'Date', placeholder:'e.g. Sep 4', value: h.date || '' },
        { id:'home', label:'Wolfpack Score', placeholder:'e.g. 3', value: String(h.home != null ? h.home : '') },
        { id:'away', label:'Opponent Score', placeholder:'e.g. 0', value: String(h.away != null ? h.away : '') }
      ];
    }
    function historyInfoFields(h){
      const fields = [
        { id:'opponent', label:'Opponent', placeholder:'e.g. Florida Cyclones 12U', value: h.opponent || '' },
        { id:'date', label:'Date', placeholder:'e.g. Sep 4', value: h.date || '' }
      ];
      if (!h.events || !h.events.length) {
        fields.push({ id:'home', label:'Wolfpack Score', placeholder:'e.g. 3', value: String(h.home != null ? h.home : '') });
        fields.push({ id:'away', label:'Opponent Score', placeholder:'e.g. 0', value: String(h.away != null ? h.away : '') });
      }
      return fields;
    }
    async function editHistoryEntry(id){
      const h = findHistoryGame(id);
      if (!h) return;
      const hasEvents = h.events && h.events.length;
      const result = await openModal({
        title: 'Edit Game Info',
        fields: historyInfoFields(h),
        okText: 'Save',
        note: hasEvents ? 'The score is calculated from the play-by-play below — edit or add an entry there to change it.' : ''
      });
      if (!result) return;
      h.opponent = (result.opponent || '').trim() || 'Opponent';
      h.date = (result.date || '').trim();
      if (!hasEvents) {
        h.home = parseInt(result.home, 10) || 0;
        h.away = parseInt(result.away, 10) || 0;
      }
      publishGame();
    }
    async function deleteHistoryEntry(id){
      const result = await openModal({ title:'Delete this game?', fields:[], okText:'Delete', note:'This removes it from the Season Log for everyone watching.' });
      if (!result) return;
      history = history.filter(h => h.id !== id);
      publishGame();
    }
    async function editHistoryEvent(key){
      const [hid, eid] = key.split('|');
      const h = findHistoryGame(hid);
      if (!h) return;
      const ev = (h.events || []).find(e => e.id === eid);
      if (!ev) return;
      if(ev.type==='goalieChange'){
        if(!await editGoalieChange(ev,h))return;
        publishGame();return;
      }
      if (ev.type === 'penalty') {
        const result = await openModal({ title:'Edit Penalty', fields: penaltyFields(ev), okText:'Save' });
        if (!result) return;
        applyPenaltyFields(ev, result);
      } else {
        const result = await openModal({ title:'Edit Goal', fields: goalFields(ev), okText:'Save' });
        if (!result) return;
        applyGoalFields(ev, result);
      }
      recomputeHistoryScore(h);
      publishGame();
    }
    async function deleteHistoryEvent(key){
      const [hid, eid] = key.split('|');
      const h = findHistoryGame(hid);
      if (!h) return;
      const result = await openModal({ title:'Delete this entry?', fields:[], okText:'Delete', note:'This removes it from that game’s boxscore for everyone watching.' });
      if (!result) return;
      h.events = (h.events || []).filter(e => e.id !== eid);
      recomputeHistoryScore(h);
      publishGame();
    }
    async function addHistoryGoal(hid, team){
      const h = findHistoryGame(hid);
      if (!h) return;
      if (team === 'us') {
        const blank = { scorer:'', assist1:'', assist2:'', period:1, elapsedMs:0 };
        const result = await openModal({ title:'Add Wolfpack Goal', fields: goalFields(blank), okText:'Add Goal' });
        if (!result) return;
        const ev = { id:newId(), type:'goal', team:'us', scorer:'', assist1:'', assist2:'', player:'', minutes:2, infraction:'', period:1, elapsedMs:0 };
        applyGoalFields(ev, result);
        h.events = (h.events || []).concat([ev]);
      } else {
        const fields = [
          { id:'oppNum', label:'Opponent # (optional)', placeholder:'e.g. 14', value:'' },
          { id:'oppAssist1', label:'Opponent Assist # (optional)', placeholder:'e.g. 7', value:'' },
          { id:'oppAssist2', label:'Opponent Assist 2 # (optional)', placeholder:'', value:'' },
          { id:'period', type:'select', label:'Period', options: periodSelectOptions(), value:'1' },
          { id:'time', label:'Time remaining (mm:ss)', placeholder:'e.g. 08:45', value:'12:00' }
        ];
        const result = await openModal({ title:'Add Opponent Goal', fields, okText:'Add Goal' });
        if (!result) return;
        h.events = (h.events || []).concat([{
          id:newId(), type:'goal', team:'opp', scorer:'', assist1:'', assist2:'', player:'',
          oppNum:(result.oppNum || '').trim(), oppAssist1:(result.oppAssist1 || '').trim(), oppAssist2:(result.oppAssist2 || '').trim(),
          note:'', minutes:2, infraction:'', period: parseInt(result.period, 10) || 1, elapsedMs: parseClock(result.time, 0)
        }]);
      }
      recomputeHistoryScore(h);
      publishGame();
    }
    async function addHistoryPenalty(hid){
      const h = findHistoryGame(hid);
      if (!h) return;
      const blank = { team:'us', player:'', minutes:2, infraction:'', period:1, elapsedMs:0 };
      const result = await openModal({ title:'Add Penalty', fields: penaltyFields(blank), okText:'Add Penalty' });
      if (!result) return;
      const ev = { id:newId(), type:'penalty', team:'us', scorer:'', assist1:'', assist2:'', player:'', minutes:2, infraction:'', period:1, elapsedMs:0 };
      applyPenaltyFields(ev, result);
      h.events = (h.events || []).concat([ev]);
      publishGame();
    }

    function renderBoxscore(finalGame = null){
      const source = finalGame || game;
      const events = source.events || [];
      if (!events.length) {
        boxscoreCard.innerHTML = '<div class="muted" style="text-align:center;padding:6px 0;">No plays logged yet.</div>';
        return;
      }
      const authed = !finalGame && isBenchAuthed();
      const leaders = computeLeaders(events);
      let html = '';
      if (leaders.length) {
        html += '<div class="boxscore-leaders">' + leaders.map(l => `
          <div class="leader-cell">
            <div class="ln">${playerLabel(l.name)}</div>
            <div class="ls">${l.g}G ${l.a}A &middot; ${l.pts} PTS</div>
          </div>
        `).join('') + '</div>';
      }
      const byPeriod = {};
      events.filter(e=>e.type!=='penalty').forEach(e => { (byPeriod[e.period] = byPeriod[e.period] || []).push(e); });
      const periods = Object.keys(byPeriod).map(Number).sort((a, b) => a - b);
      html += periods.map(p => `
        <div class="period-block">
          <h4>${periodHeading(p)}</h4>
          ${byPeriod[p].map(e => `
            <div class="play-row${e.type === 'penalty' ? ' penalty' : ''}">
              <span class="play-time">${fmtClock(e.elapsedMs)}</span>
              <div class="play-desc">${eventDesc(e, source.opponent)}</div>${winningGoalBadge(e,finalGame)}
              ${authed ? `<span class="event-row-actions">
                <button type="button" data-edit="${e.id}">Edit</button>
                <button type="button" data-del="${e.id}">Delete</button>
              </span>` : ''}
            </div>
          `).join('')}
        </div>
      `).join('');
      html += penaltySection(events,source.opponent,{periodHeading,fmtClock,eventDesc},e=>authed?'<span class="event-row-actions"><button type="button" data-edit="'+e.id+'">Edit</button><button type="button" data-del="'+e.id+'">Delete</button></span>':'');
      boxscoreCard.innerHTML = html;
      if (authed) {
        boxscoreCard.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => editEvent(b.dataset.edit)));
        boxscoreCard.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => deleteEventPrompt(b.dataset.del)));
      }
    }

    async function editEvent(id){
      const ev = (game.events || []).find(e => e.id === id);
      if (!ev) return;
      if(ev.type==='goalieChange'){
        if(!await editGoalieChange(ev,game))return;
        publishGame();return;
      }
      if (ev.type === 'penalty') {
        const result = await openModal({ title:'Edit Penalty', fields: penaltyFields(ev), okText:'Save' });
        if (!result) return;
        applyPenaltyFields(ev, result);
      } else {
        const result = await openModal({ title:'Edit Goal', fields: goalFields(ev), okText:'Save' });
        if (!result) return;
        applyGoalFields(ev, result);
      }
      publishGame();
    }
    async function deleteEventPrompt(id){
      const result = await openModal({ title:'Delete this entry?', fields:[], okText:'Delete', note:'This removes it for everyone watching — you’ll need to re-add it if that was a mistake.' });
      if (!result) return;
      game.events = (game.events || []).filter(e => e.id !== id);
      publishGame();
    }

    function buildPublishHtml(state){
      const json = JSON.stringify(state).replace(/</g, '\\u003c');
      return PRISTINE_HTML.replace(
        /(<script id="live-game-seed" type="application\/json">)[\s\S]*?(<\/script>)/,
        (m, a, c) => a + json + c
      );
    }

    let publishRevision = 0;
    let publishQueue = Promise.resolve();
    async function publishGame(){
      render();
      const revision = ++publishRevision;
      const state = { game, history, scheduleResults, stateRevision: revision, savedAt: Date.now() };
      const stateJson = JSON.stringify(state);
      try {
        seedEl.textContent = stateJson;
        localStorage.setItem('lwpGameState', stateJson);
      } catch(e) {}
      publishQueue = publishQueue.then(async () => {
        if (revision !== publishRevision) return;
        let published = false;
        if (window.claude && typeof window.claude.use === 'function') {
          const artifactApi = await window.claude.use('artifact');
          if (artifactApi && artifactApi.publish) {
            await artifactApi.publish(buildPublishHtml(JSON.parse(stateJson)));
            published = true;
          }
        }
        if (revision === publishRevision) {
          statusMsg.textContent = published ? '' : 'Updated on this device — live sync to other viewers needs the Claude Artifacts live-publish feature.';
        }
      }).catch(e => {
        if (revision === publishRevision) {
          statusMsg.textContent = '⚠️ Couldn’t sync to other viewers right now (they may need to refresh to see this update). Your own view is up to date.';
        }
      });
      await publishQueue;
    }

    // Opponent dropdown: only today's date and later, in schedule order. Selecting a
    // scheduled row (not "Other") carries its GAMES id + date onto game.gameId/date,
    // so ending the game auto-links the Season Log entry back to that schedule row.
    let upcomingCache = [];
    function populateOpponentSelect(){
      const today = new Date(); today.setHours(0,0,0,0);
      upcomingCache = GAMES
        .map(g => Object.assign({}, g, { d: gameDate(g) }))
        .filter(g => g.d >= today)
        .sort((a, b) => a.d - b.d);
      const opts = upcomingCache.map((g, i) =>
        `<option value="${i}">${g.day} ${g.date} · ${g.time} · ${g.side === 'home' ? 'vs' : '@'} ${g.opp}</option>`
      );
      opts.push('<option value="__other__">Other / not on schedule…</option>');
      oppSelect.innerHTML = opts.join('');
      oppOther.hidden = oppSelect.value !== '__other__';
    }
    populateOpponentSelect();
    if (goalieStartSelect) goalieStartSelect.innerHTML = ROSTER.filter(p=>p.pos==='G').map(p=>`<option value="${p.name}">#${p.n} ${p.name}</option>`).join('');
    if (goalieStartSelect) goalieStartSelect.value = 'Adde Zuck';
    oppSelect.addEventListener('change', () => { oppOther.hidden = oppSelect.value !== '__other__'; });

    benchToggle.addEventListener('change', async (e) => {
      if (e.target.checked) {
        let authed = isBenchAuthed();
        if (!authed) {
          const result = await openModal({
            title: 'Bench Passcode',
            fields: [{ id: 'code', label: 'Team manager / coach only', placeholder: 'Bench passcode', type: 'password' }],
            okText: 'Unlock'
          });
          const val = ((result && result.code) || '').trim().toUpperCase();
          if (result && val === BENCH_PASSCODE) {
            try { localStorage.setItem('lwpBenchAuth', '1'); } catch(err) {}
          } else {
            if (result && val !== '') await openAlert('That passcode isn’t right — bench controls stay hidden on this device.');
            e.target.checked = false;
            return;
          }
        }
      }
      benchPanel.hidden = !e.target.checked;
      try { localStorage.setItem('lwpBenchMode', e.target.checked ? '1' : '0'); } catch(err) {}
      render();
    });
    try {
      if (localStorage.getItem('lwpBenchMode') === '1' && isBenchAuthed()) {
        benchToggle.checked = true; benchPanel.hidden = false;
      }
    } catch(e) {}

    function endCurrentGame(){
      const t = tally();
      const endedGameId = game.gameId || '';
      const endedDate = game.date || '';
      const endedOpponent = game.opponent || 'Opponent';
      const archive = { id:newId(), endedAt:Date.now(), opponent:endedOpponent, date:endedDate, gameId:endedGameId, home:t.home, away:t.away, events: game.events.slice(), absentPlayers: game.absentPlayers.slice(), goalieStart: game.goalieStart || 'Adde Zuck', goalieChanges: game.goalieChanges.slice(), shootoutWinner: game.shootoutWinner || '', manual:false };
      history = [archive].concat(history);
      // Link the result back to the scheduled row. If an older schedule row has no id,
      // fall back to matching the date + opponent so it still becomes Final.
      let scheduled = endedGameId ? GAMES.find(g => g.id === endedGameId) : null;
      if (!scheduled && endedDate) {
        const norm = x => String(x || '').trim().toLowerCase();
        scheduled = GAMES.find(g => norm(g.date) === norm(endedDate) && norm(g.opp) === norm(endedOpponent));
      }
      if (scheduled) {
        scheduled.result = [t.home, t.away];
        if (!scheduled.id) scheduled.id = 'game-' + String(scheduled.date || '').replace(/\W+/g,'-').toLowerCase() + '-' + String(scheduled.opp || '').replace(/\W+/g,'-').toLowerCase();
        archive.gameId = scheduled.id;
        scheduleResults[scheduled.id] = [t.home, t.away];
      }
      game = blankGame();
      publishGame();
    }
    document.getElementById('bc-game-toggle').addEventListener('click', async () => {
      if (game.active) {
        const result = await openModal({
          title: 'End this game?',
          fields: [],
          okText: 'End Game',
          extraText: 'Delete Game',
          safeFocus: true,
          note: `Final score will be archived to the Season Log: Wolfpack ${tally().home} – ${game.opponent || 'Opponent'} ${tally().away}.`
        });
        if (!result) return;
        if (result.action === 'delete') {
          const confirmed = await openModal({
            title: 'Delete this live game?', fields: [], okText: 'Delete Game', safeFocus: true,
            note: 'Delete the current game against ' + (game.opponent || 'Opponent') + '? Its score, clock, goals, penalties and attendance will be discarded without adding a result to the Season Log. This cannot be undone. Scheduled games and previously completed games are kept.'
          });
          if (!confirmed) return;
          game = blankGame();
          publishGame();
          return;
        }
        endCurrentGame();
      } else {
        let opp = '', gameId = '', gDate = '';
        if (oppSelect.value === '__other__') {
          opp = oppOther.value.trim();
        } else {
          const sel = upcomingCache[parseInt(oppSelect.value, 10)];
          if (sel) { opp = sel.opp; gameId = sel.id || ''; gDate = sel.date || ''; }
        }
        history.forEach(h => { h.displaySuppressed = true; });
        game = { active:true, opponent: opp || 'Opponent', gameId, date: gDate, period:1, events:[], clockRunning:false, clockStartedAt:null, clockElapsedMs:PERIOD_LENGTH_MS, periodLabel:'', periodLengthMs:PERIOD_LENGTH_MS, absentPlayers:[], goalieStart:(goalieStartSelect && goalieStartSelect.value) || 'Adde Zuck', goalieChanges:[] };
        publishGame();
      }
    });
    document.getElementById('bc-add-past').addEventListener('click', async () => {
      const result = await openModal({ title:'Add Past Game', fields: pastGameFields({}), okText:'Add to Season Log' });
      if (!result) return;
      const opponent = (result.opponent || '').trim();
      if (!opponent) { statusMsg.textContent = 'Opponent is required to add a past game.'; return; }
      history = [{
        id:newId(), opponent, date:(result.date || '').trim(),
        home: parseInt(result.home, 10) || 0, away: parseInt(result.away, 10) || 0,
        events: [], manual:true
      }].concat(history);
      publishGame();
    });
    document.getElementById('bc-clock-edit').addEventListener('click', async () => {
      if (!game.active) { statusMsg.textContent = 'Start a game first.'; return; }
      if (game.clockRunning) { statusMsg.textContent = 'Pause the clock first, then edit the time.'; return; }
      const result = await openModal({
        title: 'Edit Clock Time',
        fields: [{ id:'time', label:'Time remaining (mm:ss)', placeholder:'e.g. 08:45', value: fmtClock(currentElapsedMs()) }],
        okText: 'Save'
      });
      if (!result) return;
      game.clockElapsedMs = parseClock(result.time, game.clockElapsedMs);
      publishGame();
    });
    document.getElementById('bc-goal-us').addEventListener('click', async () => {
      if (!game.active) { statusMsg.textContent = 'Start a game first.'; return; }
      const blank = { scorer:'', assist1:'', assist2:'', period: game.period, elapsedMs: currentElapsedMs() };
      const result = await openModal({ title:'Log Wolfpack Goal', fields: goalFields(blank), okText:'Log Goal' });
      if (!result) return;
      const ev = { id:newId(), type:'goal', team:'us', scorer:'', assist1:'', assist2:'', player:'', minutes:2, infraction:'', period: game.period, elapsedMs: currentElapsedMs() };
      applyGoalFields(ev, result);
      game.events.push(ev);
      publishGame();
    });
    document.getElementById('bc-goal-opp').addEventListener('click', () => {
      if (!game.active) { statusMsg.textContent = 'Start a game first.'; return; }
      game.events.push({ id:newId(), type:'goal', team:'opp', scorer:'', assist1:'', assist2:'', player:'', minutes:2, infraction:'', period: game.period, elapsedMs: currentElapsedMs() });
      publishGame();
    });
    async function logPenaltyForTeam(team){
      if (!game.active) { statusMsg.textContent = 'Start a game first.'; return; }
      const blank = { team, player:'', minutes:2, infraction:'', period: game.period, elapsedMs: currentElapsedMs() };
      const result = await openModal({ title: team === 'us' ? 'Wolfpack Penalty' : 'Opponent Penalty', fields: penaltyFields(blank), okText:'Log Penalty' });
      if (!result) return;
      const ev = { id:newId(), type:'penalty', team, scorer:'', assist1:'', assist2:'', player:'', minutes:2, infraction:'', period: game.period, elapsedMs: currentElapsedMs() };
      applyPenaltyFields(ev, result);
      game.events.push(ev);
      publishGame();
    }
    document.getElementById('bc-penalty-us').addEventListener('click', () => logPenaltyForTeam('us'));
    document.getElementById('bc-penalty-opp').addEventListener('click', () => logPenaltyForTeam('opp'));
    document.getElementById('bc-goalie-change').addEventListener('click', async () => {
      if (!game.active) { statusMsg.textContent = 'Start a game first.'; return; }
      const goalies = ROSTER.filter(p => p.pos === 'G').map(p => ({value:p.name,label:`#${p.n} ${p.name}`}));
      const result = await openModal({ title:'Goalie Change', fields:[
        {id:'to',type:'select',label:'New goalie',options:goalies,value:''},
        {id:'period',type:'select',label:'Period',options:periodSelectOptions(),value:String(game.period)},
        {id:'time',label:'Time remaining (mm:ss)',value:fmtClock(currentElapsedMs())}
      ], okText:'Log Change' });
      if (!result || !result.to) return;
      const from = game.goalieChanges.length ? game.goalieChanges[game.goalieChanges.length-1].to : game.goalieStart;
      game.goalieChanges.push({from,to:result.to,period:parseInt(result.period,10)||game.period,elapsedMs:parseClock(result.time,currentElapsedMs())});
      game.events.push({id:newId(),type:'goalieChange',team:'us',from,to:result.to,period:parseInt(result.period,10)||game.period,elapsedMs:parseClock(result.time,currentElapsedMs())});
      publishGame();
    });
    document.getElementById('bc-attendance').addEventListener('click', async () => {
      if (!game.active) { statusMsg.textContent = 'Start a game first.'; return; }
      const result = await openModal({ title:'Game Attendance', fields:[{id:'absent',type:'text',label:'Absent players (comma-separated names)',placeholder:'e.g. Lizzie Melchiorre, Rory Malone',value:game.absentPlayers.join(', ')}], okText:'Save', note:'Mark only players who are absent from this game. Their GP will not increase when the game is archived.' });
      if (!result) return;
      const names = String(result.absent||'').split(',').map(x=>x.trim()).filter(Boolean);
      game.absentPlayers = ROSTER.filter(p => names.some(n => p.name.toLowerCase() === n.toLowerCase())).map(p => p.name);
      publishGame();
    });

    document.getElementById('bc-undo').addEventListener('click', () => {
      if (!game.events || !game.events.length) return;
      game.events.pop();
      publishGame();
    });
    document.getElementById('bc-overtime').addEventListener('click', async () => {
      if (!game.active) { statusMsg.textContent = 'Start a game first.'; return; }
      const result = await openModal({ title:'Start Overtime', fields:[
        {id:'minutes',type:'select',label:'Overtime length',options:[5,10].map(m=>({value:String(m),label:m+' min'})),value:'5'}
      ], okText:'Start Overtime', note:'Starts an overtime period and resets the clock to the selected length.' });
      if (!result) return;
      const mins = parseInt(result.minutes,10) || 5;
      game.period = Math.max((game.period || 1) + 1, 4);
      game.periodLabel = 'OT';
      game.periodLengthMs = mins * 60 * 1000;
      game.clockElapsedMs = game.periodLengthMs;
      game.clockRunning = false;
      game.clockStartedAt = null;
      publishGame();
    });
    document.getElementById('bc-shootout').addEventListener('click', async () => {
      if (!game.active) { statusMsg.textContent = 'Start a game first.'; return; }
      const result = await openModal({ title:'Record Shootout', fields:[
        {id:'winner',type:'select',label:'Shootout winner',options:[{value:'us',label:'Wolfpack'},{value:'opp',label:game.opponent || 'Opponent'}],value:''}
      ], okText:'Record Shootout', note:'Ends the live clock and records the shootout winner.' });
      if (!result || !result.winner) return;
      game.period = 5;
      game.periodLabel = 'SO';
      game.shootoutWinner = result.winner;
      game.clockElapsedMs = 0;
      game.clockRunning = false;
      game.clockStartedAt = null;
      game.events.push({id:newId(),type:'shootout',team:result.winner,period:game.period,elapsedMs:0});
      publishGame();
    });
    document.getElementById('bc-period').addEventListener('click', async () => {
      if (!game.active) { statusMsg.textContent = 'Start a game first.'; return; }
      if ((game.period || 1) < 3) {
        game.period = (game.period || 1) + 1;
        game.periodLabel = '';
        game.periodLengthMs = PERIOD_LENGTH_MS;
        game.clockRunning = false; game.clockStartedAt = null; game.clockElapsedMs = PERIOD_LENGTH_MS;
        publishGame();
        return;
      }
      const result = await openModal({
        title:'Choose Next Period',
        fields:[{id:'next',type:'select',label:'Go to',options:[
          {value:'1',label:'Period 1'},
          {value:'2',label:'Period 2'},
          {value:'3',label:'Period 3'},
          {value:'ot',label:'Overtime'},
          {value:'so',label:'Shootout'}
        ],value:'ot'}],
        okText:'Continue',
        note:'After the 3rd period, choose a period to revisit, overtime, or shootout.'
      });
      if (!result) return;
      if (result.next === 'ot') {
        const ot = await openModal({ title:'Start Overtime', fields:[{id:'minutes',type:'select',label:'Overtime length',options:[5,10].map(m=>({value:String(m),label:m+' min'})),value:'5'}], okText:'Start Overtime' });
        if (!ot) return;
        const mins = parseInt(ot.minutes,10) || 5;
        game.period = 4; game.periodLabel = 'OT'; game.periodLengthMs = mins*60*1000; game.clockElapsedMs = game.periodLengthMs; game.clockRunning=false; game.clockStartedAt=null;
      } else if (result.next === 'so') {
        const so = await openModal({ title:'Record Shootout', fields:[{id:'winner',type:'select',label:'Shootout winner',options:[{value:'us',label:'Wolfpack'},{value:'opp',label:game.opponent || 'Opponent'}],value:''}], okText:'Record Shootout' });
        if (!so || !so.winner) return;
        game.period=5; game.periodLabel='SO'; game.shootoutWinner=so.winner; game.clockElapsedMs=0; game.clockRunning=false; game.clockStartedAt=null;
        game.events.push({id:newId(),type:'shootout',team:so.winner,period:5,elapsedMs:0});
      } else {
        game.period = parseInt(result.next,10) || 3;
        game.periodLabel = ''; game.periodLengthMs=PERIOD_LENGTH_MS; game.clockRunning=false; game.clockStartedAt=null; game.clockElapsedMs=PERIOD_LENGTH_MS;
      }
      publishGame();
    });
    document.getElementById('bc-clock-toggle').addEventListener('click', () => {
      if (!game.active) { statusMsg.textContent = 'Start a game first.'; return; }
      if (game.clockRunning) {
        game.clockElapsedMs = currentElapsedMs();
        game.clockRunning = false;
        game.clockStartedAt = null;
      } else {
        if (currentElapsedMs() <= 0) game.clockElapsedMs = PERIOD_LENGTH_MS;
        game.clockRunning = true;
        game.clockStartedAt = Date.now();
      }
      publishGame();
    });
    document.getElementById('bc-clock-reset').addEventListener('click', () => {
      game.clockElapsedMs = PERIOD_LENGTH_MS; game.clockRunning = false; game.clockStartedAt = null;
      publishGame();
    });

    document.addEventListener('visibilitychange',()=>{if(!document.hidden)render();});
    render();
    let lastHomeDay = homeCalendarDay();
    let lastRetainedId = retainedFinal()?.id || null;
    setInterval(() => {
      const homeDay=homeCalendarDay();
      if(homeDay!==lastHomeDay){lastHomeDay=homeDay;render();}
      const retainedId = retainedFinal()?.id || null;
      if(retainedId !== lastRetainedId){ lastRetainedId=retainedId; render(); }
      if (!game.clockRunning) return;
      if (currentElapsedMs() <= 0) {
        // Buzzer: auto-pause at 0:00 instead of counting into negative time.
        game.clockElapsedMs = 0;
        game.clockRunning = false;
        game.clockStartedAt = null;
        publishGame();
      } else {
        render();
      }
    }, 1000);
  })();
