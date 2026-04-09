// ===== SFIDA APP — v3 Dark Mode King =====

// --- Constants ---
const SPORTS = {
    futboll:{e:'⚽',n:'Futboll'},basketboll:{e:'🏀',n:'Basketboll'},
    pingpong:{e:'🏓',n:'Ping Pong'},volejboll:{e:'🏐',n:'Volejboll'},
    tenis:{e:'🎾',n:'Tenis'},badminton:{e:'🏸',n:'Badminton'}
};
const STAKES = {
    redbull:'🥤 Red Bull',kafe:'☕ Kafe',byrek:'🥧 Byrek',
    akullore:'🍦 Akullore',pizza:'🍕 Pizza',asgje:'🤝 Asgjë'
};
const SPORT_COLORS = {
    futboll:'var(--futboll)',basketboll:'var(--basketboll)',
    pingpong:'var(--pingpong)',volejboll:'var(--volejboll)',
    tenis:'var(--tenis)',badminton:'var(--badminton)'
};

// --- State ---
let me = null;
let games = [];
let mapObj = null;
let miniMapObj = null;
let miniPin = null;
let mapPins = [];
let filter = 'all';
let genderFilter = 'all';
let chatData = {};

// Create form state
let cf = {sport:null,format:null,cgender:null,stake:'asgje',have:1,need:1,loc:null};

// --- Demo data ---
const demoUsers = [
    {id:1,name:'Aldi',age:22,gender:'djem',lagja:'Blloku',photo:null,rating:4.8,matches:15,wins:10,losses:5},
    {id:2,name:'Erion',age:19,gender:'djem',lagja:'Astiri',photo:null,rating:4.5,matches:8,wins:5,losses:3},
    {id:3,name:'Klajdi',age:24,gender:'djem',lagja:'Komuna e Parisit',photo:null,rating:4.9,matches:22,wins:18,losses:4},
    {id:4,name:'Sara',age:20,gender:'vajza',lagja:'Tirana e Re',photo:null,rating:4.7,matches:12,wins:9,losses:3},
    {id:5,name:'Dori',age:21,gender:'djem',lagja:'Sauk',photo:null,rating:4.3,matches:6,wins:3,losses:3},
    {id:6,name:'Enxhi',age:18,gender:'vajza',lagja:'Laprakë',photo:null,rating:4.6,matches:10,wins:7,losses:3}
];

const now = new Date();
const today = now.toISOString().split('T')[0];
const tomorrow = new Date(now.getTime()+86400000).toISOString().split('T')[0];

const demoGames = [
    {id:1,sport:'futboll',format:'3v3',have:2,need:4,
     loc:{lat:41.3275,lng:19.8187,name:'Parku Rinia'},
     date:today,time:'18:00',level:'competitive',stake:'redbull',
     gender:'djem',note:'Kemi topin, sjellni ujë',
     host:demoUsers[0],players:[demoUsers[0],demoUsers[1]],status:'active'},
    {id:2,sport:'basketboll',format:'2v2',have:1,need:3,
     loc:{lat:41.3300,lng:19.8230,name:'Fusha Basketbollit, Bllok'},
     date:today,time:'17:00',level:'chill',stake:'kafe',
     gender:'djem',note:'',
     host:demoUsers[2],players:[demoUsers[2]],status:'active'},
    {id:3,sport:'pingpong',format:'1v1',have:1,need:1,
     loc:{lat:41.3250,lng:19.8150,name:'Parku i Liqenit'},
     date:tomorrow,time:'16:00',level:'serious',stake:'pizza',
     gender:'djem',note:'Kam raketat',
     host:demoUsers[4],players:[demoUsers[4]],status:'active'},
    {id:4,sport:'volejboll',format:'3v3',have:2,need:4,
     loc:{lat:41.3220,lng:19.8100,name:'Plazhi i Liqenit'},
     date:tomorrow,time:'10:00',level:'chill',stake:'akullore',
     gender:'vajza',note:'Kemi rrjetën',
     host:demoUsers[3],players:[demoUsers[3],demoUsers[5]],status:'active'},
    {id:5,sport:'tenis',format:'1v1',have:1,need:1,
     loc:{lat:41.3310,lng:19.8280,name:'Kompleksi Olimpik'},
     date:tomorrow,time:'09:00',level:'competitive',stake:'byrek',
     gender:'djem',note:'',
     host:demoUsers[1],players:[demoUsers[1]],status:'active'},
    {id:6,sport:'badminton',format:'2v2',have:2,need:2,
     loc:{lat:41.3290,lng:19.8160,name:'Parku i Madh'},
     date:today,time:'19:00',level:'chill',stake:'asgje',
     gender:'vajza',note:'Kemi raketat per te gjithe',
     host:demoUsers[5],players:[demoUsers[5],demoUsers[3]],status:'active'}
];

games = [...demoGames];
demoGames.forEach(g => {
    chatData[g.id] = [{type:'sys',text:`${SPORTS[g.sport].e} Sfida u krijua!`,t:new Date(now.getTime()-7200000)}];
});

// ========================
// NAVIGATION
// ========================
function goTo(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const el = document.getElementById(id);
    if (el) {
        el.classList.add('active');
        if (id === 'home') { renderCards(); setTimeout(initMap, 80); }
        if (id === 'create') { setTimeout(initMiniMap, 150); resetWizard(); }
        if (id === 'profile') updateProfile();
        if (id === 'my') renderMyGames();
        if (id === 'chats') renderChatList();
    }
}

function navTo(id, btn) {
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    document.querySelectorAll('.nav-item').forEach(b => {
        const text = b.textContent.trim();
        const targetText = btn ? btn.textContent.trim() : '';
        if (text === targetText) b.classList.add('active');
    });
    if (id === 'profile' && !me) { goTo('auth'); return; }
    goTo(id);
}

// ========================
// AUTH
// ========================
function getUsers() { return JSON.parse(localStorage.getItem('sf_users') || '{}'); }
function saveUsers(u) { localStorage.setItem('sf_users', JSON.stringify(u)); }

function showLogin() {
    document.getElementById('auth-login').classList.remove('hidden');
    document.getElementById('auth-reg').classList.add('hidden');
}
function showReg() {
    document.getElementById('auth-login').classList.add('hidden');
    document.getElementById('auth-reg').classList.remove('hidden');
}

function doLogin() {
    const email = document.getElementById('inp-email').value.trim().toLowerCase();
    const pass = document.getElementById('inp-pass').value;
    if (!email || !email.includes('@')) return toast('Shkruaj email','err');
    if (!pass) return toast('Shkruaj fjalëkalimin','err');
    const users = getUsers();
    if (!users[email]) return toast('Nuk ekziston llogari','err');
    if (users[email].password !== pass) return toast('Fjalëkalim gabim','err');
    me = users[email];
    localStorage.setItem('sf_me', JSON.stringify(me));
    toast('Mirë se u ktheve!','ok');
    goTo('home');
}

function doRegister() {
    const email = document.getElementById('inp-reg-email').value.trim().toLowerCase();
    const pass = document.getElementById('inp-reg-pass').value;
    const pass2 = document.getElementById('inp-reg-pass2').value;
    if (!email || !email.includes('@')) return toast('Shkruaj email','err');
    if (pass.length < 6) return toast('Min 6 karaktere','err');
    if (pass !== pass2) return toast('Fjalëkalimet nuk përputhen','err');
    const users = getUsers();
    if (users[email]) return toast('Email ekziston','err');
    localStorage.setItem('sf_pending', JSON.stringify({email, password: pass}));
    toast('Vazhdo me profilin','ok');
    goTo('setup');
}

// ========================
// PROFILE SETUP
// ========================
let setupGender = null;
let setupSports = [];

function onPhoto(inp) {
    if (inp.files && inp.files[0]) {
        const r = new FileReader();
        r.onload = e => {
            document.getElementById('avatar-preview').innerHTML = `<img src="${e.target.result}">`;
        };
        r.readAsDataURL(inp.files[0]);
    }
}

function pickPill(btn, group) {
    btn.closest('.pill-row').querySelectorAll('.pill').forEach(p => p.classList.remove('on'));
    btn.classList.add('on');
    if (group === 'gender') setupGender = btn.dataset.v;
    if (group === 'format') cf.format = btn.dataset.v;
    if (group === 'cgender') cf.cgender = btn.dataset.v;
}

function toggleChip(btn) {
    btn.classList.toggle('on');
}

function finishSetup() {
    const name = document.getElementById('inp-name').value.trim();
    const age = parseInt(document.getElementById('inp-age').value);
    const lagja = document.getElementById('inp-lagja').value;
    const photoEl = document.querySelector('#avatar-preview img');
    const chips = document.querySelectorAll('#setup .sport-chip.on');

    if (!name) return toast('Shkruaj emrin','err');
    if (!age || age < 16) return toast('Mosha min 16','err');
    if (!setupGender) return toast('Zgjidh gjininë','err');
    if (!lagja) return toast('Zgjidh lagjën','err');
    if (!chips.length) return toast('Zgjidh 1+ sport','err');

    const sports = [];
    chips.forEach(c => sports.push(c.dataset.s));

    const pending = JSON.parse(localStorage.getItem('sf_pending') || '{}');

    me = {
        id: Date.now(), email: pending.email || '', password: pending.password || '',
        name, age, gender: setupGender, lagja,
        photo: photoEl ? photoEl.src : null,
        sports, rating: 5.0, matches: 0, wins: 0, losses: 0
    };

    if (pending.email) {
        const users = getUsers();
        users[pending.email] = me;
        saveUsers(users);
        localStorage.removeItem('sf_pending');
    }
    localStorage.setItem('sf_me', JSON.stringify(me));
    toast('Mirë se erdhe!','ok');
    goTo('home');
}

// ========================
// MAP
// ========================
function initMap() {
    if (mapObj) { mapObj.invalidateSize(); return; }
    mapObj = L.map('map', {zoomControl:false, attributionControl:false}).setView([41.3275, 19.8187], 14);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {maxZoom:19}).addTo(mapObj);
    L.control.zoom({position:'topright'}).addTo(mapObj);
    render();
}

function initMiniMap() {
    if (miniMapObj) { miniMapObj.invalidateSize(); return; }
    miniMapObj = L.map('mini-map', {zoomControl:false, attributionControl:false}).setView([41.3275, 19.8187], 14);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {maxZoom:19}).addTo(miniMapObj);
    miniMapObj.on('click', e => {
        if (miniPin) miniMapObj.removeLayer(miniPin);
        miniPin = L.marker(e.latlng, {
            icon: L.divIcon({className:'pin pin-futboll',html:'📍',iconSize:[42,42],iconAnchor:[21,21]})
        }).addTo(miniMapObj);
        cf.loc = {lat:e.latlng.lat, lng:e.latlng.lng};
    });
}

// ========================
// RENDER (map + cards)
// ========================
function render() {
    renderCards();
    if (!mapObj) return;
    mapPins.forEach(p => mapObj.removeLayer(p));
    mapPins = [];

    const list = getFiltered();
    list.forEach(g => {
        const icon = L.divIcon({
            className:`pin pin-${g.sport}`,
            html:SPORTS[g.sport].e,
            iconSize:[44,44], iconAnchor:[22,22]
        });
        const pin = L.marker([g.loc.lat, g.loc.lng], {icon}).addTo(mapObj);
        pin.bindPopup(`
            <div class="pop">
                <h4>${SPORTS[g.sport].e} ${SPORTS[g.sport].n} ${g.format}</h4>
                <p>📍 ${g.loc.name}</p>
                <p>🕐 ${fmtDate(g.date)} ${g.time}</p>
                <p>👥 ${g.players.length}/${totalSpots(g)} lojtarë</p>
                <button class="pop-btn" onclick="openDetail(${g.id})">Shiko</button>
            </div>
        `, {closeButton:false});
        pin.on('click', function(){ this.openPopup(); });
        mapPins.push(pin);
    });
}

function renderCards() {
    const list = getFiltered();
    const el = document.getElementById('card-list');
    if (!list.length) { el.innerHTML = ''; return; }

    el.innerHTML = list.map(g => {
        const spots = totalSpots(g) - g.players.length;
        const full = spots <= 0;
        const urgency = getUrgency(g);
        return `
        <div class="gcard" onclick="openDetail(${g.id})">
            <div class="gcard-top">
                <div class="gcard-sport">
                    <span class="dot" style="background:${SPORT_COLORS[g.sport]};color:${SPORT_COLORS[g.sport]}"></span>
                    ${SPORTS[g.sport].e} ${SPORTS[g.sport].n} ${g.format}
                </div>
                <span class="gcard-time ${urgency.cls}">${urgency.label}</span>
            </div>
            <div class="gcard-mid">
                <span>📍 ${g.loc.name}</span>
                <span class="spots">${g.players.length}/${totalSpots(g)}</span>
                ${g.stake !== 'asgje' ? `<span class="stake-tag">${STAKES[g.stake]}</span>` : ''}
            </div>
            <div class="gcard-bottom">
                <div class="gcard-host">
                    <div class="av">${g.host.name[0]}</div>
                    ${g.host.name} <span style="color:var(--warn)">★${g.host.rating}</span>
                </div>
                <button class="gcard-join ${full ? 'gcard-full' : ''}" onclick="event.stopPropagation();${full ? '' : `joinQuick(${g.id})`}">
                    ${full ? 'Plotë' : 'Bashkohu'}
                </button>
            </div>
        </div>`;
    }).join('');
}

function getFiltered() {
    return games.filter(g => {
        if (g.status !== 'active') return false;
        if (filter !== 'all' && g.sport !== filter) return false;
        if (genderFilter !== 'all' && g.gender !== genderFilter) return false;
        return true;
    });
}

function totalSpots(g) { return g.have + g.need; }

function getUrgency(g) {
    const parts = g.date.split('-');
    const gameDate = new Date(parts[0], parts[1]-1, parts[2]);
    const [h, m] = g.time.split(':').map(Number);
    gameDate.setHours(h, m);
    const diff = gameDate - new Date();
    const hrs = diff / 3600000;

    if (hrs < 0) return {label:'Tani!', cls:'time-urgent'};
    if (hrs < 2) return {label:`${Math.max(1,Math.round(hrs*60))} min`, cls:'time-urgent'};
    if (hrs < 6) return {label:`${Math.round(hrs)} orë`, cls:'time-soon'};
    if (hrs < 24) return {label:fmtDate(g.date) + ' ' + g.time, cls:'time-later'};
    return {label:fmtDate(g.date) + ' ' + g.time, cls:'time-later'};
}

// ========================
// FILTERS
// ========================
function setFilter(btn) {
    document.querySelectorAll('#sport-filters .chip').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    filter = btn.dataset.f;
    render();
}

function setGender(g, btn) {
    document.querySelectorAll('.gpill').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    genderFilter = g;
    render();
}

function toggleTray() {
    document.getElementById('card-tray').classList.toggle('collapsed');
}

// ========================
// QUICK JOIN
// ========================
function joinQuick(id) {
    if (!me) { goTo('auth'); return; }
    const g = games.find(x => x.id === id);
    if (!g) return;
    if (g.players.some(p => p.id === me.id)) { toast('Tashmë je brenda','err'); return; }
    if (g.gender !== me.gender) { toast(`Vetëm ${g.gender === 'djem' ? 'djem' : 'vajza'}`,'err'); return; }

    g.players.push(me);
    toast('U bashkove!','ok');
    initChatForGame(g);
    render();
    if (!document.getElementById('detail-sheet').classList.contains('hidden')) openDetail(id);
}

// ========================
// GAME DETAIL
// ========================
function openDetail(id) {
    const g = games.find(x => x.id === id);
    if (!g) return;

    const spots = totalSpots(g) - g.players.length;
    const isHost = me && g.host.id === me.id;
    const isIn = me && g.players.some(p => p.id === me.id);
    const gText = g.gender === 'djem' ? 'Djem' : 'Vajza';
    const lvl = g.level === 'chill' ? 'Chill' : g.level === 'competitive' ? 'Kompetitiv' : 'Serioz';
    const urgency = getUrgency(g);

    const body = document.getElementById('detail-body');
    body.innerHTML = `
        <div class="detail-head">
            <div class="detail-icon pin-${g.sport}">${SPORTS[g.sport].e}</div>
            <div>
                <div class="detail-title">${SPORTS[g.sport].n} ${g.format}</div>
                <div class="detail-sub">${lvl} · ${gText} · <span class="${urgency.cls}">${urgency.label}</span></div>
            </div>
        </div>

        <div class="detail-grid">
            <div class="detail-item"><small>Vendi</small><b>📍 ${g.loc.name}</b></div>
            <div class="detail-item"><small>Ora</small><b>🕐 ${fmtDate(g.date)} ${g.time}</b></div>
            <div class="detail-item"><small>Lojtarë</small><b>👥 ${g.players.length}/${totalSpots(g)}</b></div>
            <div class="detail-item"><small>Basti</small><b>${STAKES[g.stake] || g.stake}</b></div>
        </div>

        ${g.note ? `<p style="font-size:13px;color:var(--t2);margin-bottom:14px;padding:12px;background:var(--card);border-radius:var(--r-sm);border:1px solid var(--border)">💬 ${g.note}</p>` : ''}

        <p class="input-label" style="margin-bottom:8px">Lojtarët</p>
        <div class="detail-players">
            ${g.players.map((p,i) => `
                <div class="detail-player">
                    <div class="av">${p.photo ? `<img src="${p.photo}" style="width:30px;height:30px;border-radius:50%;object-fit:cover">` : p.name[0]}</div>
                    <div>
                        <b>${p.name}</b> ${p.age ? '<small style="color:var(--t3)">('+p.age+')</small>' : ''}
                        <div class="role">${i===0?'🏠 Host':'🏃 Lojtar'}</div>
                    </div>
                    ${p.rating ? `<small style="color:var(--warn)">★${p.rating}</small>` : ''}
                </div>
            `).join('')}
        </div>

        <div class="detail-actions">
            ${!me ? `<button class="btn-primary" onclick="closeDetail();goTo('auth')">Regjistrohu</button>` :
              isHost ? `<button class="btn-primary" onclick="openChat(${g.id})">💬 Chat</button><button class="btn-outline" onclick="giveHost(${g.id})">Jep Host</button>` :
              isIn ? `<button class="btn-primary" onclick="openChat(${g.id})">💬 Chat</button>` :
              spots > 0 ? `<button class="btn-primary" onclick="joinQuick(${g.id})">Bashkohu tani!</button>` :
              `<button class="btn-outline" disabled>Plotë</button>`}
        </div>
    `;

    document.getElementById('detail-overlay').classList.remove('hidden');
    document.getElementById('detail-sheet').classList.remove('hidden');
}

function closeDetail() {
    document.getElementById('detail-overlay').classList.add('hidden');
    document.getElementById('detail-sheet').classList.add('hidden');
}

function giveHost(id) {
    const g = games.find(x => x.id === id);
    if (!g || g.players.length < 2) return toast('Duhen 2+ lojtarë','err');
    const others = g.players.filter(p => p.id !== g.host.id);
    const pick = others[0];
    g.host = pick;
    g.players = [pick, ...g.players.filter(p => p.id !== pick.id)];
    toast(`${pick.name} është host!`,'ok');
    openDetail(id);
}

// ========================
// CREATE CHALLENGE (wizard)
// ========================
let wizStep = 1;

function resetWizard() {
    wizStep = 1;
    cf = {sport:null,format:null,cgender:null,stake:'asgje',have:1,need:1,loc:null};
    document.querySelectorAll('.wiz-step').forEach(s => s.classList.remove('active'));
    document.querySelector('.wiz-step[data-step="1"]').classList.add('active');
    document.querySelectorAll('#create .sport-chip, #create .pill, #create .stake').forEach(b => b.classList.remove('on','active'));
    document.querySelector('.stake[onclick*="asgje"]').classList.add('active');
    document.getElementById('c-have').textContent = '1';
    document.getElementById('c-need').textContent = '1';
    document.getElementById('c-location').value = '';
    document.getElementById('c-note').value = '';
    const dateInp = document.getElementById('c-date');
    if (dateInp) dateInp.value = today;
    updateStepIndicator();
}

function updateStepIndicator() {
    const dots = document.querySelectorAll('.step-dot');
    dots.forEach((dot, i) => {
        dot.classList.remove('active', 'done');
        if (i + 1 === wizStep) dot.classList.add('active');
        else if (i + 1 < wizStep) dot.classList.add('done');
    });
}

function pickCreate(btn, type) {
    if (type === 'sport') {
        btn.closest('.sport-grid').querySelectorAll('.sport-chip').forEach(c => c.classList.remove('on'));
        btn.classList.add('on');
        cf.sport = btn.dataset.s;
    }
}

function pickStake(btn, val) {
    document.querySelectorAll('.stake').forEach(s => s.classList.remove('active'));
    btn.classList.add('active');
    cf.stake = val;
}

function adj(type, d) {
    if (type === 'have') { cf.have = Math.max(1, cf.have + d); document.getElementById('c-have').textContent = cf.have; }
    else { cf.need = Math.max(1, cf.need + d); document.getElementById('c-need').textContent = cf.need; }
}

function wizNext() {
    if (wizStep === 1) {
        if (!cf.sport) return toast('Zgjidh sportin','err');
        if (!cf.format) return toast('Zgjidh formatin','err');
        if (!cf.cgender) return toast('Zgjidh djem/vajza','err');
    }
    if (wizStep === 2) {
        if (!document.getElementById('c-date').value) return toast('Zgjidh datën','err');
        if (!document.getElementById('c-time').value) return toast('Zgjidh orën','err');
        if (!cf.loc) return toast('Kliko hartën','err');
        if (!document.getElementById('c-location').value) return toast('Shkruaj vendin','err');
    }

    wizStep++;
    document.querySelectorAll('.wiz-step').forEach(s => s.classList.remove('active'));
    const next = document.querySelector(`.wiz-step[data-step="${wizStep}"]`);
    if (next) next.classList.add('active');
    updateStepIndicator();
}

function publishChallenge() {
    if (!me) { toast('Regjistrohu','err'); goTo('auth'); return; }

    const g = {
        id: Date.now(),
        sport: cf.sport,
        format: cf.format,
        have: cf.have,
        need: cf.need,
        loc: {...cf.loc, name: document.getElementById('c-location').value},
        date: document.getElementById('c-date').value,
        time: document.getElementById('c-time').value,
        level: 'chill',
        stake: cf.stake,
        gender: cf.cgender,
        note: document.getElementById('c-note').value,
        host: me,
        players: [me],
        status: 'active'
    };

    games.unshift(g);
    initChatForGame(g);
    toast('Sfida u publikua!','ok');
    goTo('home');
}

// ========================
// CHAT
// ========================
function initChatForGame(g) {
    if (!chatData[g.id]) {
        chatData[g.id] = [{type:'sys', text:`${SPORTS[g.sport].e} Sfida u krijua!`, t: new Date()}];
    }
}

function openChat(gId) {
    const g = games.find(x => x.id === gId);
    if (!g) return;
    closeDetail();

    document.getElementById('chat-title').textContent = `${SPORTS[g.sport].e} ${SPORTS[g.sport].n} ${g.format}`;
    document.getElementById('chat-sub').textContent = `${g.loc.name} · ${fmtDate(g.date)} ${g.time}`;

    initChatForGame(g);

    if (g.id <= 6 && chatData[g.id].length <= 1) {
        if (g.players.length > 1)
            chatData[g.id].push({type:'in',who:g.players[1].name,text:'Po vij në orë!',t:new Date(now.getTime()-3600000)});
        chatData[g.id].push({type:'in',who:g.host.name,text:g.note||'Mirë se vini!',t:new Date(now.getTime()-1800000)});
    }

    renderChat(gId);
    goTo('chat');
    document.getElementById('chat-msgs').dataset.gid = gId;
}

function renderChat(gId) {
    const el = document.getElementById('chat-msgs');
    const msgs = chatData[gId] || [];
    el.innerHTML = msgs.map(m => {
        if (m.type === 'sys') return `<div class="msg msg-sys">${m.text}</div>`;
        const mine = me && m.who === me.name;
        return `<div class="msg ${mine ? 'msg-out' : 'msg-in'}">
            ${!mine ? `<div class="msg-name">${m.who}</div>` : ''}
            ${m.text}
            <div class="msg-time">${fmtTime(m.t)}</div>
        </div>`;
    }).join('');
    el.scrollTop = el.scrollHeight;
}

function sendMsg() {
    const inp = document.getElementById('chat-inp');
    const text = inp.value.trim();
    if (!text) return;
    const gId = parseInt(document.getElementById('chat-msgs').dataset.gid);
    if (!chatData[gId]) chatData[gId] = [];
    chatData[gId].push({type:'out',who:me?me.name:'Ti',text,t:new Date()});
    inp.value = '';
    renderChat(gId);

    setTimeout(() => {
        const g = games.find(x => x.id === gId);
        if (!g) return;
        const other = g.players.find(p => !me || p.id !== me.id) || g.host;
        const replies = ['OK!','Po vij!','Bukur!','Perfekt 👍','Dakord!','Se shpejti!'];
        chatData[gId].push({type:'in',who:other.name,text:replies[Math.floor(Math.random()*replies.length)],t:new Date()});
        renderChat(gId);
    }, 1500 + Math.random()*2000);
}

function quickMsg(t) { document.getElementById('chat-inp').value = t; sendMsg(); }

// ========================
// MY GAMES TAB
// ========================
function renderMyGames() {
    const el = document.getElementById('my-list');
    if (!me) { el.innerHTML = '<div class="empty">Regjistrohu për të parë sfidat</div>'; return; }
    const my = games.filter(g => g.players.some(p => p.id === me.id));
    if (!my.length) { el.innerHTML = '<div class="empty">Nuk ke sfida<br><br><button class="btn-primary" style="max-width:200px;margin:0 auto" onclick="goTo(\'create\')">Krijo sfidën e parë</button></div>'; return; }
    el.innerHTML = my.map(g => {
        const isHost = g.host.id === me.id;
        const urgency = getUrgency(g);
        return `<div class="gcard" onclick="openDetail(${g.id})">
            <div class="gcard-top">
                <div class="gcard-sport">
                    <span class="dot" style="background:${SPORT_COLORS[g.sport]};color:${SPORT_COLORS[g.sport]}"></span>
                    ${SPORTS[g.sport].e} ${SPORTS[g.sport].n} ${g.format}
                    <span style="color:var(--accent);font-size:11px;font-weight:700">${isHost ? '🏠 HOST' : '🏃'}</span>
                </div>
                <span class="gcard-time ${urgency.cls}">${urgency.label}</span>
            </div>
            <div class="gcard-mid">
                <span>📍 ${g.loc.name}</span>
                <span class="spots">${g.players.length}/${totalSpots(g)}</span>
            </div>
        </div>`;
    }).join('');
}

// ========================
// CHAT LIST TAB
// ========================
function renderChatList() {
    const el = document.getElementById('chats-list');
    const items = Object.keys(chatData).map(id => {
        const g = games.find(x => x.id === parseInt(id));
        if (!g) return null;
        const msgs = chatData[id];
        const last = msgs[msgs.length - 1];
        return {g, last};
    }).filter(Boolean);

    if (!items.length) { el.innerHTML = '<div class="empty">Nuk ke biseda akoma</div>'; return; }
    el.innerHTML = items.map(({g, last}) => `
        <div class="chat-item" onclick="openChat(${g.id})">
            <div class="ci-icon pin-${g.sport}">${SPORTS[g.sport].e}</div>
            <div class="ci-info">
                <div class="ci-name">${SPORTS[g.sport].n} ${g.format}</div>
                <div class="ci-last">${last.who ? last.who+': ' : ''}${last.text}</div>
            </div>
            <div class="ci-time">${fmtTime(last.t)}</div>
        </div>
    `).join('');
}

// ========================
// PROFILE
// ========================
function updateProfile() {
    if (!me) return;
    const av = document.getElementById('prof-avatar');
    av.innerHTML = me.photo ? `<img src="${me.photo}">` : me.name[0];
    document.getElementById('prof-name').textContent = me.name;
    document.getElementById('prof-meta').textContent = `${me.age} vjeç · ${me.lagja}`;
    document.getElementById('s-played').textContent = me.matches;
    document.getElementById('s-wins').textContent = me.wins;
    document.getElementById('s-losses').textContent = me.losses;
    const sp = document.getElementById('prof-sports');
    sp.innerHTML = (me.sports||[]).map(s => `<span class="chip">${SPORTS[s]?.e||''} ${SPORTS[s]?.n||s}</span>`).join('');
}

function logout() {
    localStorage.removeItem('sf_me');
    me = null;
    toast('U çkyçe','ok');
    goTo('splash');
}

// ========================
// UTILITIES
// ========================
function fmtDate(str) {
    const p = str.split('-');
    const d = new Date(p[0], p[1]-1, p[2]);
    const t = new Date(); t.setHours(0,0,0,0);
    const tm = new Date(t); tm.setDate(tm.getDate()+1);
    d.setHours(0,0,0,0);
    if (d.getTime()===t.getTime()) return 'Sot';
    if (d.getTime()===tm.getTime()) return 'Nesër';
    const m = ['Jan','Shk','Mar','Pri','Maj','Qer','Kor','Gus','Sht','Tet','Nën','Dhj'];
    return `${d.getDate()} ${m[d.getMonth()]}`;
}

function fmtTime(d) {
    if (!(d instanceof Date)) d = new Date(d);
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

function toast(msg, type) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.className = `toast show ${type||''}`;
    setTimeout(() => el.className = 'toast', 2500);
}

// ========================
// INIT
// ========================
document.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('sf_me');
    if (saved) {
        me = JSON.parse(saved);
        goTo('home');
    }
    document.getElementById('c-date').value = today;
});
