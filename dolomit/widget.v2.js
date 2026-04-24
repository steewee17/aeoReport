(function () {
  'use strict';

  // ── CONFIG ──
  var WEBHOOK_URL = 'https://steewee.app.n8n.cloud/webhook/leanAgent';
  var TENANT_ID   = 'dolomit-tirol';
  var FONT_URL    = 'https://fonts.googleapis.com/css2?family=Alegreya+Sans:wght@400;500;700&display=swap';

  // ── PALETTE ──
  var C = {
    p50:     '#F8EDEC',
    p100:    '#F1DADA',
    p200:    '#E3B5B5',
    p300:    '#D6908F',
    p400:    '#C86C6A',
    primary: '#ae4341',
    p600:    '#953937',
    p700:    '#702A29',
  };

  // ── STATE ──
  var sessionId = uid();
  var isOpen    = false;
  var isLoading = false;

  // ── INIT ──
  function init() {
    injectFont();
    injectStyles();
    injectHTML();
    bindEvents();
  }

  function uid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  // ── FONT ──
  function injectFont() {
    if (document.getElementById('vg-font')) return;
    var link = document.createElement('link');
    link.id   = 'vg-font';
    link.rel  = 'stylesheet';
    link.href = FONT_URL;
    document.head.appendChild(link);
  }

  // ── STYLES ──
  function injectStyles() {
    if (document.getElementById('vg-styles')) return;
    var css = `
      #vg-widget * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Alegreya Sans', sans-serif; }
      #vg-widget {
        position: fixed; bottom: 20px; right: 20px; z-index: 2147483647;
        display: flex; flex-direction: column; align-items: flex-end; gap: 12px;
      }
      #vg-chat {
        width: 370px; height: 580px;
        background: white; border-radius: 16px;
        overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.18);
        display: flex; flex-direction: column;
        transform-origin: bottom right;
        transform: scale(0.9) translateY(10px); opacity: 0; pointer-events: none;
        transition: transform 0.22s cubic-bezier(.34,1.3,.64,1), opacity 0.18s ease;
        margin-bottom: 0;
      }
      #vg-chat.vg-open { transform: scale(1) translateY(0); opacity: 1; pointer-events: all; }
      .vg-header {
        background: ${C.p600}; padding: 16px 16px 14px 16px;
        display: flex; align-items: center; gap: 10px; flex-shrink: 0;
        min-height: 64px;
      }
      .vg-header-text { flex: 1; min-width: 0; }
      .vg-header-title { color: white; font-size: 15px; font-weight: 700; line-height: 1.2; }
      .vg-header-sub { color: rgba(255,255,255,0.65); font-size: 12px; margin-top: 1px; }
      .vg-header-close {
        width: 26px; height: 26px; border-radius: 50%;
        background: rgba(255,255,255,0.18); border: none; cursor: pointer;
        color: white; font-size: 18px; display: flex; align-items: center;
        justify-content: center; flex-shrink: 0; line-height: 1;
        transition: background 0.15s;
      }
      .vg-header-close:hover { background: rgba(255,255,255,0.3); }
      #vg-messages {
        flex: 1; overflow-y: auto; padding: 16px 14px;
        display: flex; flex-direction: column; gap: 14px;
        background: white; scroll-behavior: smooth;
      }
      #vg-messages::-webkit-scrollbar { width: 3px; }
      #vg-messages::-webkit-scrollbar-thumb { background: ${C.p200}; border-radius: 2px; }
      .vg-row-bot { display: flex; align-items: flex-end; gap: 10px; align-self: flex-start; max-width: 88%; }
      .vg-avatar { width: 30px; height: 30px; flex-shrink: 0; margin-bottom: 2px; }
      .vg-bubble-bot {
        background: white; color: #1a1a1a;
        border: 1px solid ${C.p100};
        border-radius: 14px 14px 14px 3px;
        padding: 11px 14px; font-size: 14px; line-height: 1.6; word-break: break-word;
      }
      .vg-bubble-bot a { color: ${C.primary}; text-decoration: underline; word-break: break-all; }
      .vg-row-user { align-self: flex-end; max-width: 80%; }
      .vg-bubble-user {
        background: ${C.primary}; color: white;
        border-radius: 14px 14px 3px 14px;
        padding: 10px 13px; font-size: 14px; line-height: 1.55; word-break: break-word;
      }
      .vg-system {
        align-self: center; background: ${C.p50}; color: ${C.p400};
        font-size: 11px; padding: 4px 12px; border-radius: 20px;
      }
      .vg-cta {
        display: inline-block; margin-top: 8px;
        background: ${C.primary}; color: white; text-decoration: none;
        padding: 7px 16px; border-radius: 20px; font-size: 13px; font-weight: 500;
        transition: background 0.15s;
      }
      .vg-cta:hover { background: ${C.p600}; }
      .vg-dots { display: flex; gap: 4px; padding: 2px 0; }
      .vg-dots span {
        width: 7px; height: 7px; background: ${C.p300};
        border-radius: 50%; animation: vgBounce 1.2s infinite;
      }
      .vg-dots span:nth-child(2) { animation-delay: 0.2s; }
      .vg-dots span:nth-child(3) { animation-delay: 0.4s; }
      @keyframes vgBounce {
        0%,60%,100% { transform: translateY(0); }
        30% { transform: translateY(-5px); }
      }
      .vg-input-area {
        background: ${C.p50}; padding: 10px 14px;
        display: flex; align-items: center; gap: 10px;
        flex-shrink: 0; border-top: 1px solid ${C.p100};
      }
      .vg-input-icon { color: ${C.p400}; flex-shrink: 0; display: flex; align-items: center; margin-left: 2px; }
      .vg-input-icon svg { width: 17px; height: 17px; }
      #vg-input {
        flex: 1; border: none; outline: none; background: transparent;
        font-size: 14px; font-family: 'Alegreya Sans', sans-serif;
        color: #1a1a1a; min-width: 0;
      }
      #vg-input::placeholder { color: ${C.p300}; }
      .vg-btn-reset {
        width: 28px; height: 28px; border: none; background: none;
        cursor: pointer; color: ${C.p300};
        display: flex; align-items: center; justify-content: center;
        transition: color 0.15s; flex-shrink: 0;
      }
      .vg-btn-reset:hover { color: ${C.primary}; }
      .vg-btn-reset svg { width: 16px; height: 16px; }
      .vg-btn-send {
        width: 32px; height: 32px; background: ${C.primary};
        border: none; border-radius: 50%; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0; transition: background 0.15s;
      }
      .vg-btn-send:hover { background: ${C.p600}; }
      .vg-btn-send:disabled { background: ${C.p200}; cursor: not-allowed; }
      .vg-btn-send svg { width: 13px; height: 13px; }
      .vg-footer {
        background: white; padding: 6px 14px 8px; text-align: center;
        font-size: 11px; color: ${C.p300}; border-top: 1px solid ${C.p50}; flex-shrink: 0;
      }
      .vg-footer a { color: ${C.primary}; text-decoration: underline; }
      #vg-pill {
        background: ${C.primary}; color: white;
        font-family: 'Alegreya Sans', sans-serif; font-size: 14px; font-weight: 500;
        padding: 11px 20px; border-radius: 50px; cursor: pointer;
        box-shadow: 0 4px 16px rgba(174,67,65,0.4); white-space: nowrap;
        transition: transform 0.15s, box-shadow 0.15s; user-select: none;
        border: none;
      }
      #vg-pill:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(174,67,65,0.45); }
      @media (max-width: 480px) {
        #vg-chat {
          width: 100vw; height: 100dvh; border-radius: 0;
          position: fixed; top: 0; left: 0; margin-bottom: 0;
        }
        #vg-widget { bottom: 16px; right: 16px; }
      }
    `;
    var style = document.createElement('style');
    style.id   = 'vg-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ── LOGO SVG ──
  var LOGO_SVG = '<svg width="28" height="28" viewBox="0 0 100 100"><defs><clipPath id="vgc"><circle cx="50" cy="50" r="50"/></clipPath></defs><g clip-path="url(#vgc)"><rect width="100" height="100" fill="#ae4341"/><path d="M46,19 L59,19 L59,73 L23,73 A26,26 0 0 1 23,37 L46,37 Z" fill="white"/><rect x="29" y="48" width="17" height="14" fill="#ae4341"/><rect x="71" y="59" width="12" height="13" fill="white"/><rect x="15" y="81" width="68" height="3" fill="white" rx="1"/></g></svg>';

  // ── HTML ──
  function injectHTML() {
    if (document.getElementById('vg-widget')) return;
    var div = document.createElement('div');
    div.id = 'vg-widget';
    div.innerHTML = `
      <div id="vg-chat">
        <div class="vg-header">
          <div class="vg-header-text">
            <div class="vg-header-title">Dolomit Assistent</div>
            <div class="vg-header-sub">Speicheröfen aus Tirol · Steinringer Ofenbau</div>
          </div>
          <button class="vg-header-close" id="vg-close">×</button>
        </div>
        <div id="vg-messages">
          <div class="vg-row-bot">
            <div class="vg-avatar">${LOGO_SVG}</div>
            <div class="vg-bubble-bot">Servus! Wie kann ich dir helfen?</div>
          </div>
        </div>
        <div class="vg-input-area">
          <div class="vg-input-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <input type="text" id="vg-input" placeholder="Nachricht" autocomplete="off" />
          <button class="vg-btn-reset" id="vg-reset" title="Neue Unterhaltung">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="1 4 1 10 7 10"/>
              <path d="M3.51 15a9 9 0 1 0 .49-3.91"/>
            </svg>
          </button>
          <button class="vg-btn-send" id="vg-send">
            <svg viewBox="0 0 24 24" fill="white">
              <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/>
            </svg>
          </button>
        </div>
        <div class="vg-footer">
          I speak your language · <a href="https://www.kleinkachelofen.net" target="_blank" rel="noopener">dolomit.tirol</a>
        </div>
      </div>
      <button id="vg-pill">Servus, wie kann ich dir helfen?</button>
    `;
    document.body.appendChild(div);
  }

  // ── EVENTS ──
  function bindEvents() {
    document.getElementById('vg-pill').addEventListener('click', toggleChat);
    document.getElementById('vg-close').addEventListener('click', toggleChat);
    document.getElementById('vg-send').addEventListener('click', sendMessage);
    document.getElementById('vg-reset').addEventListener('click', resetSession);
    document.getElementById('vg-input').addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });
  }

  // ── TOGGLE ──
  function toggleChat() {
    isOpen = !isOpen;
    document.getElementById('vg-chat').classList.toggle('vg-open', isOpen);
    if (isOpen) setTimeout(function() { document.getElementById('vg-input').focus(); }, 260);
  }

  // ── RESET ──
  function resetSession() {
    sessionId = uid();
    var msgs = document.getElementById('vg-messages');
    msgs.innerHTML =
      '<div class="vg-system">Neue Unterhaltung</div>' +
      '<div class="vg-row-bot"><div class="vg-avatar">' + LOGO_SVG + '</div>' +
      '<div class="vg-bubble-bot">Servus! Wie kann ich dir helfen?</div></div>';
  }

  // ── SEND ──
  function sendMessage() {
    var input = document.getElementById('vg-input');
    var msg   = input.value.trim();
    if (!msg || isLoading) return;

    input.value = '';
    isLoading   = true;
    document.getElementById('vg-send').disabled = true;

    addUser(msg);
    var tid = addTyping();

    fetch(WEBHOOK_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ session_id: sessionId, tenant_id: TENANT_ID, message: msg })
    })
    .then(function(res) {
      removeTyping(tid);
      if (!res.ok) {
        addSystem('Fehler ' + res.status);
        return;
      }
      return res.json().then(function(data) {
        var text = data.message || (data[0] && data[0].message) || '';
        var cta  = data.cta    || (data[0] && data[0].cta)    || null;
        addBot(text, cta);
      });
    })
    .catch(function() {
      removeTyping(tid);
      addSystem('Verbindungsfehler');
    })
    .finally(function() {
      isLoading = false;
      document.getElementById('vg-send').disabled = false;
      document.getElementById('vg-input').focus();
    });
  }

  // ── DOM HELPERS ──
  function addUser(text) {
    var m = document.getElementById('vg-messages');
    var d = document.createElement('div');
    d.className = 'vg-row-user';
    d.innerHTML = '<div class="vg-bubble-user">' + esc(text) + '</div>';
    m.appendChild(d); scrollBottom();
  }

  function addBot(text, cta) {
    var m = document.getElementById('vg-messages');
    var d = document.createElement('div');
    d.className = 'vg-row-bot';
    var ctaHtml = cta
      ? '<a class="vg-cta" href="' + cta.url + '" target="_blank" rel="noopener">' + esc(cta.label) + '</a>'
      : '';
    d.innerHTML =
      '<div class="vg-avatar">' + LOGO_SVG + '</div>' +
      '<div><div class="vg-bubble-bot">' + linkify(esc(text)) + '</div>' + ctaHtml + '</div>';
    m.appendChild(d); scrollBottom();
  }

  function addSystem(text) {
    var m = document.getElementById('vg-messages');
    var d = document.createElement('div');
    d.className = 'vg-system';
    d.textContent = text;
    m.appendChild(d); scrollBottom();
  }

  function addTyping() {
    var m  = document.getElementById('vg-messages');
    var id = 'vgt-' + Date.now();
    var d  = document.createElement('div');
    d.className = 'vg-row-bot'; d.id = id;
    d.innerHTML =
      '<div class="vg-avatar">' + LOGO_SVG + '</div>' +
      '<div class="vg-bubble-bot"><div class="vg-dots"><span></span><span></span><span></span></div></div>';
    m.appendChild(d); scrollBottom(); return id;
  }

  function removeTyping(id) {
    var el = document.getElementById(id);
    if (el) el.remove();
  }

  function scrollBottom() {
    var m = document.getElementById('vg-messages');
    m.scrollTop = m.scrollHeight;
  }

  function esc(s) {
    return String(s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/\n/g,'<br>');
  }

  function linkify(s) {
    return s.replace(/(https?:\/\/[^\s&<]+)/g,
      '<a href="$1" target="_blank" rel="noopener">$1</a>');
  }

  // ── BOOT ──
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
