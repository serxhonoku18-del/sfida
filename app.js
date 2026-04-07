// ===== SFIDA APP =====

// --- State ---
let currentUser = null;
let challenges = [];
let markers = [];
let map = null;
let miniMap = null;
let miniMapMarker = null;
let currentFilter = 'all';
let currentGenderFilter = 'all';
let feedExpanded = false;
let selectedChallengeSport = null;
let selectedFormat = null;
let selectedLevel = null;
let selectedStake = null;
let selectedChallengeGender = null;
let haveCount = 1;
let needCount = 1;
let challengeLocation = null;

const sportEmojis = {
    futboll: '⚽', basketboll: '🏀', pingpong: '🏓',
    volejboll: '🏐', tenis: '🎾', badminton: '🏸'
};
const sportNames = {
    futboll: 'Futboll', basketboll: 'Basketboll', pingpong: 'Ping Pong',
    volejboll: 'Volejboll', tenis: 'Tenis', badminton: 'Badminton'
};
const stakeLabels = {
    redbull: '🥤 Red Bull', kafe: '☕ Kafe', byrek: '🥧 Byrek',
    akullore: '🍦 Akullore', pizza: '🍕 Pizza', asgje: '🤝 Asgjë'
};

// --- Demo data ---
const demoUsers = [
    { id: 1, name: 'Aldi', age: 22, gender: 'djem', lagja: 'Blloku', photo: null, rating: 4.8, matches: 15, wins: 10, losses: 5 },
    { id: 2, name: 'Erion', age: 19, gender: 'djem', lagja: 'Astiri', photo: null, rating: 4.5, matches: 8, wins: 5, losses: 3 },
    { id: 3, name: 'Klajdi', age: 24, gender: 'djem', lagja: 'Komuna e Parisit', photo: null, rating: 4.9, matches: 22, wins: 18, losses: 4 },
    { id: 4, name: 'Sara', age: 20, gender: 'vajza', lagja: 'Tirana e Re', photo: null, rating: 4.7, matches: 12, wins: 9, losses: 3 },
    { id: 5, name: 'Dori', age: 21, gender: 'djem', lagja: 'Sauk', photo: null, rating: 4.3, matches: 6, wins: 3, losses: 3 },
    { id: 6, name: 'Enxhi', age: 18, gender: 'vajza', lagja: 'Laprakë', photo: null, rating: 4.6, matches: 10, wins: 7, losses: 3 },
];

const demoChallenges = [
    {
        id: 1, sport: 'futboll', format: '3v3', have: 2, need: 4,
        location: { lat: 41.3275, lng: 19.8187, name: 'Parku Rinia' },
        date: '2026-04-07', time: '18:00', level: 'competitive',
        stake: 'redbull', gender: 'djem', note: 'Kemi topin, sjellni ujë',
        host: demoUsers[0], players: [demoUsers[0], demoUsers[1]],
        status: 'active'
    },
    {
        id: 2, sport: 'basketboll', format: '2v2', have: 1, need: 3,
        location: { lat: 41.3300, lng: 19.8230, name: 'Fusha e Basketbollit, Bllok' },
        date: '2026-04-07', time: '17:00', level: 'chill',
        stake: 'kafe', gender: 'djem', note: '',
        host: demoUsers[2], players: [demoUsers[2]],
        status: 'active'
    },
    {
        id: 3, sport: 'pingpong', format: '1v1', have: 1, need: 1,
        location: { lat: 41.3250, lng: 19.8150, name: 'Parku i Liqenit' },
        date: '2026-04-08', time: '16:00', level: 'serious',
        stake: 'pizza', gender: 'djem', note: 'Kam raketat',
        host: demoUsers[4], players: [demoUsers[4]],
        status: 'active'
    },
    {
        id: 4, sport: 'volejboll', format: '3v3', have: 2, need: 4,
        location: { lat: 41.3220, lng: 19.8100, name: 'Plazhi i Liqenit' },
        date: '2026-04-08', time: '10:00', level: 'chill',
        stake: 'akullore', gender: 'vajza', note: 'Kemi rrjetën',
        host: demoUsers[3], players: [demoUsers[3], demoUsers[5]],
        status: 'active'
    },
    {
        id: 5, sport: 'tenis', format: '1v1', have: 1, need: 1,
        location: { lat: 41.3310, lng: 19.8280, name: 'Kompleksi Olimpik' },
        date: '2026-04-09', time: '09:00', level: 'competitive',
        stake: 'byrek', gender: 'djem', note: '',
        host: demoUsers[1], players: [demoUsers[1]],
        status: 'active'
    },
    {
        id: 6, sport: 'badminton', format: '2v2', have: 2, need: 2,
        location: { lat: 41.3290, lng: 19.8160, name: 'Parku i Madh' },
        date: '2026-04-07', time: '19:00', level: 'chill',
        stake: 'asgje', gender: 'vajza', note: 'Kemi raketat per te gjithe',
        host: demoUsers[5], players: [demoUsers[5], demoUsers[3]],
        status: 'active'
    }
];

challenges = [...demoChallenges];

// --- Screen Management ---
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById(screenId);
    if (screen) {
        screen.classList.add('active');
        if (screenId === 'main-screen') {
            setTimeout(() => {
                if (!map) {
                    initMap();
                } else {
                    map.invalidateSize();
                }
            }, 100);
        }
        if (screenId === 'create-challenge-screen') {
            setTimeout(initMiniMap, 200);
        }
    }
}

// --- Auth Flow ---
function sendSMSCode() {
    const phone = document.getElementById('phone-input').value;
    if (!phone || phone.length < 8) {
        showToast('Shkruaj numrin e telefonit', 'error');
        return;
    }
    document.getElementById('sms-verify').classList.remove('hidden');
    showToast('Kodi u dërgua!', 'success');

    // Auto focus first digit
    document.querySelector('.code-digit[data-index="0"]').focus();
}

// SMS code digit auto-advance
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.code-digit').forEach(input => {
        input.addEventListener('input', (e) => {
            if (e.target.value && e.target.dataset.index < 3) {
                document.querySelector(`.code-digit[data-index="${parseInt(e.target.dataset.index) + 1}"]`).focus();
            }
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && e.target.dataset.index > 0) {
                document.querySelector(`.code-digit[data-index="${parseInt(e.target.dataset.index) - 1}"]`).focus();
            }
        });
    });

    // Check for saved user
    const saved = localStorage.getItem('sfida_user');
    if (saved) {
        currentUser = JSON.parse(saved);
        showScreen('main-screen');
        updateProfileDisplay();
    }

    // Set default date to today
    const dateInput = document.getElementById('challenge-date');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
});

function verifySMS() {
    const digits = document.querySelectorAll('.code-digit');
    let code = '';
    digits.forEach(d => code += d.value);
    if (code.length < 4) {
        showToast('Shkruaj kodin e plotë', 'error');
        return;
    }
    // Demo: any 4 digits work
    showToast('Verifikuar!', 'success');
    showScreen('profile-setup-screen');
}

// --- Profile Setup ---
function previewPhoto(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('photo-preview');
            preview.innerHTML = `<img src="${e.target.result}" alt="Photo">`;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

let selectedGender = null;
function selectGender(btn) {
    document.querySelectorAll('.gender-btn[data-gender]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedGender = btn.dataset.gender;
}

function toggleSport(card) {
    card.classList.toggle('selected');
    const skill = card.querySelector('.skill-selector');
    if (card.classList.contains('selected')) {
        skill.classList.remove('hidden');
    } else {
        skill.classList.add('hidden');
        skill.querySelectorAll('.skill-btn').forEach(b => b.classList.remove('active'));
    }
}

function selectSkill(btn, level) {
    const selector = btn.parentElement;
    selector.querySelectorAll('.skill-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function completeSignup() {
    const name = document.getElementById('profile-name').value;
    const age = parseInt(document.getElementById('profile-age').value);
    const lagja = document.getElementById('profile-lagja').value;
    const photoEl = document.querySelector('#photo-preview img');
    const selectedSports = document.querySelectorAll('.sport-card.selected');

    if (!name) { showToast('Shkruaj emrin', 'error'); return; }
    if (!age || age < 16) { showToast('Mosha minimale është 16', 'error'); return; }
    if (!selectedGender) { showToast('Zgjidh gjininë', 'error'); return; }
    if (!lagja) { showToast('Zgjidh lagjën', 'error'); return; }
    if (selectedSports.length === 0) { showToast('Zgjidh të paktën 1 sport', 'error'); return; }

    const sports = [];
    selectedSports.forEach(card => {
        const sport = card.dataset.sport;
        const activeSkill = card.querySelector('.skill-btn.active');
        sports.push({
            sport,
            skill: activeSkill ? activeSkill.textContent : 'Mesatar'
        });
    });

    currentUser = {
        id: Date.now(),
        name,
        age,
        gender: selectedGender,
        lagja,
        photo: photoEl ? photoEl.src : null,
        sports,
        rating: 5.0,
        matches: 0,
        wins: 0,
        losses: 0,
        noShows: 0,
        badges: []
    };

    localStorage.setItem('sfida_user', JSON.stringify(currentUser));
    showToast('Mirë se erdhe në Sfida!', 'success');
    showScreen('main-screen');
    updateProfileDisplay();
}

// --- Map ---
function initMap() {
    if (map) return;
    map = L.map('map', {
        zoomControl: false,
        attributionControl: false
    }).setView([41.3275, 19.8187], 14);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
    }).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);

    renderChallenges();
}

function initMiniMap() {
    if (miniMap) {
        miniMap.invalidateSize();
        return;
    }
    miniMap = L.map('mini-map', {
        zoomControl: false,
        attributionControl: false
    }).setView([41.3275, 19.8187], 14);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
    }).addTo(miniMap);

    miniMap.on('click', (e) => {
        if (miniMapMarker) miniMap.removeLayer(miniMapMarker);
        miniMapMarker = L.marker(e.latlng, {
            icon: L.divIcon({
                className: 'challenge-marker marker-futboll',
                html: '📍',
                iconSize: [44, 44],
                iconAnchor: [22, 22]
            })
        }).addTo(miniMap);
        challengeLocation = { lat: e.latlng.lat, lng: e.latlng.lng };
    });
}

function renderChallenges() {
    // Clear existing markers
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    const filtered = challenges.filter(c => {
        if (c.status !== 'active') return false;
        if (currentFilter !== 'all' && c.sport !== currentFilter) return false;
        if (currentGenderFilter !== 'all' && c.gender !== currentGenderFilter) return false;
        return true;
    });

    // Add markers
    filtered.forEach(c => {
        const icon = L.divIcon({
            className: `challenge-marker marker-${c.sport}`,
            html: sportEmojis[c.sport],
            iconSize: [44, 44],
            iconAnchor: [22, 22]
        });

        const marker = L.marker([c.location.lat, c.location.lng], { icon }).addTo(map);
        const spotsLeft = (c.need + c.have) - c.players.length;

        marker.bindPopup(`
            <div class="popup-card">
                <h4>${sportEmojis[c.sport]} ${sportNames[c.sport]} ${c.format}</h4>
                <p>📍 ${c.location.name}</p>
                <p>🕐 ${formatDate(c.date)} ${c.time}</p>
                <p>👤 Host: ${c.host.name}</p>
                <span class="popup-spots">${spotsLeft} vende të lira</span>
                <button class="popup-btn" onclick="openChallengeDetail(${c.id})">Shiko detajet</button>
            </div>
        `, { closeButton: false, className: 'dark-popup' });

        marker.on('mouseover', function() { this.openPopup(); });
        markers.push(marker);
    });

    // Update feed
    renderFeed(filtered);
}

function renderFeed(filtered) {
    const list = document.getElementById('challenge-list');
    if (!filtered) {
        filtered = challenges.filter(c => {
            if (c.status !== 'active') return false;
            if (currentFilter !== 'all' && c.sport !== currentFilter) return false;
            if (currentGenderFilter !== 'all' && c.gender !== currentGenderFilter) return false;
            return true;
        });
    }

    if (filtered.length === 0) {
        list.innerHTML = '<div class="empty-state"><p>Nuk ka sfida aktive</p></div>';
        return;
    }

    list.innerHTML = filtered.map(c => {
        const spotsLeft = (c.need + c.have) - c.players.length;
        const genderClass = c.gender === 'djem' ? 'gender-djem' : 'gender-vajza';
        const genderText = c.gender === 'djem' ? 'Djem' : 'Vajza';
        return `
            <div class="challenge-card" onclick="openChallengeDetail(${c.id})">
                <div class="challenge-card-top">
                    <div>
                        <span class="challenge-sport-badge badge-${c.sport}">${sportEmojis[c.sport]} ${sportNames[c.sport]}</span>
                        <span class="gender-badge ${genderClass}">${genderText}</span>
                    </div>
                    <span class="challenge-format">${c.format}</span>
                </div>
                <div class="challenge-card-info">
                    <span>📍 ${c.location.name}</span>
                    <span>🕐 ${formatDate(c.date)} — ${c.time}</span>
                    ${c.note ? `<span>💬 ${c.note}</span>` : ''}
                </div>
                <div class="challenge-card-bottom">
                    <div class="challenge-host">
                        <div class="host-avatar" style="display:flex;align-items:center;justify-content:center;font-size:14px;">
                            ${c.host.photo ? `<img src="${c.host.photo}" class="host-avatar">` : c.host.name[0]}
                        </div>
                        <span class="host-name">${c.host.name} ⭐${c.host.rating}</span>
                    </div>
                    <span class="challenge-stake">${stakeLabels[c.stake] || c.stake}</span>
                    <span class="spots-badge">${spotsLeft} vende</span>
                </div>
            </div>
        `;
    }).join('');
}

// --- Filters ---
function filterSport(sport, btn) {
    currentFilter = sport;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderChallenges();
}

function filterGender(gender, btn) {
    currentGenderFilter = gender;
    document.querySelectorAll('.gender-filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderChallenges();
}

function toggleFeed() {
    const feed = document.getElementById('challenge-feed');
    feed.classList.toggle('collapsed');
    feedExpanded = !feed.classList.contains('collapsed');
}

// --- Create Challenge ---
function selectChallengeSport(btn) {
    document.querySelectorAll('.create-sport-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedChallengeSport = btn.dataset.sport;
}

function selectFormat(btn, format) {
    document.querySelectorAll('.format-btn').forEach(b => {
        if (b.parentElement === btn.parentElement) b.classList.remove('active');
    });
    btn.classList.add('active');
    selectedFormat = format;
}

function selectLevel(btn, level) {
    document.querySelectorAll('.format-btn').forEach(b => {
        if (b.parentElement === btn.parentElement) b.classList.remove('active');
    });
    btn.classList.add('active');
    selectedLevel = level;
}

function selectStake(btn, stake) {
    document.querySelectorAll('.stake-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedStake = stake;
    document.getElementById('custom-stake').value = '';
}

function selectChallengeGender(btn) {
    document.querySelectorAll('.gender-btn[data-cgender]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedChallengeGender = btn.dataset.cgender;
}

function adjustCount(type, delta) {
    if (type === 'have') {
        haveCount = Math.max(1, haveCount + delta);
        document.getElementById('have-count').textContent = haveCount;
    } else {
        needCount = Math.max(1, needCount + delta);
        document.getElementById('need-count').textContent = needCount;
    }
}

function createChallenge() {
    if (!currentUser) {
        showToast('Duhet të regjistrohesh', 'error');
        showScreen('login-screen');
        return;
    }
    if (!selectedChallengeSport) { showToast('Zgjidh sportin', 'error'); return; }
    if (!selectedFormat) { showToast('Zgjidh formatin', 'error'); return; }
    if (!selectedChallengeGender) { showToast('Zgjidh kush mund të luajë', 'error'); return; }
    if (!challengeLocation) { showToast('Kliko hartën për vendndodhjen', 'error'); return; }

    const date = document.getElementById('challenge-date').value;
    const time = document.getElementById('challenge-time').value;
    const locationName = document.getElementById('location-name').value;
    const note = document.getElementById('challenge-note').value;
    const customStake = document.getElementById('custom-stake').value;

    if (!date || !time) { showToast('Zgjidh datën dhe orën', 'error'); return; }
    if (!locationName) { showToast('Shkruaj emrin e vendit', 'error'); return; }

    const newChallenge = {
        id: Date.now(),
        sport: selectedChallengeSport,
        format: selectedFormat,
        have: haveCount,
        need: needCount,
        location: { ...challengeLocation, name: locationName },
        date, time,
        level: selectedLevel || 'chill',
        stake: customStake || selectedStake || 'asgje',
        gender: selectedChallengeGender,
        note,
        host: currentUser,
        players: [currentUser],
        status: 'active'
    };

    challenges.unshift(newChallenge);
    showToast('Sfida u krijua!', 'success');

    // Reset form
    selectedChallengeSport = null;
    selectedFormat = null;
    selectedLevel = null;
    selectedStake = null;
    selectedChallengeGender = null;
    haveCount = 1;
    needCount = 1;
    challengeLocation = null;
    document.querySelectorAll('.create-sport-btn, .format-btn, .stake-btn, .gender-btn[data-cgender]').forEach(b => b.classList.remove('active'));
    document.getElementById('have-count').textContent = '1';
    document.getElementById('need-count').textContent = '1';
    document.getElementById('location-name').value = '';
    document.getElementById('challenge-note').value = '';
    document.getElementById('custom-stake').value = '';
    if (miniMapMarker) { miniMap.removeLayer(miniMapMarker); miniMapMarker = null; }

    showScreen('main-screen');
    renderChallenges();

    // Add to chat list
    addChatEntry(newChallenge);
}

// --- Challenge Detail ---
function openChallengeDetail(id) {
    const c = challenges.find(ch => ch.id === id);
    if (!c) return;

    const content = document.getElementById('challenge-detail-content');
    const spotsLeft = (c.need + c.have) - c.players.length;
    const isHost = currentUser && c.host.id === currentUser.id;
    const isPlayer = currentUser && c.players.some(p => p.id === currentUser.id);
    const genderText = c.gender === 'djem' ? 'Vetëm Djem' : 'Vetëm Vajza';

    content.innerHTML = `
        <div class="detail-header">
            <div class="detail-sport-icon marker-${c.sport}" style="width:52px;height:52px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:28px;">
                ${sportEmojis[c.sport]}
            </div>
            <div>
                <div class="detail-title">${sportNames[c.sport]} ${c.format}</div>
                <div class="detail-format">${c.level === 'chill' ? 'Chill' : c.level === 'competitive' ? 'Kompetitiv' : 'Serioz'} — ${genderText}</div>
            </div>
        </div>

        <div class="detail-section">
            <h4>Detajet</h4>
            <div class="detail-row"><span>📍 Vendi</span><span>${c.location.name}</span></div>
            <div class="detail-row"><span>📅 Data</span><span>${formatDate(c.date)}</span></div>
            <div class="detail-row"><span>🕐 Ora</span><span>${c.time}</span></div>
            <div class="detail-row"><span>🎯 Basti</span><span>${stakeLabels[c.stake] || c.stake}</span></div>
            <div class="detail-row"><span>👥 Vende të lira</span><span class="spots-badge">${spotsLeft}</span></div>
            ${c.note ? `<div class="detail-row"><span>💬 Shënim</span><span>${c.note}</span></div>` : ''}
        </div>

        <div class="detail-section">
            <h4>Lojtarët (${c.players.length}/${c.have + c.need})</h4>
            <div class="detail-players">
                ${c.players.map((p, i) => `
                    <div class="detail-player">
                        <div style="width:32px;height:32px;border-radius:50%;background:var(--bg-input);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;">
                            ${p.photo ? `<img src="${p.photo}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;">` : p.name[0]}
                        </div>
                        <div>
                            <div class="detail-player-name">${p.name} ${p.age ? '(' + p.age + ')' : ''}</div>
                            <div class="detail-player-role">${i === 0 ? '🏠 Host' : '🏃 Lojtar'}</div>
                        </div>
                        ${p.rating ? `<span style="color:var(--warning);font-size:12px;">⭐${p.rating}</span>` : ''}
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="detail-actions">
            ${!currentUser ? `<button class="btn btn-primary" onclick="closeModal(); showScreen('login-screen');">Regjistrohu për tu bashkuar</button>` :
            isHost ? `
                <button class="btn btn-primary" onclick="openChat(${c.id})">💬 Hap Chat</button>
                <button class="btn btn-ghost" onclick="giveHostRole(${c.id})">Jep rolin Host</button>
            ` :
            isPlayer ? `
                <button class="btn btn-primary" onclick="openChat(${c.id})">💬 Hap Chat</button>
            ` :
            spotsLeft > 0 ? `
                <button class="btn btn-primary btn-large" onclick="requestJoin(${c.id})">Dua të luaj! 🏃</button>
            ` :
            `<button class="btn btn-ghost btn-large" disabled>Plotë</button>`
            }
        </div>
    `;

    document.getElementById('challenge-detail').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('challenge-detail').classList.add('hidden');
}

// --- Join Challenge ---
function requestJoin(challengeId) {
    if (!currentUser) {
        showScreen('login-screen');
        return;
    }

    const c = challenges.find(ch => ch.id === challengeId);
    if (!c) return;

    // Check gender match
    if (c.gender !== currentUser.gender) {
        showToast(`Kjo sfidë është vetëm për ${c.gender === 'djem' ? 'djem' : 'vajza'}`, 'error');
        return;
    }

    // Simulate host accepting (in demo)
    showToast('Kërkesa u dërgua te hosti!', 'success');
    closeModal();

    // Demo: auto-accept after 2 seconds
    setTimeout(() => {
        const challenge = challenges.find(ch => ch.id === challengeId);
        if (challenge && !challenge.players.some(p => p.id === currentUser.id)) {
            challenge.players.push(currentUser);
            showToast(`${challenge.host.name} të pranoi! 🎉`, 'success');
            renderChallenges();
            addChatEntry(challenge);
        }
    }, 2000);
}

// --- Host Role ---
function giveHostRole(challengeId) {
    const c = challenges.find(ch => ch.id === challengeId);
    if (!c || c.players.length < 2) {
        showToast('Duhen të paktën 2 lojtarë', 'error');
        return;
    }

    // Show selection of players to promote
    const otherPlayers = c.players.filter(p => p.id !== c.host.id);
    const playerList = otherPlayers.map(p => `
        <div style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--bg-input);border-radius:12px;cursor:pointer;margin-top:8px;"
             onclick="promoteToHost(${c.id}, ${p.id})">
            <div style="width:40px;height:40px;border-radius:50%;background:var(--bg-card);display:flex;align-items:center;justify-content:center;font-weight:700;">
                ${p.name[0]}
            </div>
            <div>
                <div style="font-weight:700;">${p.name}</div>
                <div style="color:var(--text-secondary);font-size:12px;">⭐${p.rating || '5.0'}</div>
            </div>
        </div>
    `).join('');

    document.getElementById('challenge-detail-content').innerHTML += `
        <div class="detail-section">
            <h4>Zgjidh hostin e ri</h4>
            ${playerList}
        </div>
    `;
}

function promoteToHost(challengeId, playerId) {
    const c = challenges.find(ch => ch.id === challengeId);
    if (!c) return;
    const newHost = c.players.find(p => p.id === playerId);
    if (!newHost) return;

    c.host = newHost;
    // Reorder: host first
    c.players = [newHost, ...c.players.filter(p => p.id !== playerId)];
    showToast(`${newHost.name} është tani hosti!`, 'success');
    closeModal();
    renderChallenges();
}

// --- Chat ---
const chatMessages = {};

function addChatEntry(challenge) {
    if (!chatMessages[challenge.id]) {
        chatMessages[challenge.id] = [
            { type: 'system', text: `${sportEmojis[challenge.sport]} Sfida u krijua!`, time: new Date() }
        ];
    }
}

function openChat(challengeId) {
    const c = challenges.find(ch => ch.id === challengeId);
    if (!c) return;

    closeModal();
    document.getElementById('chat-title').textContent = `${sportEmojis[c.sport]} ${sportNames[c.sport]} ${c.format}`;
    document.getElementById('chat-subtitle').textContent = `${c.location.name} — ${formatDate(c.date)} ${c.time}`;

    // Initialize chat if needed
    if (!chatMessages[c.id]) {
        chatMessages[c.id] = [
            { type: 'system', text: `${sportEmojis[c.sport]} Sfida u krijua!`, time: new Date() }
        ];
    }

    // Add demo messages for existing challenges
    if (c.id <= 6 && chatMessages[c.id].length <= 1) {
        const demoMsgs = getDemoMessages(c);
        chatMessages[c.id].push(...demoMsgs);
    }

    renderChatMessages(c.id);
    showScreen('chat-screen');

    // Store current chat id
    document.getElementById('chat-messages').dataset.challengeId = c.id;
}

function getDemoMessages(c) {
    const msgs = [];
    if (c.players.length > 1) {
        msgs.push({
            type: 'other', sender: c.players[1].name,
            text: 'Përshëndetje! Po vij në orë!',
            time: new Date(Date.now() - 3600000)
        });
    }
    msgs.push({
        type: 'other', sender: c.host.name,
        text: c.note || 'Mirë se vini!',
        time: new Date(Date.now() - 1800000)
    });
    return msgs;
}

function renderChatMessages(challengeId) {
    const container = document.getElementById('chat-messages');
    const msgs = chatMessages[challengeId] || [];

    container.innerHTML = msgs.map(m => {
        if (m.type === 'system') {
            return `<div class="chat-msg chat-msg-system">${m.text}</div>`;
        }
        const isMine = currentUser && m.sender === currentUser.name;
        return `
            <div class="chat-msg ${isMine ? 'chat-msg-mine' : 'chat-msg-other'}">
                ${!isMine ? `<div class="chat-msg-sender">${m.sender}</div>` : ''}
                ${m.text}
                <div class="chat-msg-time">${formatTime(m.time)}</div>
            </div>
        `;
    }).join('');

    container.scrollTop = container.scrollHeight;
}

function sendMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;

    const challengeId = parseInt(document.getElementById('chat-messages').dataset.challengeId);
    if (!chatMessages[challengeId]) chatMessages[challengeId] = [];

    chatMessages[challengeId].push({
        type: 'mine',
        sender: currentUser ? currentUser.name : 'Ti',
        text,
        time: new Date()
    });

    input.value = '';
    renderChatMessages(challengeId);

    // Demo: auto-reply
    setTimeout(() => {
        const c = challenges.find(ch => ch.id === challengeId);
        if (c && c.players.length > 0) {
            const responder = c.players.find(p => !currentUser || p.id !== currentUser.id) || c.host;
            const replies = ['OK!', 'Po vij!', 'Bukur!', 'Perfekt 👍', 'Dakord!', 'Se shpejti!'];
            chatMessages[challengeId].push({
                type: 'other',
                sender: responder.name,
                text: replies[Math.floor(Math.random() * replies.length)],
                time: new Date()
            });
            renderChatMessages(challengeId);
        }
    }, 1500 + Math.random() * 2000);
}

function sendQuickMsg(text) {
    document.getElementById('chat-input').value = text;
    sendMessage();
}

// --- Tab Navigation ---
function switchTab(tab, btn) {
    // Update nav buttons across all screens
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    switch(tab) {
        case 'map':
            showScreen('main-screen');
            break;
        case 'challenges':
            showScreen('challenges-tab-screen');
            renderMyChallenges();
            break;
        case 'chat':
            showScreen('chat-list-screen');
            renderChatList();
            break;
        case 'profile':
            if (!currentUser) {
                showScreen('login-screen');
            } else {
                showScreen('profile-screen');
                updateProfileDisplay();
            }
            break;
    }
}

function renderMyChallenges() {
    const list = document.getElementById('my-challenges-list');
    if (!currentUser) {
        list.innerHTML = '<div class="empty-state"><p>Regjistrohu për të parë sfidat e tua</p></div>';
        return;
    }

    const myChallenges = challenges.filter(c =>
        c.players.some(p => p.id === currentUser.id)
    );

    if (myChallenges.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <p>Nuk ke sfida akoma</p>
                <button class="btn btn-primary" onclick="showScreen('create-challenge-screen')">Krijo sfidën e parë</button>
            </div>
        `;
        return;
    }

    list.innerHTML = myChallenges.map(c => {
        const isHost = c.host.id === currentUser.id;
        const spotsLeft = (c.need + c.have) - c.players.length;
        return `
            <div class="challenge-card" onclick="openChallengeDetail(${c.id})">
                <div class="challenge-card-top">
                    <span class="challenge-sport-badge badge-${c.sport}">${sportEmojis[c.sport]} ${sportNames[c.sport]}</span>
                    <span style="color:${isHost ? 'var(--primary)' : 'var(--text-secondary)'};font-weight:700;font-size:12px;">
                        ${isHost ? '🏠 HOST' : '🏃 LOJTAR'}
                    </span>
                </div>
                <div class="challenge-card-info">
                    <span>📍 ${c.location.name}</span>
                    <span>🕐 ${formatDate(c.date)} — ${c.time} — ${c.format}</span>
                </div>
                <div class="challenge-card-bottom">
                    <span class="challenge-stake">${stakeLabels[c.stake] || c.stake}</span>
                    <span class="spots-badge">${spotsLeft} vende</span>
                </div>
            </div>
        `;
    }).join('');
}

function renderChatList() {
    const list = document.getElementById('chat-list');

    const chatsWithMessages = Object.keys(chatMessages).map(id => {
        const c = challenges.find(ch => ch.id === parseInt(id));
        const msgs = chatMessages[id];
        const lastMsg = msgs[msgs.length - 1];
        return { challenge: c, lastMsg, id: parseInt(id) };
    }).filter(item => item.challenge);

    if (chatsWithMessages.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <p>Nuk ke biseda akoma</p>
                <p class="subtitle">Bashkohu në një sfidë për të filluar bisedën</p>
            </div>
        `;
        return;
    }

    list.innerHTML = chatsWithMessages.map(item => {
        const c = item.challenge;
        const last = item.lastMsg;
        return `
            <div class="chat-list-item" onclick="openChat(${c.id})">
                <div class="chat-list-icon marker-${c.sport}">${sportEmojis[c.sport]}</div>
                <div class="chat-list-info">
                    <div class="chat-list-name">${sportNames[c.sport]} ${c.format}</div>
                    <div class="chat-list-last">${last.sender ? last.sender + ': ' : ''}${last.text}</div>
                </div>
                <div class="chat-list-time">${formatTime(last.time)}</div>
            </div>
        `;
    }).join('');
}

function showChallengeTab(tab, btn) {
    document.querySelectorAll('.ctab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    // For demo, all tabs show same content
    renderMyChallenges();
}

// --- Profile ---
function updateProfileDisplay() {
    if (!currentUser) return;

    const photoDisplay = document.getElementById('profile-photo-display');
    if (currentUser.photo) {
        photoDisplay.innerHTML = `<img src="${currentUser.photo}">`;
    } else {
        photoDisplay.textContent = currentUser.name ? currentUser.name[0] : '?';
    }

    document.getElementById('profile-name-display').textContent = currentUser.name;
    document.getElementById('profile-meta-display').textContent = `${currentUser.age} vjeç • ${currentUser.lagja}`;
    document.getElementById('stat-played').textContent = currentUser.matches;
    document.getElementById('stat-wins').textContent = currentUser.wins;
    document.getElementById('stat-losses').textContent = currentUser.losses;

    const sportsDisplay = document.getElementById('profile-sports-display');
    if (currentUser.sports) {
        sportsDisplay.innerHTML = currentUser.sports.map(s =>
            `<span class="profile-sport-tag">${sportEmojis[s.sport]} ${sportNames[s.sport]} — ${s.skill}</span>`
        ).join('');
    }
}

function logout() {
    localStorage.removeItem('sfida_user');
    currentUser = null;
    showScreen('splash-screen');
    showToast('U çkyçe me sukses', 'success');
}

// --- Utilities ---
function formatDate(dateStr) {
    // Parse as local date to avoid UTC offset issues
    const parts = dateStr.split('-');
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    d.setHours(0,0,0,0);

    if (d.getTime() === today.getTime()) return 'Sot';
    if (d.getTime() === tomorrow.getTime()) return 'Nesër';

    const months = ['Jan', 'Shk', 'Mar', 'Pri', 'Maj', 'Qer', 'Kor', 'Gus', 'Sht', 'Tet', 'Nën', 'Dhj'];
    return `${d.getDate()} ${months[d.getMonth()]}`;
}

function formatTime(date) {
    if (!(date instanceof Date)) date = new Date(date);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function showToast(message, type = '') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    setTimeout(() => toast.classList.add('hidden'), 2500);
}

// --- Initialize demo chat entries ---
demoChallenges.forEach(c => addChatEntry(c));
