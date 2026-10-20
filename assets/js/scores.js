/* FreeFanRadio scores.
 *
 * Sources (fetched from the browser, no server needed):
 *   NHL, NFL, NBA, MLB  ESPN public scoreboard + team schedule (unofficial, undocumented)
 *   CFL                 TheSportsDB free API (key "123"), because ESPN's CFL feed is stale
 *
 * Scores are a bonus: every failure is silent and the score areas stay hidden.
 * Feeds refresh about once a minute only while a relevant game is live or about
 * to start and the page is visible; otherwise every 10 minutes at most.
 *
 * Hooks: main.js fires `ffr:page` after each page render and `ffr:player`
 * after each player update; this file listens and fills:
 *   [data-tonight]        home "Tonight" section (followed teams)
 *   [data-team-games]     team page next/live/last game
 *   [data-player-score]   score panel in the full-screen player
 *   [data-player-status]  mini-player line, when the current team is live
 */
(function () {
    'use strict';

    const ESPN = 'https://site.api.espn.com/apis/site/v2/sports/';
    const ESPN_PATH = { NHL: 'hockey/nhl', NFL: 'football/nfl', NBA: 'basketball/nba', MLB: 'baseball/mlb' };
    const TSDB = 'https://www.thesportsdb.com/api/v1/json/123/';
    const TSDB_CFL = '4405';
    const LIVE_TTL = 60 * 1000;
    const SLOW_TTL = 10 * 60 * 1000;
    const SCHEDULE_TTL = 30 * 60 * 1000;

    const teams = () => window.FFR_TEAMS || {};
    const team = (slug) => (slug && teams()[slug]) || null;
    const $ = (sel, root) => (root || document).querySelector(sel);
    const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
    const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    function myTeams() {
        try {
            const list = JSON.parse(localStorage.getItem('ffr_my_teams') || '[]');
            return Array.isArray(list) ? list.filter(team) : [];
        } catch (e) { return []; }
    }

    // ---------- Fetch with cache + in-flight de-duplication ----------
    const cache = new Map();
    function getJSON(url, ttl) {
        const hit = cache.get(url);
        const now = Date.now();
        if (hit && (hit.promise && !hit.done || now - hit.at < ttl)) return hit.promise;
        const entry = { at: now, done: false };
        entry.promise = fetch(url)
            .then(r => (r.ok ? r.json() : null))
            .catch(() => null)
            .then(data => { entry.done = true; entry.at = Date.now(); return data; });
        cache.set(url, entry);
        return entry.promise;
    }

    // ---------- Normalized game ----------
    // { id, start: Date, state: 'pre'|'in'|'post', detail, us: {abbr, name, score}, them: {...}, home: bool, league }
    const isoDay = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    const isToday = (d) => isoDay(d) === isoDay(new Date());

    function espnScore(c) {
        if (c.score == null) return null;
        if (typeof c.score === 'object') return c.score.displayValue != null ? c.score.displayValue : c.score.value;
        return c.score;
    }

    function fromEspn(ev, t) {
        const comp = ev.competitions && ev.competitions[0];
        if (!comp) return null;
        const status = comp.status || ev.status || {};
        const type = status.type || {};
        const sides = comp.competitors || [];
        const us = sides.find(c => c.team && c.team.abbreviation === t.abbr);
        const them = sides.find(c => c !== us);
        if (!us || !them) return null;
        let detail = type.shortDetail || type.detail || '';
        if (type.state === 'in') detail = detail.replace(/\s*-\s*/, ' ');
        if (type.state === 'post') detail = /OT|SO/.test(detail) ? detail : 'Final';
        return {
            id: ev.id,
            start: new Date(ev.date),
            state: type.state || 'pre',
            detail,
            home: us.homeAway === 'home',
            league: t.league,
            us: { abbr: t.abbr, name: (us.team.shortDisplayName || us.team.name || t.name), score: espnScore(us) },
            them: { abbr: them.team.abbreviation, name: (them.team.shortDisplayName || them.team.name || them.team.abbreviation), score: espnScore(them) }
        };
    }

    const CFL_DONE = /^(FT|AOT|AET|Match Finished|Final)/i;
    function cflByTsdbId(id) {
        return Object.values(teams()).find(x => String(x.tsdb) === String(id)) || null;
    }
    function fromTsdb(ev, t) {
        if (!ev) return null;
        const homeIsUs = String(ev.idHomeTeam) === String(t.tsdb);
        if (!homeIsUs && String(ev.idAwayTeam) !== String(t.tsdb)) return null;
        const start = new Date((ev.strTimestamp || (ev.dateEvent + 'T' + (ev.strTime || '00:00:00'))) + (/(Z|[+-]\d\d:?\d\d)$/.test(ev.strTimestamp || '') ? '' : 'Z'));
        const status = ev.strStatus || '';
        let state = 'pre';
        if (CFL_DONE.test(status)) state = 'post';
        else if (status && !/^(NS|Not Started|TBD|Postponed)$/i.test(status) && start <= new Date()) state = 'in';
        const otherId = homeIsUs ? ev.idAwayTeam : ev.idHomeTeam;
        const other = cflByTsdbId(otherId);
        const otherName = homeIsUs ? ev.strAwayTeam : ev.strHomeTeam;
        return {
            id: ev.idEvent,
            start,
            state,
            detail: state === 'post' ? 'Final' : (state === 'in' ? status : ''),
            home: homeIsUs,
            league: 'CFL',
            us: { abbr: t.abbr, name: t.name.split(' ').slice(-1)[0], score: homeIsUs ? ev.intHomeScore : ev.intAwayScore },
            them: { abbr: other ? other.abbr : (otherName || '').slice(0, 3).toUpperCase(), name: other ? other.name.split(' ').slice(-1)[0] : otherName, score: homeIsUs ? ev.intAwayScore : ev.intHomeScore }
        };
    }

    // ---------- Providers ----------
    function liveTtl(games) {
        const soon = Date.now() + 20 * 60 * 1000;
        return games.some(g => g && (g.state === 'in' || (g.state === 'pre' && g.start.getTime() < soon))) ? LIVE_TTL : SLOW_TTL;
    }
    let lastTodayTtl = SLOW_TTL;

    // Today's game for a team (live, upcoming today, or finished today)
    async function todayGame(t) {
        if (!t || !t.abbr) return null;
        if (t.league === 'CFL') {
            if (!t.tsdb) return null;
            // TheSportsDB dates are UTC: evening games fall on the next UTC day
            const now = new Date();
            const days = [now, new Date(now.getTime() + 86400000)].map(d => d.toISOString().slice(0, 10));
            const lists = await Promise.all(days.map(d => getJSON(TSDB + 'eventsday.php?d=' + d + '&l=' + TSDB_CFL, lastTodayTtl)));
            const events = lists.flatMap(j => (j && j.events) || []);
            const games = events.map(ev => fromTsdb(ev, t)).filter(Boolean);
            return games.find(g => g.state === 'in') || games.find(g => isToday(g.start)) || null;
        }
        const path = ESPN_PATH[t.league];
        if (!path) return null;
        const j = await getJSON(ESPN + path + '/scoreboard', lastTodayTtl);
        const games = ((j && j.events) || []).map(ev => fromEspn(ev, t)).filter(Boolean);
        return games.find(g => g.state === 'in') || games.find(g => isToday(g.start)) || null;
    }

    // Next and last game for a team page
    async function nextAndLast(t) {
        if (!t || !t.abbr) return { next: null, last: null };
        const now = Date.now();
        if (t.league === 'CFL') {
            if (!t.tsdb) return { next: null, last: null };
            const [n, l] = await Promise.all([
                getJSON(TSDB + 'eventsnext.php?id=' + t.tsdb, SCHEDULE_TTL),
                getJSON(TSDB + 'eventslast.php?id=' + t.tsdb, SCHEDULE_TTL)
            ]);
            return {
                next: fromTsdb(((n && n.events) || [])[0], t),
                last: fromTsdb(((l && l.results) || [])[0], t)
            };
        }
        const path = ESPN_PATH[t.league];
        if (!path) return { next: null, last: null };
        const j = await getJSON(ESPN + path + '/teams/' + t.abbr.toLowerCase() + '/schedule', SCHEDULE_TTL);
        const games = ((j && j.events) || []).map(ev => fromEspn(ev, t)).filter(Boolean).sort((a, b) => a.start - b.start);
        return {
            next: games.find(g => g.state !== 'post' && g.start.getTime() > now - 6 * 3600 * 1000) || null,
            last: games.filter(g => g.state === 'post').pop() || null
        };
    }

    // ---------- Formatting ----------
    function when(d) {
        const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        if (isToday(d)) return time;
        const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
        if (isoDay(d) === isoDay(tomorrow)) return 'Tomorrow ' + time;
        return d.toLocaleDateString([], { weekday: 'short' }) + ' ' + time;
    }
    const hasScore = (g) => g.state !== 'pre' && g.us.score != null && g.us.score !== '' && g.them.score != null && g.them.score !== '';
    function scoreLine(g) {
        if (g.state === 'pre') return (g.home ? 'vs ' : 'at ') + g.them.abbr + ' · ' + when(g.start);
        const s = hasScore(g) ? g.us.abbr + ' ' + g.us.score + ' – ' + g.them.score + ' ' + g.them.abbr : g.us.abbr + ' vs ' + g.them.abbr;
        return s + (g.detail ? ' · ' + g.detail : '');
    }
    function badge(g) {
        if (g.state === 'in') return '<span class="game-badge is-live">Live' + (g.detail ? ' · ' + esc(g.detail) : '') + '</span>';
        if (g.state === 'post') return '<span class="game-badge">Final</span>';
        return '<span class="game-badge">' + esc(isToday(g.start) ? 'Tonight · ' + when(g.start) : when(g.start)) + '</span>';
    }

    const ICON_PLAY = '<svg class="i-play" width="30" height="30" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 4.5v15l13-7.5z"/></svg>';
    const ICON_PAUSE = '<svg class="i-pause" width="28" height="28" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>';
    const stationName = (id) => (window.FFR_STATIONS && window.FFR_STATIONS[id] && window.FFR_STATIONS[id].name) || '';

    function gameCard(t, g) {
        const sid = window.FFR ? window.FFR.firstStationOf(t.slug) : (t.stations || [])[0];
        const chips = window.FFR ? window.FFR.stationChips(t.slug) : '';
        const scored = hasScore(g);
        const line = (side, dim) => '<div class="game-line' + (dim ? ' dim' : '') + '"><span>' + esc(side.name) + '</span>' +
            (scored ? '<span class="score">' + esc(side.score) + '</span>' : '') + '</div>';
        return '<div class="game-card' + (g.state === 'in' ? ' is-live' : '') + '">' +
            '<div class="game-top">' + badge(g) + '<span class="muted small">' + esc(t.league) + '</span></div>' +
            '<div class="game-body"><a class="game-lines" href="' + esc(t.page) + '">' +
            line(g.us, false) + line(g.them, true) + '</a>' +
            (sid ? '<button type="button" class="play-circle play-station-btn" data-station-id="' + esc(sid) + '" data-team="' + esc(t.slug) +
                '" aria-label="Play ' + esc(t.name) + '">' + ICON_PLAY + ICON_PAUSE + '</button>' : '') +
            '</div>' +
            (chips || (sid ? '<span class="game-sub">' + esc(stationName(sid)) + '</span>' : '<span class="game-sub">No live stream on FreeFanRadio yet</span>')) +
            '</div>';
    }

    function matchup(g) {
        const mid = g.state === 'pre'
            ? '<span class="matchup-time">' + esc(when(g.start)) + '</span><span class="muted small">' + (g.home ? 'Home' : 'Away') + '</span>'
            : '<span class="matchup-time">' + esc(g.state === 'in' ? g.detail || 'Live' : 'Final') + '</span>';
        const side = (s, dim) => '<div class="matchup-team' + (dim ? ' dim' : '') + '"><span class="' + (hasScore(g) ? 'small' : 'matchup-abbr') + '">' + esc(s.abbr) + '</span>' +
            (hasScore(g) ? '<span class="matchup-score">' + esc(s.score) + '</span>' : '') + '</div>';
        return '<div class="matchup">' + side(g.us, false) + '<div class="matchup-mid">' + mid + '</div>' + side(g.them, true) + '</div>';
    }

    // ---------- Renderers ----------
    let renderToken = 0;

    async function renderTonight(token) {
        const wrap = $('[data-tonight]');
        if (!wrap) return [];
        const followed = myTeams().map(team);
        const results = await Promise.all(followed.map(t => todayGame(t).then(g => ({ t, g })).catch(() => ({ t, g: null }))));
        if (token !== renderToken) return [];
        const active = results.filter(r => r.g && r.g.state !== 'post')
            .sort((a, b) => (a.g.state === 'in' ? 0 : 1) - (b.g.state === 'in' ? 0 : 1) || a.g.start - b.g.start);
        const done = results.filter(r => r.g && r.g.state === 'post');
        $('[data-tonight-cards]', wrap).innerHTML = active.map(r => gameCard(r.t, r.g)).join('');
        const earlier = $('[data-tonight-earlier]', wrap);
        earlier.hidden = done.length === 0;
        $('[data-tonight-earlier-list]', wrap).innerHTML = done.map(r =>
            '<li><a class="row-main" href="' + esc(r.t.page) + '"><span class="row-title">' + esc(r.g.us.name + ' ' + (r.g.us.score ?? '') + ' · ' + r.g.them.name + ' ' + (r.g.them.score ?? '')) +
            '</span><span class="row-sub">Final</span></a></li>').join('');
        wrap.hidden = active.length === 0 && done.length === 0;
        return results.map(r => r.g);
    }

    async function renderTeamGames(token) {
        const wrap = $('[data-team-games]');
        if (!wrap) return [];
        const t = team(wrap.dataset.teamGames);
        if (!t) return [];
        const [today, nl] = await Promise.all([todayGame(t).catch(() => null), nextAndLast(t).catch(() => ({}))]);
        if (token !== renderToken) return [];
        const main = today && today.state !== 'post' ? today : nl.next;
        const last = today && today.state === 'post' ? today : nl.last;
        if (!main && !last) { wrap.hidden = true; return []; }
        const label = main ? (main.state === 'in' ? 'Live now' : (isToday(main.start) ? 'Today' : 'Next game')) : '';
        wrap.innerHTML =
            (main ? '<div class="game-card' + (main.state === 'in' ? ' is-live' : '') + '"><span class="eyebrow">' + esc(label) + '</span>' + matchup(main) + '</div>' : '') +
            (last ? '<ul class="row-list"><li><span class="row-main"><span class="row-title">' +
                esc(last.us.name + ' ' + (last.us.score ?? '') + ' · ' + last.them.name + ' ' + (last.them.score ?? '')) +
                '</span><span class="row-sub">Last game · ' + esc(last.start.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })) + '</span></span></li></ul>' : '');
        wrap.hidden = false;
        if (window.radioPlayer && window.radioPlayer.renderButtons) window.radioPlayer.renderButtons();
        return [today, main];
    }

    let playerGame = null;
    async function renderPlayerScore(token) {
        const p = window.radioPlayer;
        const t = p && team(p.teamSlug);
        const g = t ? await todayGame(t).catch(() => null) : null;
        if (token !== renderToken) return [];
        playerGame = g;
        applyPlayerScore();
        return [g];
    }

    // Called after every player render (main.js rewrites the status line each time)
    function applyPlayerScore() {
        const panel = $('[data-player-score]');
        const p = window.radioPlayer;
        const g = playerGame;
        const relevant = g && p && p.stationId && (g.state !== 'post' || isToday(g.start));
        if (panel) {
            panel.hidden = !relevant;
            if (relevant) panel.innerHTML = matchup(g);
        }
        if (!relevant || g.state !== 'in') return;
        const line = scoreLine(g);
        if (p.status === 'live') $$('[data-player-status]').forEach(el => { el.textContent = line; });
        if ('mediaSession' in navigator && navigator.mediaSession.metadata) {
            try { navigator.mediaSession.metadata.artist = line; } catch (e) { /* read-only in some browsers */ }
        }
    }

    // ---------- Update loop ----------
    async function update() {
        const token = ++renderToken;
        try {
            const lists = await Promise.all([renderTonight(token), renderTeamGames(token), renderPlayerScore(token)]);
            const games = lists.flat().filter(Boolean);
            lastTodayTtl = liveTtl(games);
        } catch (e) { /* scores are optional */ }
    }

    document.addEventListener('ffr:page', update);
    let checkedSlug = null;
    document.addEventListener('ffr:player', () => {
        const p = window.radioPlayer;
        const slug = p && p.teamSlug;
        if (slug !== checkedSlug) { checkedSlug = slug; playerGame = null; update(); }
        applyPlayerScore();
    });
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') update(); });
    setInterval(() => { if (document.visibilityState === 'visible') update(); }, LIVE_TTL);

    update();
})();
