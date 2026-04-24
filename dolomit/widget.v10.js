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
    #dlm-root {
      all: initial;
      position: fixed !important;
      bottom: 20px !important;
      right: 20px !important;
      z-index: 2147483647 !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: flex-end !important;
      font-family: 'Alegreya Sans', sans-serif !important;
    }
    #dlm-root *, #dlm-root *::before, #dlm-root *::after {
      box-sizing: border-box !important; margin: 0 !important; padding: 0 !important;
    }
    #dlm-chat {
      width: 370px !important; height: 580px !important; background: white !important;
      border-radius: 16px !important; overflow: hidden !important;
      box-shadow: 0 8px 32px rgba(0,0,0,0.18) !important;
      display: flex !important; flex-direction: column !important;
      transform-origin: bottom right !important;
      transform: scale(0.9) translateY(10px) !important;
      opacity: 0 !important; pointer-events: none !important;
      transition: transform 0.22s cubic-bezier(.34,1.3,.64,1), opacity 0.18s ease !important;
      margin-bottom: 12px !important;
    }
    #dlm-chat.dlm-open {
      transform: scale(1) translateY(0) !important;
      opacity: 1 !important; pointer-events: all !important;
    }
    .dlm-header {
      background: #953937 !important; padding: 12px 14px !important;
      display: flex !important; align-items: center !important; gap: 10px !important; flex-shrink: 0 !important;
    }
    .dlm-header-text { flex: 1 !important; min-width: 0 !important; }
    .dlm-header-title {
      color: white !important; font-size: 15px !important; font-weight: 700 !important; line-height: 1.2 !important;
      white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important;
    }
    .dlm-header-sub {
      color: rgba(255,255,255,0.65) !important; font-size: 12px !important; line-height: 1.3 !important;
      white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important; margin-top: 1px !important;
    }
    .dlm-header-close {
      width: 26px !important; height: 26px !important; border-radius: 50% !important;
      background: rgba(255,255,255,0.18) !important; border: none !important; cursor: pointer !important;
      color: white !important; font-size: 16px !important; line-height: 1 !important;
      display: flex !important; align-items: center !important; justify-content: center !important;
      flex-shrink: 0 !important;
    }
    #dlm-messages {
      flex: 1 !important; overflow-y: auto !important; padding: 14px 12px !important;
      display: flex !important; flex-direction: column !important; gap: 12px !important;
      background: white !important;
    }
    .dlm-row-bot {
      display: flex !important; align-items: flex-end !important; gap: 8px !important;
      align-self: flex-start !important; max-width: 86% !important;
    }
    .dlm-avatar { width: 28px !important; height: 28px !important; flex-shrink: 0 !important; margin-bottom: 2px !important; }
    .dlm-bubble-bot {
      background: white !important; color: #1a1a1a !important; border: 1px solid #F1DADA !important;
      border-radius: 14px 14px 14px 3px !important; padding: 10px 13px !important;
      font-size: 14px !important; font-family: 'Alegreya Sans', sans-serif !important;
      line-height: 1.55 !important; word-break: break-word !important;
    }
    .dlm-row-user { align-self: flex-end !important; max-width: 80% !important; }
    .dlm-bubble-user {
      background: #ae4341 !important; color: white !important;
      border-radius: 14px 14px 3px 14px !important; padding: 10px 13px !important;
      font-size: 14px !important; font-family: 'Alegreya Sans', sans-serif !important;
      line-height: 1.55 !important; word-break: break-word !important;
    }
    .dlm-system {
      align-self: center !important; background: #F8EDEC !important; color: #C86C6A !important;
      font-size: 11px !important; padding: 4px 12px !important; border-radius: 20px !important;
    }
    .dlm-cta {
      display: inline-block !important; margin-top: 8px !important;
      background: #ae4341 !important; color: white !important; text-decoration: none !important;
      padding: 7px 16px !important; border-radius: 20px !important;
      font-size: 13px !important; font-weight: 500 !important;
    }
    .dlm-dots { display: flex !important; gap: 4px !important; padding: 2px 0 !important; }
    .dlm-dots span {
      width: 7px !important; height: 7px !important; background: #D6908F !important;
      border-radius: 50% !important; animation: dlmBounce 1.2s infinite !important;
      display: block !important;
    }
    .dlm-dots span:nth-child(2) { animation-delay: 0.2s !important; }
    .dlm-dots span:nth-child(3) { animation-delay: 0.4s !important; }
    @keyframes dlmBounce {
      0%,60%,100% { transform: translateY(0); }
      30% { transform: translateY(-5px); }
    }
    .dlm-input-area {
      background: #F8EDEC !important; padding: 10px 12px !important;
      display: flex !important; align-items: center !important; gap: 8px !important;
      flex-shrink: 0 !important; border-top: 1px solid #F1DADA !important;
    }
    .dlm-input-icon { color: #C86C6A !important; flex-shrink: 0 !important; display: flex !important; align-items: center !important; }
    .dlm-input-icon svg { width: 16px !important; height: 16px !important; }
    #dlm-input {
      flex: 1 !important; border: none !important; outline: none !important; background: transparent !important;
      font-size: 14px !important; font-family: 'Alegreya Sans', sans-serif !important;
      color: #1a1a1a !important; min-width: 0 !important;
    }
    #dlm-input::placeholder { color: #D6908F !important; }
    .dlm-btn-reset {
      width: 28px !important; height: 28px !important; border: none !important; background: none !important;
      cursor: pointer !important; color: #D6908F !important;
      display: flex !important; align-items: center !important; justify-content: center !important;
      flex-shrink: 0 !important;
    }
    .dlm-btn-reset svg { width: 16px !important; height: 16px !important; }
    .dlm-btn-send {
      width: 32px !important; height: 32px !important; background: #ae4341 !important;
      border: none !important; border-radius: 50% !important; cursor: pointer !important;
      display: flex !important; align-items: center !important; justify-content: center !important;
      flex-shrink: 0 !important;
    }
    .dlm-btn-send:disabled { background: #E3B5B5 !important; cursor: not-allowed !important; }
    .dlm-btn-send svg { width: 13px !important; height: 13px !important; }
    .dlm-footer {
      background: white !important; padding: 6px 14px 8px !important; text-align: center !important;
      font-size: 11px !important; color: #D6908F !important;
      border-top: 1px solid #F8EDEC !important; flex-shrink: 0 !important;
    }
    .dlm-footer a { color: #ae4341 !important; text-decoration: underline !important; }
    .dlm-trigger-wrap {
      display: flex !important; flex-direction: column !important; align-items: flex-end !important; gap: 6px !important;
    }
    .dlm-trigger-close {
      width: 24px !important; height: 24px !important; background: white !important; border: none !important;
      border-radius: 50% !important; box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
      cursor: pointer !important; font-size: 13px !important; color: #666 !important;
      display: none !important; align-items: center !important; justify-content: center !important;
      align-self: flex-end !important; margin-right: 4px !important;
    }
    .dlm-trigger-close.dlm-visible { display: flex !important; }
    .dlm-pill {
      background: #ae4341 !important; color: white !important;
      font-family: 'Alegreya Sans', sans-serif !important;
      font-size: 14px !important; font-weight: 500 !important;
      padding: 11px 20px !important; border-radius: 50px !important; cursor: pointer !important;
      box-shadow: 0 4px 16px rgba(174,67,65,0.4) !important;
      white-space: nowrap !important; user-select: none !important;
      display: flex !important; align-items: center !important;
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
