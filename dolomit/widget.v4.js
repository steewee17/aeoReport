(function () {
  'use strict';

  var WEBHOOK_URL = 'https://steewee.app.n8n.cloud/webhook/leanAgent';
  var TENANT_ID   = 'dolomit-tirol';
  var FONT_URL    = 'https://fonts.googleapis.com/css2?family=Alegreya+Sans:wght@400;500;700&display=swap';

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

  var LOGO_SVG = '<svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg"><circle cx="14" cy="14" r="14" fill="#702A29"/><circle cx="14" cy="14" r="12" fill="#ae4341"/><text x="7" y="20" font-family="Alegreya Sans, serif" font-weight="700" font-size="14" fill="white">d.</text></svg>';

  var sessionId = uid();
  var isOpen    = false;
  var isLoading = false;

  function init() {
    injectFont();
    injectStyles();
    injectHTML();
    bindEvents();
  }

  function injectFont() {
    if (document.querySelector('link[data-vg-font]')) return;
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = FONT_URL;
    l.setAttribute('data-vg-font', '1');
    document.head.appendChild(l);
  }

  function injectStyles() {
    if (document.getElementById('vg-styles')) return;
    var s = document.createElement('style');
    s.id = 'vg-styles';
    s.textContent = `
      #vg-root *, #vg-root *::before, #vg-root *::after {
        box-sizing: border-box; margin: 0; padding: 0;
      }
      #vg-root {
        position: fixed; bottom: 20px; right: 20px; z-index: 2147483647;
        display: flex; flex-direction: column; align-items: flex-end;
        font-family: 'Alegreya Sans', sans-serif;
      }
      #vg-chat {
        width: 380px; height: 590px; background: #fff;
        border-radius: 18px; overflow: hidden;
        box-shadow: 0 12px 40px rgba(0,0,0,0.22);
        display: flex; flex-direction: column;
        transform-origin: bottom right;
        transform: scale(0.88) translateY(12px); opacity: 0; pointer-events: none;
        transition: transform 0.24s cubic-bezier(.34,1.3,.64,1), opacity 0.2s ease;
        margin-bottom: 12px;
      }
      #vg-chat.vg-open { transform: scale(1) translateY(0); opacity: 1; pointer-events: all; }

      .vg-header {
        background: ${C.p600}; padding: 14px 16px;
        display: flex; align-items: center; gap: 10px; flex-shrink: 0;
      }
      .vg-header-text { flex: 1; min-width: 0; }
      .vg-header-title {
        font-size: 15px; font-weight: 700; color: #fff;
        line-height: 1.25; letter-spacing: 0.01em;
      }
      .vg-header-sub {
        font-size: 11.5px; color: rgba(255,255,255,0.72); margin-top: 2px;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .vg-btn-close {
        width: 28px; height: 28px; background: rgba(255,255,255,0.15);
        border: none; border-radius: 50%; color: #fff; font-size: 18px;
        cursor: pointer; display: flex; align-items: center; justify-content: center;
        flex-shrink: 0; transition: background 0.15s; line-height: 1;
      }
      .vg-btn-close:hover { background: rgba(255,255,255,0.28); }

      #vg-messages {
        flex: 1; overflow-y: auto;
        padding: 18px 16px 12px 16px;
        display: flex; flex-direction: column; gap: 12px;
        background: #faf8f6;
      }
      #vg-messages::-webkit-scrollbar { width: 4px; }
      #vg-messages::-webkit-scrollbar-thumb { background: ${C.p200}; border-radius: 4px; }

      .vg-row-bot  { display: flex; align-items: flex-end; gap: 8px; }
      .vg-avatar   { width: 28px; height: 28px; flex-shrink: 0; margin-bottom: 2px; }
      .vg-row-user { display: flex; justify-content: flex-end; }

      .vg-bubble-bot {
        background: #fff; color: #1a1a1a; border: 1px solid ${C.p100};
        border-radius: 16px 16px 16px 4px;
        padding: 12px 16px; font-size: 14px; line-height: 1.6;
        word-break: break-word; max-width: 268px;
      }
      .vg-bubble-user {
        background: ${C.primary}; color: #fff;
        border-radius: 16px 16px 4px 16px;
        padding: 12px 16px; font-size: 14px; line-height: 1.6;
        word-break: break-word; max-width: 268px;
      }

      .vg-system {
        align-self: center; background: ${C.p50}; color: ${C.p400};
        font-size: 11px; padding: 4px 12px; border-radius: 20px;
      }

      .vg-cta {
        display: inline-block; margin-top: 9px;
        background: ${C.primary}; color: #fff; text-decoration: none;
        padding: 8px 18px; border-radius: 22px;
        font-size: 13px; font-family: 'Alegreya Sans', sans-serif;
        font-weight: 500; transition: background 0.15s;
      }
      .vg-cta:hover { background: ${C.p600}; }

      .vg-dots { display: flex; gap: 4px; padding: 3px 2px; }
      .vg-dots span {
        width: 7px; height: 7px; background: ${C.p300};
        border-radius: 50%; animation: vgBounce 1.2s infinite;
      }
      .vg-dots span:nth-child(2) { animation-delay: 0.2s; }
      .vg-dots span:nth-child(3) { animation-delay: 0.4s; }
      @keyframes vgBounce {
        0%, 60%, 100% { transform: translateY(0); }
        30% { transform: translateY(-5px); }
      }

      .vg-input-area {
        background: ${C.p50}; padding: 10px 14px 11px 14px;
        display: flex; align-items: center; gap: 10px;
        flex-shrink: 0; border-top: 1px solid ${C.p100};
      }
      .vg-input-icon {
        color: ${C.p400}; flex-shrink: 0; display: flex; align-items: center;
      }
      .vg-input-icon svg { width: 17px; height: 17px; }
      #vg-input {
        flex: 1; border: none; outline: none; background: transparent;
        font-size: 14px; font-family: 'Alegreya Sans', sans-serif;
        color: #1a1a1a; min-width: 0;
      }
      #vg-input::placeholder { color: ${C.p300}; }
      .vg-btn-reset {
        width: 30px; height: 30px; border: none; background: none;
        cursor: pointer; color: ${C.p300};
        display: flex; align-items: center; justify-content: center;
        transition: color 0.15s; flex-shrink: 0; border-radius: 50%;
      }
      .vg-btn-reset:hover { color: ${C.primary}; }
      .vg-btn-reset svg { width: 15px; height: 15px; }
      .vg-btn-send {
        width: 36px; height: 36px; background: ${C.primary};
        border: none; border-radius: 50%; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0; transition: background 0.15s;
      }
      .vg-btn-send:hover    { background: ${C.p600}; }
      .vg-btn-send:disabled { background: ${C.p200}; cursor: not-allowed; }
      .vg-btn-send svg { width: 14px; height: 14px; margin-left: 1px; }

      .vg-footer {
        background: #fff; padding: 6px 14px 9px; text-align: center;
        font-size: 11px; color: ${C.p300};
        border-top: 1px solid ${C.p50}; flex-shrink: 0;
      }
      .vg-footer a { color: ${C.primary}; text-decoration: underline; }

      #vg-pill {
        background: ${C.primary}; color: #fff;
        font-family: 'Alegreya Sans', sans-serif;
        font-size: 15px; font-weight: 500;
        border: none; border-radius: 24px; padding: 11px 22px;
        cursor: pointer; box-shadow: 0 4px 16px rgba(174,67,65,0.35);
        transition: background 0.15s, transform 0.1s;
      }
      #vg-pill:hover { background: ${C.p600}; transform: scale(1.03); }

      @media (max-width: 480px) {
        #vg-chat {
          width: 100vw; height: 100dvh; border-radius: 0;
          position: fixed; top: 0; left: 0; margin-bottom: 0;
        }
        #vg-root { bottom: 16px; right: 16px; }
      }
    `;
    document.head.appendChild(s);
  }

  function injectHTML() {
    if (document.getElementById('vg-root')) return;
    var div = document.createElement('div');
    div.id = 'vg-root';
    div.innerHTML =
      '<div id="vg-chat">' +
        '<div class="vg-header">' +
          '<div class="vg-header-text">' +
            '<div class="vg-header-title">Dolomit Assistent</div>' +
            '<div class="vg-header-sub">Speicher\u00f6fen aus Tirol \u00b7 Steinringer Ofenbau</div>' +
          '</div>' +
          '<button class="vg-btn-close" id="vg-close">\u00d7</button>' +
        '</div>' +
        '<div id="vg-messages">' +
          '<div class="vg-row-bot">' +
            '<div class="vg-avatar">' + LOGO_SVG + '</div>' +
            '<div class="vg-bubble-bot">Servus! Wie kann ich dir helfen?</div>' +
          '</div>' +
        '</div>' +
        '<div class="vg-input-area">' +
          '<div class="vg-input-icon">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
              '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' +
            '</svg>' +
          '</div>' +
          '<input type="text" id="vg-input" placeholder="Nachricht" autocomplete="off" />' +
          '<button class="vg-btn-reset" id="vg-reset" title="Neue Unterhaltung">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
              '<polyline points="1 4 1 10 7 10"/>' +
              '<path d="M3.51 15a9 9 0 1 0 .49-3.91"/>' +
            '</svg>' +
          '</button>' +
          '<button class="vg-btn-send" id="vg-send">' +
            '<svg viewBox="0 0 24 24" fill="white">' +
              '<path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/>' +
            '</svg>' +
          '</button>' +
        '</div>' +
        '<div class="vg-footer">I speak your language \u00b7 <a href="https://www.kleinkachelofen.net" target="_blank" rel="noopener">dolomit.tirol</a></div>' +
      '</div>' +
      '<button id="vg-pill">Servus, wie kann ich dir helfen?</button>';
    document.body.appendChild(div);
  }

  function bindEvents() {
    document.getElementById('vg-pill').addEventListener('click', toggleChat);
    document.getElementById('vg-close').addEventListener('click', toggleChat);
    document.getElementById('vg-send').addEventListener('click', sendMessage);
    document.getElementById('vg-reset').addEventListener('click', resetSession);
    document.getElementById('vg-input').addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });
  }

  function toggleChat() {
    isOpen = !isOpen;
    document.getElementById('vg-chat').classList.toggle('vg-open', isOpen);
    if (isOpen) setTimeout(function() { document.getElementById('vg-input').focus(); }, 260);
  }

  function resetSession() {
    sessionId = uid();
    var msgs = document.getElementById('vg-messages');
    msgs.innerHTML =
      '<div class="vg-system">Neue Unterhaltung</div>' +
      '<div class="vg-row-bot"><div class="vg-avatar">' + LOGO_SVG + '</div>' +
      '<div class="vg-bubble-bot">Servus! Wie kann ich dir helfen?</div></div>';
  }

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
      if (!res.ok) { addSystem('Fehler ' + res.status); return; }
      return res.json().then(function(data) {
        var text = data.message || (data[0] && data[0].message) || '';
        var cta  = data.cta    || (data[0] && data[0].cta)    || null;
        addBot(text, cta);
      });
    })
    .catch(function() { removeTyping(tid); addSystem('Verbindungsfehler'); })
    .finally(function() {
      isLoading = false;
      document.getElementById('vg-send').disabled = false;
      document.getElementById('vg-input').focus();
    });
  }

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
      ? '<br><a class="vg-cta" href="' + esc(cta.url) + '" target="_blank" rel="noopener">' + esc(cta.label) + '</a>'
      : '';
    d.innerHTML =
      '<div class="vg-avatar">' + LOGO_SVG + '</div>' +
      '<div class="vg-bubble-bot">' + linkify(esc(text)) + ctaHtml + '</div>';
    m.appendChild(d); scrollBottom();
  }

  function addTyping() {
    var m  = document.getElementById('vg-messages');
    var d  = document.createElement('div');
    var id = 'vgt-' + Date.now();
    d.className = 'vg-row-bot'; d.id = id;
    d.innerHTML =
      '<div class="vg-avatar">' + LOGO_SVG + '</div>' +
      '<div class="vg-bubble-bot"><div class="vg-dots">' +
      '<span></span><span></span><span></span></div></div>';
    m.appendChild(d); scrollBottom();
    return id;
  }

  function removeTyping(id) { var el = document.getElementById(id); if (el) el.remove(); }

  function addSystem(msg) {
    var m = document.getElementById('vg-messages');
    var d = document.createElement('div');
    d.className = 'vg-system'; d.textContent = msg;
    m.appendChild(d); scrollBottom();
  }

  function scrollBottom() {
    var m = document.getElementById('vg-messages');
    if (m) m.scrollTop = m.scrollHeight;
  }

  function linkify(text) {
    return text.replace(/(https?:\/\/[^\s<]+)/g, function(url) {
      return '<a href="' + url + '" target="_blank" rel="noopener" style="color:' + C.primary + '">' + url + '</a>';
    });
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function uid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
