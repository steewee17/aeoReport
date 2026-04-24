(function () {
'use strict';

var WEBHOOK = 'https://steewee.app.n8n.cloud/webhook/leanAgent';
var TENANT  = 'dolomit-tirol';
var BASE    = 'https://aeo-report.com/dolomit/';
var sessionId = uid();
var loading   = false;
var chatOpen  = false;

function init() {
  injectFont();
  injectCSS();
  injectHTML();
  bindEvents();
}

function injectFont() {
  if (document.querySelector('link[data-dlm-font]')) return;
  var l = document.createElement('link');
  l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Alegreya+Sans:wght@400;500;700&display=swap';
  l.setAttribute('data-dlm-font', '1');
  document.head.appendChild(l);
}

function injectCSS() {
  if (document.querySelector('link[data-dlm-css]')) return;
  var l = document.createElement('link');
  l.rel = 'stylesheet';
  l.href = BASE + 'widget.v11.css';
  l.setAttribute('data-dlm-css', '1');
  document.head.appendChild(l);
}

var AVG = '<svg width="28" height="28" viewBox="0 0 100 100"><defs><clipPath id="dlmc"><circle cx="50" cy="50" r="50"/></clipPath></defs><g clip-path="url(#dlmc)"><rect width="100" height="100" fill="#ae4341"/><path d="M46,19 L59,19 L59,73 L23,73 A26,26 0 0 1 23,37 L46,37 Z" fill="white"/><rect x="29" y="48" width="17" height="14" fill="#ae4341"/><rect x="71" y="59" width="12" height="13" fill="white"/><rect x="15" y="81" width="68" height="3" fill="white" rx="1"/></g></svg>';

function injectHTML() {
  if (document.getElementById('dlm-root')) return;
  var r = document.createElement('div');
  r.id = 'dlm-root';
  r.innerHTML =
    '<div id="dlm-chat">' +
      '<div class="dlm-header">' +
        '<div class="dlm-header-text">' +
          '<div class="dlm-header-title">Dolomit Assistent</div>' +
          '<div class="dlm-header-sub">Speicher\u00f6fen aus Tirol \u00b7 Steinringer Ofenbau</div>' +
        '</div>' +
        '<button class="dlm-header-close" id="dlm-close">\u00d7</button>' +
      '</div>' +
      '<div id="dlm-messages">' +
        '<div class="dlm-row-bot"><div class="dlm-avatar">' + AVG + '</div>' +
        '<div class="dlm-bubble-bot">Servus! Wie kann ich dir helfen?</div></div>' +
      '</div>' +
      '<div class="dlm-input-area">' +
        '<div class="dlm-input-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>' +
        '<input type="text" id="dlm-input" placeholder="Nachricht" autocomplete="off"/>' +
        '<button class="dlm-btn-reset" id="dlm-reset"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.91"/></svg></button>' +
        '<button class="dlm-btn-send" id="dlm-send"><svg viewBox="0 0 24 24" fill="white"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/></svg></button>' +
      '</div>' +
      '<div class="dlm-footer">I speak your language \u00b7 <a href="https://www.kleinkachelofen.net" target="_blank" rel="noopener">dolomit.tirol</a></div>' +
    '</div>' +
    '<div class="dlm-trigger-wrap">' +
      '<button class="dlm-trigger-close" id="dlm-tclose">\u00d7</button>' +
      '<div class="dlm-pill" id="dlm-pill">Servus, wie kann ich dir helfen?</div>' +
    '</div>';
  document.body.appendChild(r);
}

function bindEvents() {
  document.getElementById('dlm-pill').addEventListener('click', toggleChat);
  document.getElementById('dlm-close').addEventListener('click', toggleChat);
  document.getElementById('dlm-tclose').addEventListener('click', toggleChat);
  document.getElementById('dlm-send').addEventListener('click', sendMessage);
  document.getElementById('dlm-reset').addEventListener('click', resetSession);
  document.getElementById('dlm-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });
}

function toggleChat() {
  chatOpen = !chatOpen;
  document.getElementById('dlm-chat').classList.toggle('dlm-open', chatOpen);
  document.getElementById('dlm-tclose').classList.toggle('dlm-visible', chatOpen);
  document.getElementById('dlm-pill').style.opacity = chatOpen ? '0.5' : '1';
  document.getElementById('dlm-pill').style.pointerEvents = chatOpen ? 'none' : 'all';
  if (chatOpen) setTimeout(function() { document.getElementById('dlm-input').focus(); }, 260);
}

function resetSession() {
  sessionId = uid();
  document.getElementById('dlm-messages').innerHTML =
    '<div class="dlm-system">Neue Unterhaltung</div>' +
    '<div class="dlm-row-bot"><div class="dlm-avatar">' + AVG + '</div>' +
    '<div class="dlm-bubble-bot">Servus! Wie kann ich dir helfen?</div></div>';
}

function sendMessage() {
  var inp = document.getElementById('dlm-input');
  var msg = inp.value.trim();
  if (!msg || loading) return;
  inp.value = ''; loading = true;
  document.getElementById('dlm-send').disabled = true;
  addUser(msg);
  var tid = addTyping();
  fetch(WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, tenant_id: TENANT, message: msg })
  })
  .then(function(r) {
    removeTyping(tid);
    if (!r.ok) { addSystem('Fehler ' + r.status); return; }
    return r.json().then(function(d) {
      addBot(d.message || (d[0] && d[0].message) || '', d.cta || (d[0] && d[0].cta) || null);
    });
  })
  .catch(function() { removeTyping(tid); addSystem('Verbindungsfehler'); })
  .finally(function() {
    loading = false;
    document.getElementById('dlm-send').disabled = false;
    document.getElementById('dlm-input').focus();
  });
}

function addUser(t) {
  var m = document.getElementById('dlm-messages'), d = document.createElement('div');
  d.className = 'dlm-row-user';
  d.innerHTML = '<div class="dlm-bubble-user">' + esc(t) + '</div>';
  m.appendChild(d); scrollB();
}
function addBot(t, cta) {
  var m = document.getElementById('dlm-messages'), d = document.createElement('div');
  d.className = 'dlm-row-bot';
  var c = cta ? '<a class="dlm-cta" href="' + esc(cta.url) + '" target="_blank" rel="noopener">' + esc(cta.label) + '</a>' : '';
  d.innerHTML = '<div class="dlm-avatar">' + AVG + '</div><div><div class="dlm-bubble-bot">' + linkify(esc(t)) + '</div>' + c + '</div>';
  m.appendChild(d); scrollB();
}
function addTyping() {
  var m = document.getElementById('dlm-messages'), id = 'dlmt' + Date.now(), d = document.createElement('div');
  d.className = 'dlm-row-bot'; d.id = id;
  d.innerHTML = '<div class="dlm-avatar">' + AVG + '</div><div class="dlm-bubble-bot"><div class="dlm-dots"><span></span><span></span><span></span></div></div>';
  m.appendChild(d); scrollB(); return id;
}
function removeTyping(id) { var e = document.getElementById(id); if (e) e.remove(); }
function addSystem(t) {
  var m = document.getElementById('dlm-messages'), d = document.createElement('div');
  d.className = 'dlm-system'; d.textContent = t; m.appendChild(d); scrollB();
}
function scrollB() { var m = document.getElementById('dlm-messages'); if (m) m.scrollTop = m.scrollHeight; }
function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>'); }
function linkify(s) { return s.replace(/(https?:\/\/[^\s&<]+)/g,'<a href="$1" target="_blank" rel="noopener" style="color:#ae4341">$1</a>'); }
function uid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else { init(); }

})();
