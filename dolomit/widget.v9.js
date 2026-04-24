(function () {
'use strict';

var WEBHOOK = 'https://steewee.app.n8n.cloud/webhook/leanAgent';
var TENANT  = 'dolomit-tirol';
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
  if (document.querySelector('link[data-dlm]')) return;
  var l = document.createElement('link');
  l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Alegreya+Sans:wght@400;500;700&display=swap';
  l.setAttribute('data-dlm', '1');
  document.head.appendChild(l);
}

function injectCSS() {
  if (document.getElementById('dlm-css')) return;
  var s = document.createElement('style');
  s.id = 'dlm-css';
  s.textContent = `
    #dlm-root *, #dlm-root *::before, #dlm-root *::after {
      box-sizing: border-box; margin: 0; padding: 0;
    }
    #dlm-root {
      position: fixed; bottom: 20px; right: 20px; z-index: 2147483647;
      display: flex; flex-direction: column; align-items: flex-end;
      font-family: 'Alegreya Sans', sans-serif;
    }
    #dlm-chat {
      width: 370px; height: 580px; background: white;
      border-radius: 16px; overflow: hidden;
      box-shadow: 0 8px 32px rgba(0,0,0,0.18);
      display: flex; flex-direction: column;
      transform-origin: bottom right;
      transform: scale(0.9) translateY(10px); opacity: 0; pointer-events: none;
      transition: transform 0.22s cubic-bezier(.34,1.3,.64,1), opacity 0.18s ease;
      margin-bottom: 12px;
    }
    #dlm-chat.open {
      transform: scale(1) translateY(0); opacity: 1; pointer-events: all;
    }
    .dlm-header {
      background: #953937; padding: 12px 14px;
      display: flex; align-items: center; gap: 10px; flex-shrink: 0;
    }
    .dlm-header-text { flex: 1; min-width: 0; }
    .dlm-header-title {
      color: white; font-size: 15px; font-weight: 700; line-height: 1.2;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .dlm-header-sub {
      color: rgba(255,255,255,0.65); font-size: 12px; line-height: 1.3;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 1px;
    }
    .dlm-header-close {
      width: 26px; height: 26px; border-radius: 50%;
      background: rgba(255,255,255,0.18); border: none; cursor: pointer;
      color: white; font-size: 16px; line-height: 1;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; transition: background 0.15s;
    }
    .dlm-header-close:hover { background: rgba(255,255,255,0.3); }
    #dlm-messages {
      flex: 1; overflow-y: auto; padding: 14px 12px;
      display: flex; flex-direction: column; gap: 12px;
      background: white; scroll-behavior: smooth;
    }
    #dlm-messages::-webkit-scrollbar { width: 3px; }
    #dlm-messages::-webkit-scrollbar-thumb { background: #E3B5B5; border-radius: 2px; }
    .dlm-row-bot {
      display: flex; align-items: flex-end; gap: 8px;
      align-self: flex-start; max-width: 86%;
    }
    .dlm-avatar { width: 28px; height: 28px; flex-shrink: 0; margin-bottom: 2px; }
    .dlm-bubble-bot {
      background: white; color: #1a1a1a; border: 1px solid #F1DADA;
      border-radius: 14px 14px 14px 3px; padding: 10px 13px;
      font-size: 14px; font-family: 'Alegreya Sans', sans-serif;
      line-height: 1.55; word-break: break-word;
    }
    .dlm-bubble-bot a { color: #ae4341; text-decoration: underline; word-break: break-all; }
    .dlm-row-user { align-self: flex-end; max-width: 80%; }
    .dlm-bubble-user {
      background: #ae4341; color: white;
      border-radius: 14px 14px 3px 14px; padding: 10px 13px;
      font-size: 14px; font-family: 'Alegreya Sans', sans-serif;
      line-height: 1.55; word-break: break-word;
    }
    .dlm-system {
      align-self: center; background: #F8EDEC; color: #C86C6A;
      font-size: 11px; font-family: 'Alegreya Sans', sans-serif;
      padding: 4px 12px; border-radius: 20px;
    }
    .dlm-cta {
      display: inline-block; margin-top: 8px;
      background: #ae4341; color: white; text-decoration: none;
      padding: 7px 16px; border-radius: 20px;
      font-size: 13px; font-family: 'Alegreya Sans', sans-serif;
      font-weight: 500; transition: background 0.15s;
    }
    .dlm-cta:hover { background: #953937; }
    .dlm-dots { display: flex; gap: 4px; padding: 2px 0; }
    .dlm-dots span {
      width: 7px; height: 7px; background: #D6908F;
      border-radius: 50%; animation: dlmBounce 1.2s infinite;
    }
    .dlm-dots span:nth-child(2) { animation-delay: 0.2s; }
    .dlm-dots span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes dlmBounce {
      0%,60%,100% { transform: translateY(0); }
      30% { transform: translateY(-5px); }
    }
    .dlm-input-area {
      background: #F8EDEC; padding: 10px 12px;
      display: flex; align-items: center; gap: 8px;
      flex-shrink: 0; border-top: 1px solid #F1DADA;
    }
    .dlm-input-icon { color: #C86C6A; flex-shrink: 0; display: flex; align-items: center; }
    .dlm-input-icon svg { width: 16px; height: 16px; }
    #dlm-input {
      flex: 1; border: none; outline: none; background: transparent;
      font-size: 14px; font-family: 'Alegreya Sans', sans-serif;
      color: #1a1a1a; min-width: 0;
    }
    #dlm-input::placeholder { color: #D6908F; }
    .dlm-btn-reset {
      width: 28px; height: 28px; border: none; background: none;
      cursor: pointer; color: #D6908F;
      display: flex; align-items: center; justify-content: center;
      transition: color 0.15s; flex-shrink: 0;
    }
    .dlm-btn-reset:hover { color: #ae4341; }
    .dlm-btn-reset svg { width: 16px; height: 16px; }
    .dlm-btn-send {
      width: 32px; height: 32px; background: #ae4341;
      border: none; border-radius: 50%; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; transition: background 0.15s;
    }
    .dlm-btn-send:hover { background: #953937; }
    .dlm-btn-send:disabled { background: #E3B5B5; cursor: not-allowed; }
    .dlm-btn-send svg { width: 13px; height: 13px; }
    .dlm-footer {
      background: white; padding: 6px 14px 8px; text-align: center;
      font-size: 11px; font-family: 'Alegreya Sans', sans-serif;
      color: #D6908F; border-top: 1px solid #F8EDEC; flex-shrink: 0;
    }
    .dlm-footer a { color: #ae4341; text-decoration: underline; }
    .dlm-trigger-wrap {
      display: flex; flex-direction: column; align-items: flex-end; gap: 6px;
    }
    .dlm-trigger-close {
      width: 24px; height: 24px; background: white; border: none;
      border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      cursor: pointer; font-size: 13px; color: #666; line-height: 1;
      display: none; align-items: center; justify-content: center;
      align-self: flex-end; margin-right: 4px; transition: background 0.15s;
    }
    .dlm-trigger-close.visible { display: flex; }
    .dlm-trigger-close:hover { background: #f0f0f0; }
    .dlm-pill {
      background: #ae4341; color: white;
      font-family: 'Alegreya Sans', sans-serif;
      font-size: 14px; font-weight: 500;
      padding: 11px 20px; border-radius: 50px; cursor: pointer;
      box-shadow: 0 4px 16px rgba(174,67,65,0.4);
      white-space: nowrap; user-select: none;
      display: flex; align-items: center;
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .dlm-pill:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(174,67,65,0.45);
    }
    @media (max-width: 480px) {
      #dlm-chat {
        width: calc(100vw - 24px); height: calc(100dvh - 80px);
        border-radius: 12px;
      }
    }
  `;
  document.head.appendChild(s);
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
        '<div class="dlm-row-bot">' +
          '<div class="dlm-avatar">' + AVG + '</div>' +
          '<div class="dlm-bubble-bot">Servus! Wie kann ich dir helfen?</div>' +
        '</div>' +
      '</div>' +
      '<div class="dlm-input-area">' +
        '<div class="dlm-input-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>' +
        '<input type="text" id="dlm-input" placeholder="Nachricht" autocomplete="off"/>' +
        '<button class="dlm-btn-reset" id="dlm-reset" title="Neue Unterhaltung"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.91"/></svg></button>' +
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
  document.getElementById('dlm-chat').classList.toggle('open', chatOpen);
  document.getElementById('dlm-tclose').classList.toggle('visible', chatOpen);
  var tr = document.getElementById('dlm-pill');
  tr.style.opacity = chatOpen ? '0.5' : '1';
  tr.style.pointerEvents = chatOpen ? 'none' : 'all';
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
