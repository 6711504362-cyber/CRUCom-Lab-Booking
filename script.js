// ===================== STATE =====================
let currentPage = 'login';
let currentUser = null;
let currentDashTab = 'resources';
let calendarDate = new Date();
let selectedDate = null;
let selectedTimeSlot = null;
let bookingTarget = null;
let bookings = [];
let pendingDeleteId = null;

const resources = [
  { id: 'r1', name: 'mBot2', emoji: '🤖', desc: 'หุ่นยนต์เรียนรู้ AI', category: 'robot', available: true },
  { id: 'r2', name: 'CyberPi', emoji: '🎮', desc: 'บอร์ดเรียนรู้ IoT', category: 'board', available: true },
  { id: 'r3', name: 'Micro:bit V2', emoji: '💡', desc: 'ไมโครคอนโทรลเลอร์', category: 'board', available: false },
  { id: 'r4', name: 'Arduino Uno', emoji: '⚡', desc: 'บอร์ดพัฒนา', category: 'board', available: true },
  { id: 'r5', name: 'Raspberry Pi 4', emoji: '🍓', desc: 'มินิคอมพิวเตอร์', category: 'computer', available: true },
  { id: 'r6', name: '3D Printer', emoji: '🖨️', desc: 'เครื่องพิมพ์ 3 มิติ', category: 'tool', available: false },
];

const rooms = [
  { id: 'rm1', name: 'ห้อง Lab A101', emoji: '🧪', desc: 'ห้องปฏิบัติการ 30 ที่นั่ง', capacity: 30, available: true },
  { id: 'rm2', name: 'ห้อง Smart B202', emoji: '📡', desc: 'ห้อง IoT Lab 20 ที่นั่ง', capacity: 20, available: true },
  { id: 'rm3', name: 'ห้อง Meeting C303', emoji: '💬', desc: 'ห้องประชุม 10 ที่นั่ง', capacity: 10, available: false },
  { id: 'rm4', name: 'ห้อง Workshop D404', emoji: '🔧', desc: 'ห้อง Maker Space 25 ที่นั่ง', capacity: 25, available: true },
];

const timeSlots = [
  '08:00-09:00', '09:00-10:00', '10:00-11:00',
  '11:00-12:00', '13:00-14:00', '14:00-15:00',
  '15:00-16:00', '16:00-17:00', '17:00-18:00'
];

// ===================== CONFIG =====================
const defaultConfig = {
  app_title: 'Smart Resource Booking',
  welcome_text: 'Welcome Back, Dreamer',
  dashboard_title: 'Resource Dashboard',
  background_color: '#fef9ef',
  surface_color: '#ffffff',
  text_color: '#1f2937',
  primary_action_color: '#f59e0b',
  secondary_action_color: '#a78bfa',
  font_family: 'Quicksand',
  font_size: 14
};

function applyConfig(config) {
  const title = config.app_title || defaultConfig.app_title;
  const welcome = config.welcome_text || defaultConfig.welcome_text;
  const dashTitle = config.dashboard_title || defaultConfig.dashboard_title;
  const bg = config.background_color || defaultConfig.background_color;
  const surface = config.surface_color || defaultConfig.surface_color;
  const text = config.text_color || defaultConfig.text_color;
  const primary = config.primary_action_color || defaultConfig.primary_action_color;
  const secondary = config.secondary_action_color || defaultConfig.secondary_action_color;
  const font = config.font_family || defaultConfig.font_family;
  const fontSize = config.font_size || defaultConfig.font_size;

  const el = (id) => document.getElementById(id);
  const loginTitle = el('login-title');
  if (loginTitle) loginTitle.textContent = title;
  const loginWelcome = el('login-welcome');
  if (loginWelcome) loginWelcome.textContent = welcome + ' ✨';
  const navTitle = el('nav-title');
  if (navTitle) navTitle.textContent = title;

  const app = el('app');
  if (app) {
    app.style.background = `linear-gradient(135deg, ${bg} 0%, #f5f0ff 30%, ${bg} 60%, #eef2ff 100%)`;
    app.style.fontFamily = `${font}, 'Noto Sans Thai', sans-serif`;
    app.style.fontSize = `${fontSize}px`;
    app.style.color = text;
  }

  document.querySelectorAll('.btn-golden').forEach(btn => {
    btn.style.background = `linear-gradient(135deg, ${primary} 0%, ${primary}cc 50%, ${primary} 100%)`;
  });

  document.querySelectorAll('.glass-card').forEach(card => {
    card.style.background = `rgba(${hexToRgb(surface)}, 0.72)`;
  });

  document.querySelectorAll('h1, h2, h3').forEach(h => {
    h.style.color = text;
  });

  document.querySelectorAll('h1').forEach(h => {
    h.style.fontSize = `${fontSize * 1.7}px`;
  });
  document.querySelectorAll('h2').forEach(h => {
    h.style.fontSize = `${fontSize * 1.4}px`;
  });
  document.querySelectorAll('h3').forEach(h => {
    h.style.fontSize = `${fontSize * 1.15}px`;
  });
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

// ===================== ELEMENT SDK =====================
if (window.elementSdk) {
  window.elementSdk.init({
    defaultConfig,
    onConfigChange: async (config) => {
      applyConfig(config);
    },
    mapToCapabilities: (config) => ({
      recolorables: [
        { get: () => config.background_color || defaultConfig.background_color, set: (v) => { config.background_color = v; window.elementSdk.setConfig({ background_color: v }); } },
        { get: () => config.surface_color || defaultConfig.surface_color, set: (v) => { config.surface_color = v; window.elementSdk.setConfig({ surface_color: v }); } },
        { get: () => config.text_color || defaultConfig.text_color, set: (v) => { config.text_color = v; window.elementSdk.setConfig({ text_color: v }); } },
        { get: () => config.primary_action_color || defaultConfig.primary_action_color, set: (v) => { config.primary_action_color = v; window.elementSdk.setConfig({ primary_action_color: v }); } },
        { get: () => config.secondary_action_color || defaultConfig.secondary_action_color, set: (v) => { config.secondary_action_color = v; window.elementSdk.setConfig({ secondary_action_color: v }); } },
      ],
      borderables: [],
      fontEditable: {
        get: () => config.font_family || defaultConfig.font_family,
        set: (v) => { config.font_family = v; window.elementSdk.setConfig({ font_family: v }); }
      },
      fontSizeable: {
        get: () => config.font_size || defaultConfig.font_size,
        set: (v) => { config.font_size = v; window.elementSdk.setConfig({ font_size: v }); }
      }
    }),
    mapToEditPanelValues: (config) => new Map([
      ['app_title', config.app_title || defaultConfig.app_title],
      ['welcome_text', config.welcome_text || defaultConfig.welcome_text],
      ['dashboard_title', config.dashboard_title || defaultConfig.dashboard_title],
    ])
  });
}

// ===================== NAVIGATION =====================
function showPage(page) {
  currentPage = page;
  document.getElementById('page-login').style.display = page === 'login' ? 'flex' : 'none';
  document.getElementById('page-register').style.display = page === 'register' ? 'flex' : 'none';
  document.getElementById('page-dashboard').style.display = page === 'dashboard' ? 'block' : 'none';
  if (page === 'dashboard') {
    renderResources();
    renderRooms();
    renderMyBookings();
  }
  lucide.createIcons();
}

function showDashTab(tab) {
  currentDashTab = tab;
  document.getElementById('tab-resources').style.display = tab === 'resources' ? 'block' : 'none';
  document.getElementById('tab-rooms').style.display = tab === 'rooms' ? 'block' : 'none';
  document.getElementById('tab-mybookings').style.display = tab === 'mybookings' ? 'block' : 'none';

  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(el => {
    if (tab === 'resources' && el.textContent.includes('อุปกรณ์')) el.classList.add('active');
    if (tab === 'rooms' && el.textContent.includes('ห้อง')) el.classList.add('active');
    if (tab === 'mybookings' && (el.textContent.includes('การจอง') || el.textContent.includes('การจองของฉัน'))) el.classList.add('active');
  });

  if (tab === 'mybookings') renderMyBookings();
}

// ===================== TOAST =====================
function showToast(msg, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast-msg toast-${type}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.4s'; setTimeout(() => toast.remove(), 400); }, 3000);
}

// ===================== AUTH =====================
document.getElementById('btn-login').addEventListener('click', (e) => {
  e.preventDefault();
  const sid = document.getElementById('login-sid').value.trim();
  const pass = document.getElementById('login-pass').value.trim();
  if (!sid || !pass) { showToast('กรุณากรอกข้อมูลให้ครบ', 'error'); return; }
  currentUser = { sid, name: 'นักศึกษา ' + sid };
  showToast('เข้าสู่ระบบสำเร็จ! 🎉');
  showPage('dashboard');
});

document.getElementById('btn-register').addEventListener('click', (e) => {
  e.preventDefault();
  const sid = document.getElementById('reg-sid').value.trim();
  const name = document.getElementById('reg-name').value.trim();
  const major = document.getElementById('reg-major').value;
  const email = document.getElementById('reg-email').value.trim();
  const pass = document.getElementById('reg-pass').value.trim();
  if (!sid || !name || !major || !email || !pass) { showToast('กรุณากรอกข้อมูลให้ครบ', 'error'); return; }
  if (pass.length < 6) { showToast('รหัสผ่านต้องมีอย่างน้อย 6 ตัว', 'error'); return; }
  currentUser = { sid, name };
  showToast('ลงทะเบียนสำเร็จ! 🌟');
  showPage('dashboard');
});

document.getElementById('goto-register').addEventListener('click', () => showPage('register'));
document.getElementById('goto-login').addEventListener('click', () => showPage('login'));
document.getElementById('btn-logout').addEventListener('click', () => {
  currentUser = null;
  showPage('login');
  showToast('ออกจากระบบแล้ว');
});

// ===================== FILE UPLOAD =====================
document.getElementById('upload-zone').addEventListener('click', () => document.getElementById('file-upload').click());
document.getElementById('file-upload').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const fn = document.getElementById('upload-filename');
    fn.textContent = '📎 ' + file.name;
    fn.classList.remove('hidden');
  }
});

// ===================== RENDER RESOURCES =====================
function renderResources() {
  const grid = document.getElementById('resource-grid');
  grid.innerHTML = resources.map((r, i) => `
    <div class="resource-card rounded-2xl p-5 animate-fade-in-up delay-${Math.min(i + 1, 6)}" style="animation-fill-mode:forwards;">
      <div class="flex items-start justify-between mb-3">
        <span class="text-3xl">${r.emoji}</span>
        <div class="flex items-center gap-1.5 text-xs font-medium ${r.available ? 'text-green-600' : 'text-red-500'}">
          <span class="status-dot ${r.available ? 'status-available' : 'status-inuse'}"></span>
          ${r.available ? 'ว่าง' : 'ไม่ว่าง'}
        </div>
      </div>
      <h4 class="font-bold text-gray-800 mb-1">${r.name}</h4>
      <p class="text-xs text-gray-500 mb-4">${r.desc}</p>
      <button onclick="openBooking('resource','${r.id}')" class="${r.available ? 'btn-golden text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'} w-full py-2 rounded-xl text-xs font-semibold" ${!r.available ? 'disabled' : ''}>
        ${r.available ? '📅 จองเลย' : '⏳ ไม่ว่าง'}
      </button>
    </div>
  `).join('');
  lucide.createIcons();
}

function renderRooms() {
  const grid = document.getElementById('room-grid');
  grid.innerHTML = rooms.map((r, i) => `
    <div class="resource-card rounded-2xl p-5 animate-fade-in-up delay-${Math.min(i + 1, 6)}" style="animation-fill-mode:forwards;">
      <div class="flex items-start justify-between mb-3">
        <span class="text-3xl">${r.emoji}</span>
        <div class="flex items-center gap-1.5 text-xs font-medium ${r.available ? 'text-green-600' : 'text-red-500'}">
          <span class="status-dot ${r.available ? 'status-available' : 'status-inuse'}"></span>
          ${r.available ? 'ว่าง' : 'ไม่ว่าง'}
        </div>
      </div>
      <h4 class="font-bold text-gray-800 mb-1">${r.name}</h4>
      <p class="text-xs text-gray-500 mb-1">${r.desc}</p>
      <p class="text-xs text-amber-500 font-medium mb-4">👥 ${r.capacity} ที่นั่ง</p>
      <button onclick="openBooking('room','${r.id}')" class="${r.available ? 'btn-golden text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'} w-full py-2 rounded-xl text-xs font-semibold" ${!r.available ? 'disabled' : ''}>
        ${r.available ? '📅 จองเลย' : '⏳ ไม่ว่าง'}
      </button>
    </div>
  `).join('');
  lucide.createIcons();
}

// ===================== CALENDAR =====================
function renderCalendar() {
  const grid = document.getElementById('calendar-grid');
  const now = new Date();
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthNames = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
  document.getElementById('calendar-month').textContent = `${monthNames[month]} ${year + 543}`;

  let html = '';
  for (let i = 0; i < firstDay; i++) html += '<div class="py-2"></div>';
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isToday = d === now.getDate() && month === now.getMonth() && year === now.getFullYear();
    const isPast = new Date(year, month, d) < new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const isSelected = selectedDate === dateStr;
    let cls = 'calendar-cell py-2 rounded-lg cursor-pointer font-medium';
    if (isSelected) cls += ' selected';
    else if (isToday) cls += ' today';
    if (isPast) cls += ' text-gray-300 cursor-not-allowed';
    else cls += ' text-gray-700 hover:bg-amber-50';
    html += `<div class="${cls}" ${!isPast ? `onclick="selectDate('${dateStr}')"` : ''}>${d}</div>`;
  }
  grid.innerHTML = html;
}

function selectDate(dateStr) {
  selectedDate = dateStr;
  selectedTimeSlot = null;
  renderCalendar();
  renderTimeSlots();
  updateBookBtn();
}

function changeMonth(delta) {
  calendarDate.setMonth(calendarDate.getMonth() + delta);
  renderCalendar();
}

function renderTimeSlots() {
  const container = document.getElementById('time-slots');
  if (!selectedDate) {
    container.innerHTML = '<p class="col-span-3 text-center text-xs text-gray-400 py-3">กรุณาเลือกวันที่ก่อน</p>';
    return;
  }
  const bookedSlots = bookings.filter(b => b.date === selectedDate && b.targetId === bookingTarget?.id).map(b => b.timeSlot);
  container.innerHTML = timeSlots.map(ts => {
    const isBooked = bookedSlots.includes(ts);
    const isSelected = selectedTimeSlot === ts;
    let cls = 'time-slot py-2 px-1 rounded-xl border text-xs font-medium text-center';
    if (isBooked) cls += ' time-slot-booked';
    else if (isSelected) cls += ' time-slot-selected border-amber-400';
    else cls += ' border-gray-200 text-gray-600';
    return `<div class="${cls}" ${!isBooked ? `onclick="selectTime('${ts}')"` : ''}>${ts}${isBooked ? ' ❌' : ''}</div>`;
  }).join('');
}

function selectTime(ts) {
  selectedTimeSlot = ts;
  renderTimeSlots();
  updateBookBtn();
}

function updateBookBtn() {
  const btn = document.getElementById('btn-confirm-book');
  btn.disabled = !(selectedDate && selectedTimeSlot);
  btn.style.opacity = btn.disabled ? '0.5' : '1';
}

// ===================== BOOKING =====================
function openBooking(type, id) {
  const item = type === 'resource' ? resources.find(r => r.id === id) : rooms.find(r => r.id === id);
  if (!item || !item.available) return;
  bookingTarget = { ...item, type };
  selectedDate = null;
  selectedTimeSlot = null;
  calendarDate = new Date();

  document.getElementById('modal-title').textContent = `จอง ${item.name}`;
  document.getElementById('modal-subtitle').textContent = `${item.emoji} ${item.desc}`;
  document.getElementById('booking-modal').style.display = 'flex';

  renderCalendar();
  renderTimeSlots();
  updateBookBtn();
  lucide.createIcons();
}

function closeModal() {
  document.getElementById('booking-modal').style.display = 'none';
  bookingTarget = null;
}

function confirmBooking() {
  if (!bookingTarget || !selectedDate || !selectedTimeSlot) return;
  const newBooking = {
    id: 'bk_' + Date.now(),
    targetId: bookingTarget.id,
    targetName: bookingTarget.name,
    targetEmoji: bookingTarget.emoji,
    targetType: bookingTarget.type,
    date: selectedDate,
    timeSlot: selectedTimeSlot,
    bookedAt: new Date().toISOString()
  };
  bookings.push(newBooking);
  closeModal();
  showToast(`จอง ${newBooking.targetName} สำเร็จ! 🎉`);
  renderMyBookings();
}

// ===================== MY BOOKINGS =====================
function renderMyBookings() {
  const list = document.getElementById('my-bookings-list');
  if (bookings.length === 0) {
    list.innerHTML = `
      <div class="text-center py-12 text-gray-400 text-sm">
        <div class="text-4xl mb-3">📭</div>
        ยังไม่มีการจอง
      </div>`;
    return;
  }
  list.innerHTML = bookings.slice().reverse().map((b, i) => `
    <div class="resource-card rounded-2xl p-4 flex items-center justify-between animate-fade-in-up delay-${Math.min(i+1,3)}" style="animation-fill-mode:forwards;">
      <div class="flex items-center gap-3">
        <span class="text-2xl">${b.targetEmoji}</span>
        <div>
          <h4 class="font-bold text-gray-800 text-sm">${b.targetName}</h4>
          <p class="text-xs text-gray-500">${formatDate(b.date)} • ${b.timeSlot}</p>
        </div>
      </div>
      <button onclick="requestDelete('${b.id}')" class="p-2 rounded-xl hover:bg-red-50 transition text-red-400 hover:text-red-500">
        <i data-lucide="trash-2" class="w-4 h-4"></i>
      </button>
    </div>
  `).join('');
  lucide.createIcons();
}

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-');
  const monthNames = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  return `${parseInt(d)} ${monthNames[parseInt(m)-1]} ${parseInt(y)+543}`;
}

// ===================== DELETE =====================
function requestDelete(bookingId) {
  const b = bookings.find(x => x.id === bookingId);
  if (!b) return;
  pendingDeleteId = bookingId;
  document.getElementById('delete-confirm-text').textContent = `${b.targetName} - ${formatDate(b.date)} ${b.timeSlot}`;
  document.getElementById('delete-confirm').style.display = 'flex';
  lucide.createIcons();
}

function closeDeleteConfirm() {
  document.getElementById('delete-confirm').style.display = 'none';
  pendingDeleteId = null;
}

function executeDelete() {
  if (!pendingDeleteId) return;
  bookings = bookings.filter(b => b.id !== pendingDeleteId);
  closeDeleteConfirm();
  renderMyBookings();
  showToast('ยกเลิกการจองแล้ว');
}

// ===================== INIT =====================
lucide.createIcons();
showPage('login');
applyConfig(defaultConfig);
