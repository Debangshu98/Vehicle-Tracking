// ─────────────────────────────────────────────────────────────
// AUTHENTICATION SYSTEM & STATE MANAGEMENT
// ─────────────────────────────────────────────────────────────

// Switch between Login and Signup forms
function switchAuthMode(mode, event) {
  if (event) event.preventDefault();
  
  const loginCard = document.getElementById('login-card');
  const signupCard = document.getElementById('signup-card');
  const alertBox = document.getElementById('auth-alert');
  
  if (alertBox) alertBox.style.display = 'none';

  if (mode === 'signup') {
    loginCard.classList.remove('active');
    signupCard.classList.add('active');
  } else {
    signupCard.classList.remove('active');
    loginCard.classList.add('active');
  }
}

// Handle User Signup with Auto-Redirection
function handleSignup(event) {
  event.preventDefault();
  
  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const btn = document.getElementById('btn-signup');

  if (!name || !email || !password) return;

  // Visual loading state
  btn.innerHTML = `<span>Creating Account...</span>`;
  btn.style.opacity = '0.8';

  setTimeout(() => {
    // Store registered user details locally
    const users = JSON.parse(localStorage.getItem('wheelseye_users') || '{}');
    users[email] = { name, email, password };
    localStorage.setItem('wheelseye_users', JSON.stringify(users));

    btn.innerHTML = `<span>Create Account</span> <span class="btn-arrow">→</span>`;
    btn.style.opacity = '1';

    // Show success alert and auto-redirect to login view
    switchAuthMode('login');
    showAuthAlert('Account created successfully! Please log in with your credentials.', 'success');
    
    // Pre-fill email in login field
    document.getElementById('login-email').value = email;
    document.getElementById('login-password').value = '';
    document.getElementById('login-password').focus();

    document.getElementById('signup-form').reset();
  }, 1000);
}

// Handle User Login
function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const btn = document.getElementById('btn-login');

  const users = JSON.parse(localStorage.getItem('wheelseye_users') || '{}');
  const registeredUser = users[email];

  btn.innerHTML = `<span>Authenticating...</span>`;
  btn.style.opacity = '0.8';

  setTimeout(() => {
    // Accept demo credentials OR any signed up user
    if ((registeredUser && registeredUser.password === password) || (email && password.length >= 4)) {
      const displayName = registeredUser ? registeredUser.name : email.split('@')[0];
      
      // Store current session
      localStorage.setItem('wheelseye_session', JSON.stringify({
        email,
        name: displayName,
        loggedInAt: new Date().toISOString()
      }));

      // Launch Dashboard
      launchDashboard(displayName);
    } else {
      showAuthAlert('Invalid email or password. Please try again.', 'error');
      btn.innerHTML = `<span>Sign In</span> <span class="btn-arrow">→</span>`;
      btn.style.opacity = '1';
    }
  }, 800);
}

function showAuthAlert(message, type) {
  const alertBox = document.getElementById('auth-alert');
  alertBox.className = `auth-alert ${type}`;
  alertBox.innerText = message;
  alertBox.style.display = 'block';
}

function launchDashboard(userName) {
  const authScreen = document.getElementById('auth-screen');
  const mainApp = document.getElementById('main-app');
  
  // Update avatar initial
  const avatar = document.getElementById('user-avatar');
  if (avatar && userName) avatar.innerText = userName.charAt(0).toUpperCase();

  // Hide Auth Screen & Reveal App
  authScreen.style.display = 'none';
  mainApp.classList.remove('hidden');

  // Initialize Map & Application Data
  initMap();
}

function handleLogout() {
  localStorage.removeItem('wheelseye_session');
  location.reload();
}

// Check session on page load
window.addEventListener('DOMContentLoaded', () => {
  const session = localStorage.getItem('wheelseye_session');
  if (session) {
    try {
      const userData = JSON.parse(session);
      launchDashboard(userData.name);
      return;
    } catch(e) {}
  }
});

// ─────────────────────────────────────────────────────────────
// Helpers & Path Calculations
// ─────────────────────────────────────────────────────────────

function densifyPath(latLngPoints, stepsPerSegment = 12) {
  const out = [];
  for (let i = 0; i < latLngPoints.length - 1; i++) {
    const [la1, lo1] = latLngPoints[i];
    const [la2, lo2] = latLngPoints[i + 1];
    for (let s = 0; s < stepsPerSegment; s++) {
      const t = s / stepsPerSegment;
      out.push([la1 + (la2 - la1) * t, lo1 + (lo2 - lo1) * t]);
    }
  }
  out.push([...latLngPoints[latLngPoints.length - 1]]);
  return out;
}

function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

// ─────────────────────────────────────────────────────────────
// Vehicle Data
// ─────────────────────────────────────────────────────────────
const vehiclesData = [
  {
    id: 'AS01JC9610',
    speed: '42 km/h', status: 'running',
    lastUpdated: 'Today, 09:48 PM',
    location: 'NH-27, Nagaon, Assam',
    info: '142 km today | Moving towards Guwahati',
    coords: [26.3451, 92.6835],
    waypoints: [
      [26.3451, 92.6835],
      [26.3508, 92.7050],
      [26.3529, 92.7130],
      [26.1715, 91.7462],
    ],
    checkpoints: [
      { title: 'CP 1 – Nagaon Bypass Fuel Station', time: '08:47 AM' },
      { title: 'CP 2 – NH-37 Junction Flyover',     time: '09:15 AM' },
    ],
    destination: { title: 'Destination – Jorabat, Guwahati' },
    jumpRatios: [0.30, 0.68],
    stopsCount: 2, stopDuration: '45 min', distance: '142.5 km'
  },
  {
    id: 'AS02E8777',
    speed: '0 km/h', status: 'stopped',
    lastUpdated: 'Today, 09:21 PM',
    location: 'Morigaon Road, Nagaon, Assam',
    info: '2 km today | Stopped since 4 hrs : 20 min',
    coords: [26.3490, 92.6843],
    waypoints: [
      [26.3490, 92.6843],
      [26.3549, 92.6960],
      [26.3563, 92.7095],
    ],
    checkpoints: [
      { title: 'CP 1 – Morigaon Crossroad', time: '07:10 AM' },
    ],
    destination: { title: 'Destination – East Depot Gate' },
    jumpRatios: [0.45],
    stopsCount: 1, stopDuration: '4 hrs : 20 min', distance: '2.1 km'
  },
  {
    id: 'AS23BC5040',
    speed: '0 km/h', status: 'nosignal',
    lastUpdated: '24 Aug 26, 08:45 AM',
    location: 'Senchoa Junction, Nagaon, Assam',
    info: '0 km today | No Signal since 3 days',
    coords: [26.3490, 92.6900],
    waypoints: [
      [26.3490, 92.6900],
      [26.3551, 92.6918],
    ],
    checkpoints: [
      { title: 'Last Known Ping – Senchoa Junction', time: '08:45 AM' },
    ],
    destination: { title: 'Intended Destination – Senchoa Yard' },
    jumpRatios: [0.50],
    stopsCount: 0, stopDuration: '3 days', distance: '0.0 km'
  },
  {
    id: 'WB09KA4421',
    speed: '54 km/h', status: 'running',
    lastUpdated: 'Today, 09:52 PM',
    location: 'NH-27, Siliguri, West Bengal',
    info: '185 km today | Moving towards Jalpaiguri',
    coords: [26.7271, 88.4235],
    waypoints: [
      [26.7271, 88.4235],
      [26.7405, 88.4550],
      [26.5181, 88.7290],
    ],
    checkpoints: [
      { title: 'CP 1 – Matigara Toll Plaza', time: '07:55 AM' },
    ],
    destination: { title: 'Destination – Jalpaiguri Warehouse' },
    jumpRatios: [0.35, 0.70],
    stopsCount: 2, stopDuration: '30 min', distance: '185.2 km'
  }
];

const routeCache = {};

async function ensureVehicleRoute(vehicle) {
  if (routeCache[vehicle.id]) return routeCache[vehicle.id];

  const coordStr = vehicle.waypoints.map(([la, lo]) => `${lo},${la}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/driving/${coordStr}?overview=full&geometries=geojson&steps=false`;

  let latLngPath = null;
  try {
    const res  = await fetch(url);
    const json = await res.json();
    if (json.code === 'Ok' && json.routes.length) {
      latLngPath = json.routes[0].geometry.coordinates.map(([lo, la]) => [la, lo]);
    }
  } catch (_) {}

  if (!latLngPath) {
    latLngPath = densifyPath(vehicle.waypoints, 30);
  } else {
    latLngPath = densifyPath(latLngPath, 4);
  }

  const jumpPathIndices = (vehicle.jumpRatios || []).map(
    r => Math.floor(r * (latLngPath.length - 1))
  );

  const cached = { path: latLngPath, jumpPathIndices };
  routeCache[vehicle.id] = cached;

  vehicle._cachedPath = latLngPath;
  vehicle._jumpPathIndices = jumpPathIndices;

  return cached;
}

// Market Penetration Data
const batchData = [
  {
    batchId: 'BATCH-001',
    productName: 'GPS Tracker Standard',
    totalProduced: 10000,
    channels: [
      { name: 'Distributor Network',          qty: 6000, isDistributed: true  },
      { name: 'Dealers',                      qty: 2000, isDistributed: true  },
      { name: 'Direct Retailers',             qty: 1000, isDistributed: true  },
      { name: 'Central Warehouse (In-Stock)', qty: 1000, isDistributed: false }
    ]
  }
];

// Serial Tracking Database
const serialDatabase = {
  'SN-9901': {
    serialNumber: 'SN-9901', productName: 'GPS Tracker Standard',
    batchId: 'BATCH-001', mfgDate: '12 Jan 2026', status: 'ACTIVE',
    currentHolder: 'Nagaon Dealer (Morigaon Road)', scanCount: 3,
    scans: [
      { date: '12 Jan 2026, 10:00 AM', event: 'Manufactured & Packaged',   location: 'Assembly Unit 1, Guwahati', device: 'Factory Scanner #04',     status: 'VALID' },
      { date: '15 Jan 2026, 02:30 PM', event: 'Dispatched to Distributor', location: 'Central Warehouse',         device: 'Handheld PDA #12',         status: 'VALID' },
      { date: '18 Jan 2026, 11:15 AM', event: 'Received by Dealer',        location: 'Nagaon Dealer Point',       device: 'Mobile App (User: D-442)', status: 'VALID' }
    ]
  },
  'SN-9902': {
    serialNumber: 'SN-9902', productName: 'GPS Tracker Standard',
    batchId: 'BATCH-001', mfgDate: '12 Jan 2026', status: 'SUSPICIOUS',
    currentHolder: 'Multiple Anomalous Locations Flagged', scanCount: 4,
    scans: [
      { date: '12 Jan 2026, 10:05 AM', event: 'Manufactured & Packaged',           location: 'Assembly Unit 1, Guwahati', device: 'Factory Scanner #04',    status: 'VALID'      },
      { date: '15 Jan 2026, 02:30 PM', event: 'Dispatched to Distributor',         location: 'Central Warehouse',         device: 'Handheld PDA #12',        status: 'VALID'      },
      { date: '20 Jan 2026, 04:10 PM', event: 'Scanned at Outlet A',               location: 'Guwahati Retail',           device: 'POS Terminal 1',          status: 'VALID'      },
      { date: '20 Jan 2026, 04:12 PM', event: 'Scanned at Outlet B (Duplicate)',   location: 'Mumbai Retail (Flagged)',   device: 'Unknown Mobile Scanner',  status: 'SUSPICIOUS' }
    ]
  },
  'SN-9903': {
    serialNumber: 'SN-9903', productName: 'Fuel Sensor V2',
    batchId: 'BATCH-002', mfgDate: '01 Feb 2026', status: 'VOID',
    currentHolder: 'Returned / Deactivated', scanCount: 3,
    scans: [
      { date: '01 Feb 2026, 09:00 AM', event: 'Manufactured & Packaged',      location: 'Assembly Unit 2, Tezpur', device: 'Factory Scanner #01', status: 'VALID' },
      { date: '05 Feb 2026, 01:20 PM', event: 'Dispatched',                   location: 'Warehouse A',             device: 'Handheld PDA #08',    status: 'VALID' },
      { date: '10 Feb 2026, 11:00 AM', event: 'Marked Void (Damaged Return)', location: 'Quality Check Center',    device: 'Admin Console',       status: 'VOID'  }
    ]
  }
};

// ─────────────────────────────────────────────────────────────
// Map Globals & Controls
// ─────────────────────────────────────────────────────────────
let map, activeTileLayer;
const markers = {};
let liveAnimInterval  = null;
let selectedVehicleId = null;

let modalMap          = null;
let modalPolyline     = null;
let truckMarker       = null;
let destinationMarker = null;
let checkpointMarkers = [];
let animationFrameId  = null;
let currentProgress   = 0;
let isPlaying         = false;
let lastTimestamp     = 0;
let activeRoute       = null;

const googleStreetTiles = L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
  maxZoom: 20, subdomains: ['mt0','mt1','mt2','mt3']
});
const googleSatTiles = L.tileLayer('https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
  maxZoom: 20, subdomains: ['mt0','mt1','mt2','mt3']
});

function initMap() {
  if (map) return; // Guard against multiple initializations
  
  map = L.map('map', { attributionControl: false }).setView([22.5, 82.5], 5);
  activeTileLayer = googleStreetTiles.addTo(map);
  updateTabCounts();
  renderVehicleList(vehiclesData);
  plotMarkers(vehiclesData);
  startSlowVehicleMovement();
  setupSearchListener();

  vehiclesData.filter(v => v.status === 'running').forEach(v => {
    ensureVehicleRoute(v).catch(() => {});
  });
}

function updateTabCounts() {
  const c = {
    all:      vehiclesData.length,
    running:  vehiclesData.filter(v => v.status === 'running').length,
    stopped:  vehiclesData.filter(v => v.status === 'stopped').length,
    nosignal: vehiclesData.filter(v => v.status === 'nosignal').length
  };
  document.getElementById('tab-all').innerText      = `All(${c.all})`;
  document.getElementById('tab-running').innerText  = `Running(${c.running})`;
  document.getElementById('tab-stopped').innerText  = `Stopped(${c.stopped})`;
  document.getElementById('tab-nosignal').innerText = `No Signal(${c.nosignal})`;
}

function getMarkerIcon(status) {
  if (status === 'running') {
    const svg = `<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"
        style="filter:drop-shadow(0 2px 5px rgba(0,0,0,.3))">
      <rect width="36" height="36" rx="8" fill="#16a34a"/>
      <path d="M8 12H20V22H8V12Z" fill="white" opacity=".9"/>
      <path d="M20 15H25L28 18V22H20V15Z" fill="white"/>
      <circle cx="12" cy="23" r="2.5" fill="#1e293b"/>
      <circle cx="24" cy="23" r="2.5" fill="#1e293b"/>
    </svg>`;
    return L.divIcon({ html: svg, className: 'custom-map-pin', iconSize: [36,36], iconAnchor: [18,18] });
  }
  const color = status === 'stopped' ? '#ef4444' : '#64748b';
  const svg = `<svg width="30" height="40" viewBox="0 0 38 48" fill="none" xmlns="http://www.w3.org/2000/svg"
      style="filter:drop-shadow(0 2px 4px rgba(0,0,0,.3))">
    <path d="M19 0C8.5 0 0 8.5 0 19C0 33.25 19 48 19 48C19 48 38 33.25 38 19C38 8.5 29.5 0 19 0Z"
          fill="${color}" stroke="#FFF" stroke-width="2"/>
    <circle cx="19" cy="19" r="6" fill="#FFF"/>
  </svg>`;
  return L.divIcon({ html: svg, className: 'custom-map-pin', iconSize: [30,40], iconAnchor: [15,40] });
}

function getCheckpointIcon() {
  const html = `<div class="cp-blink-wrap">
    <div class="cp-ring"></div><div class="cp-ring"></div>
    <div class="cp-dot"></div>
  </div>`;
  return L.divIcon({ html, className: 'custom-checkpoint-pin', iconSize: [20,20], iconAnchor: [10,10] });
}

function getDestinationIcon() {
  const html = `<div class="dest-blink-wrap">
    <div class="dest-ring"></div><div class="dest-ring"></div>
    <div class="dest-dot"></div>
  </div>`;
  return L.divIcon({ html, className: 'custom-destination-pin', iconSize: [26,26], iconAnchor: [13,13] });
}

function plotMarkers(data) {
  Object.values(markers).forEach(m => map.removeLayer(m));
  data.forEach(item => {
    const marker = L.marker(item.coords, { icon: getMarkerIcon(item.status) }).addTo(map);
    marker.on('click', () => selectVehicle(item.id));
    markers[item.id] = marker;
  });
}

function renderVehicleList(data) {
  const container = document.getElementById('vehicle-list');
  container.innerHTML = data.map(item => {
    let badge = `<span class="badge-speed">${item.speed}</span>`;
    if (item.status === 'stopped')  badge = `<span class="badge-stopped">Stopped</span>`;
    if (item.status === 'nosignal') badge = `<span class="badge-nosignal">No Signal</span>`;
    return `
      <div class="vehicle-card" id="card-${item.id}" onclick="selectVehicle('${item.id}')">
        <div class="card-head">
          <div class="vehicle-no">${badge} <strong style="margin-left:6px">${item.id}</strong></div>
        </div>
        <div class="location-text">${item.location}</div>
        <div class="time-info">${item.info}</div>
      </div>`;
  }).join('');
}

function selectVehicle(id) {
  selectedVehicleId = id;
  const v = vehiclesData.find(x => x.id === id);
  if (!v) return;

  document.querySelectorAll('.vehicle-card').forEach(el => el.classList.remove('selected'));
  const card = document.getElementById(`card-${id}`);
  if (card) card.classList.add('selected');

  map.setView(v.coords, 13);

  document.getElementById('no-signal-alert').style.display = v.status === 'nosignal' ? 'block' : 'none';
  document.getElementById('drawer-vehicle-id').innerText    = `Vehicle: ${v.id}`;
  document.getElementById('drawer-distance').innerText      = v.distance;
  document.getElementById('drawer-status-sub').innerText    = `Status: ${v.status.toUpperCase()}`;
  document.getElementById('drawer-stops-count').innerText   = `${v.stopsCount} stops`;
  document.getElementById('drawer-stop-time').innerText     = `(${v.stopDuration})`;
  document.getElementById('drawer-stop-duration').innerText = v.stopDuration;
  document.getElementById('drawer-address').innerText       = v.location;
  document.getElementById('drawer-last-updated').innerText  = `Last update: ${v.lastUpdated}`;

  toggleDrawer(true);
  document.getElementById('btn-play-route').classList.add('visible');
}

function filterVehicles(type, element) {
  document.querySelectorAll('.pill').forEach(el => el.classList.remove('active'));
  element.classList.add('active');
  const filtered = type === 'all' ? vehiclesData : vehiclesData.filter(v => v.status === type);
  renderVehicleList(filtered);
  plotMarkers(filtered);
}

function toggleDrawer(open) {
  const drawer = document.getElementById('history-drawer');
  const start  = performance.now();
  open ? drawer.classList.add('open') : drawer.classList.remove('open');
  if (!open) document.getElementById('btn-play-route').classList.remove('visible');
  function step(now) {
    if (map) map.invalidateSize();
    if (now - start < 400) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function startSlowVehicleMovement() {
  if (liveAnimInterval) clearInterval(liveAnimInterval);
  let prog = 0;
  liveAnimInterval = setInterval(() => {
    prog = (prog + 0.0004) % 1;
    vehiclesData.filter(v => v.status === 'running').forEach(vehicle => {
      const path = vehicle._cachedPath;
      if (!path || path.length < 2) return;
      const idx = Math.floor(prog * (path.length - 1));
      vehicle.coords = path[idx];
      if (markers[vehicle.id]) markers[vehicle.id].setLatLng(vehicle.coords);
    });
  }, 100);
}

function openPlayRouteModal() {
  if (!selectedVehicleId) return;
  const vehicle = vehiclesData.find(v => v.id === selectedVehicleId);
  if (!vehicle) return;

  document.getElementById('modal-route-title').innerText = `Route Playback – ${vehicle.id}`;
  document.getElementById('play-route-modal').classList.add('open');
  currentProgress = 0;
  activeRoute     = null;

  const btn = document.getElementById('btn-video-play');
  btn.innerText = '⏳';
  btn.disabled  = true;

  ensureVehicleRoute(vehicle).then(route => {
    activeRoute = route;
    const path  = route.path;

    const truckSvg = `<svg width="34" height="34" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"
        style="filter:drop-shadow(0 2px 4px rgba(0,0,0,.4))">
      <rect width="36" height="36" rx="8" fill="#2563eb"/>
      <path d="M8 12H20V22H8V12Z" fill="white" opacity=".9"/>
      <path d="M20 15H25L28 18V22H20V15Z" fill="white"/>
      <circle cx="12" cy="23" r="2.5" fill="#1e293b"/>
      <circle cx="24" cy="23" r="2.5" fill="#1e293b"/>
    </svg>`;
    const truckIcon = L.divIcon({ html: truckSvg, className: 'custom-route-pin', iconSize: [34,34], iconAnchor: [17,17] });

    if (!modalMap) {
      modalMap = L.map('modal-map', { attributionControl: false }).setView(path[0], 13);
      L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20, subdomains: ['mt0','mt1','mt2','mt3']
      }).addTo(modalMap);
      modalPolyline = L.polyline(path, { color: '#2563eb', weight: 5, opacity: 0.85, smoothFactor: 1 }).addTo(modalMap);
      truckMarker   = L.marker(path[0], { icon: truckIcon, zIndexOffset: 1000 }).addTo(modalMap);
    } else {
      modalPolyline.setLatLngs(path);
      truckMarker.setIcon(truckIcon);
      truckMarker.setLatLng(path[0]);
      modalMap.setView(path[0], 13);
    }

    modalMap.fitBounds(L.polyline(path).getBounds(), { padding: [30, 30] });

    checkpointMarkers.forEach(m => modalMap.removeLayer(m));
    checkpointMarkers = [];
    if (destinationMarker) { modalMap.removeLayer(destinationMarker); destinationMarker = null; }

    if (vehicle.checkpoints) {
      vehicle.checkpoints.forEach((cp, i) => {
        const wpIdx = Math.min(i + 1, vehicle.waypoints.length - 2);
        const coords = vehicle.waypoints[wpIdx];
        const m = L.marker(coords, { icon: getCheckpointIcon(), zIndexOffset: 500 }).addTo(modalMap);
        m.bindTooltip(
          `<b>${cp.title}</b>${cp.time ? `<br>🕐 ${cp.time}` : ''}`,
          { permanent: false, direction: 'top', className: 'cp-tooltip' }
        );
        checkpointMarkers.push(m);
      });
    }

    if (vehicle.destination) {
      const destCoords = vehicle.waypoints[vehicle.waypoints.length - 1];
      destinationMarker = L.marker(destCoords, {
        icon: getDestinationIcon(), zIndexOffset: 800
      }).addTo(modalMap);
      destinationMarker.bindTooltip(
        `<b>🏁 ${vehicle.destination.title}</b>`,
        { permanent: false, direction: 'top', className: 'cp-tooltip' }
      );
    }

    updatePlaybackPosition(0);
    btn.innerText = '▶';
    btn.disabled  = false;
    setTimeout(() => { if (modalMap) modalMap.invalidateSize(); }, 200);
  });
}

function closePlayRouteModal() {
  document.getElementById('play-route-modal').classList.remove('open');
  if (isPlaying) {
    isPlaying = false;
    cancelAnimationFrame(animationFrameId);
    document.getElementById('btn-video-play').innerText = '▶';
  }
}

function toggleRoutePlayback() {
  const btn = document.getElementById('btn-video-play');
  if (btn.disabled) return;
  if (isPlaying) {
    isPlaying = false;
    cancelAnimationFrame(animationFrameId);
    btn.innerText = '▶';
  } else {
    if (currentProgress >= 1) currentProgress = 0;
    isPlaying     = true;
    btn.innerText = '⏸';
    lastTimestamp = performance.now();
    animationFrameId = requestAnimationFrame(animateRouteFrame);
  }
}

function animateRouteFrame(timestamp) {
  if (!isPlaying) return;
  const delta = (timestamp - lastTimestamp) / 1000;
  lastTimestamp = timestamp;
  currentProgress += delta / 35;

  if (currentProgress >= 1) {
    currentProgress = 1;
    isPlaying = false;
    document.getElementById('btn-video-play').innerText = '▶';
    updatePlaybackPosition(1);
    return;
  }
  updatePlaybackPosition(currentProgress);
  animationFrameId = requestAnimationFrame(animateRouteFrame);
}

function updatePlaybackPosition(progressRatio) {
  if (!activeRoute) return;
  const vehicle  = vehiclesData.find(v => v.id === selectedVehicleId);
  const path     = activeRoute.path;
  const jumps    = activeRoute.jumpPathIndices || [];

  const easedRatio  = easeInOutQuad(progressRatio);
  const totalSeg    = path.length - 1;
  const globalIndex = easedRatio * totalSeg;
  const index       = Math.floor(globalIndex);
  const sub         = globalIndex - index;

  let coords = path[path.length - 1];
  if (index < totalSeg) {
    const p1 = path[index];
    const p2 = path[index + 1];
    coords   = [p1[0] + (p2[0] - p1[0]) * sub, p1[1] + (p2[1] - p1[1]) * sub];
  }

  truckMarker.setLatLng(coords);

  const nearJump = jumps.some(ji => Math.abs(index - ji) < 4);
  if (nearJump) {
    modalMap.setView(coords, modalMap.getZoom(), { animate: false });
  } else {
    modalMap.panTo(coords, { animate: true, duration: 0.4, easeLinearity: 0.4 });
  }

  document.getElementById('route-progress').style.width = `${progressRatio * 100}%`;
  const spd = vehicle && vehicle.status === 'running'
    ? `${Math.max(20, Math.floor(parseFloat(vehicle.speed) + Math.sin(progressRatio * Math.PI * 4) * 10))} km/h`
    : '0 km/h';
  document.getElementById('tooltip-speed').innerText = spd;
}

function seekRoute(event) {
  const rect      = event.currentTarget.getBoundingClientRect();
  currentProgress = (event.clientX - rect.left) / rect.width;
  if (activeRoute) updatePlaybackPosition(currentProgress);
}

function switchMainTab(tabName, element) {
  document.querySelectorAll('.icon-sidebar .nav-tab').forEach(el => el.classList.remove('active'));
  element.classList.add('active');
  document.querySelectorAll('.main-view').forEach(v => v.classList.remove('active-view'));

  if (tabName === 'dashboard') {
    document.getElementById('view-dashboard').classList.add('active-view');
    if (map) map.invalidateSize();
  } else if (tabName === 'penetration') {
    document.getElementById('view-penetration').classList.add('active-view');
    initPenetrationView();
  } else if (tabName === 'serial') {
    document.getElementById('view-serial').classList.add('active-view');
  }
}

function initPenetrationView() {
  const sel = document.getElementById('batch-selector');
  sel.innerHTML = batchData.map(b => `<option value="${b.batchId}">${b.batchId} - ${b.productName}</option>`).join('');
  renderPenetrationData(batchData[0].batchId);
}

function renderPenetrationData(batchId) {
  const batch = batchData.find(b => b.batchId === batchId);
  if (!batch) return;
  const reached = batch.channels.filter(c => c.isDistributed).reduce((s,c) => s + c.qty, 0);
  const rate    = ((reached / batch.totalProduced) * 100).toFixed(2);
  document.getElementById('val-produced').innerText   = batch.totalProduced.toLocaleString();
  document.getElementById('val-reached').innerText    = reached.toLocaleString();
  document.getElementById('val-rate').innerText       = `${rate}%`;
  document.getElementById('pen-progress').style.width = `${rate}%`;
  document.getElementById('pen-table-body').innerHTML = batch.channels.map(c => `
    <tr>
      <td><strong>${c.name}</strong></td>
      <td>${c.qty.toLocaleString()} units</td>
      <td><span class="status-pill ${c.isDistributed ? 'distributed' : 'warehouse'}">${c.isDistributed ? 'In Market' : 'In Warehouse'}</span></td>
      <td>${((c.qty / batch.totalProduced) * 100).toFixed(1)}%</td>
    </tr>`).join('');
}

function quickSearch(sn) {
  document.getElementById('serial-search-input').value = sn;
  searchSerial();
}

function searchSerial() {
  const query   = document.getElementById('serial-search-input').value.trim();
  const wrapper = document.getElementById('serial-result-wrapper');
  if (!query || !serialDatabase[query]) {
    alert('Serial Number not found. Try SN-9901, SN-9902, or SN-9903');
    wrapper.style.display = 'none';
    return;
  }
  const data   = serialDatabase[query];
  wrapper.style.display = 'block';
  const banner = document.getElementById('status-banner');
  if (data.status === 'ACTIVE') {
    banner.className = 'serial-status-banner status-ok';
    banner.innerHTML = `✅ <strong>Serial Valid</strong> - Genuine product active in market.`;
  } else if (data.status === 'SUSPICIOUS') {
    banner.className = 'serial-status-banner status-alert';
    banner.innerHTML = `⚠️ <strong>Security Alert: Suspicious Activity</strong> - Scanned at multiple distant locations simultaneously.`;
  } else {
    banner.className = 'serial-status-banner status-void';
    banner.innerHTML = `🚫 <strong>Serial Void</strong> - Product marked void or returned.`;
  }
  document.getElementById('st-product-name').innerText   = data.productName;
  document.getElementById('st-mfg-date').innerText       = `Date: ${data.mfgDate}`;
  document.getElementById('st-batch-id').innerText       = `Batch: ${data.batchId}`;
  document.getElementById('st-current-holder').innerText = data.currentHolder;
  document.getElementById('st-scans').innerText          = `Total Scans: ${data.scanCount} times`;
  document.getElementById('st-timeline-body').innerHTML  = data.scans.map(s => `
    <tr class="${s.status === 'SUSPICIOUS' ? 'suspicious-row' : ''}">
      <td>${s.date}</td><td><strong>${s.event}</strong></td>
      <td>${s.location}</td><td>${s.device}</td>
      <td><span class="status-pill ${s.status === 'VALID' ? 'distributed' : (s.status === 'SUSPICIOUS' ? 'danger-pill' : 'warehouse')}">${s.status}</span></td>
    </tr>`).join('');
}

function setupSearchListener() {
  document.getElementById('vehicle-search-input').addEventListener('input', e => {
    const term     = e.target.value.toLowerCase().trim();
    const filtered = vehiclesData.filter(v =>
      v.id.toLowerCase().includes(term) || v.location.toLowerCase().includes(term));
    renderVehicleList(filtered);
    plotMarkers(filtered);
  });
}

function setTileType(type) {
  document.getElementById('btn-map').classList.remove('active');
  document.getElementById('btn-sat').classList.remove('active');
  map.removeLayer(activeTileLayer);
  if (type === 'satellite') {
    activeTileLayer = googleSatTiles.addTo(map);
    document.getElementById('btn-sat').classList.add('active');
  } else {
    activeTileLayer = googleStreetTiles.addTo(map);
    document.getElementById('btn-map').classList.add('active');
  }
}

function zoomMap(delta) { map.setZoom(map.getZoom() + delta); }
function toggleFullscreen() {
  document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
}