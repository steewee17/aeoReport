(function () {
  'use strict';

  // ── CONFIG ──
  var WEBHOOK = 'https://steewee.app.n8n.cloud/webhook/leanAgent';
  var TENANT  = 'dolomit-tirol';

  // ── STATE ──
  var sessionId = uid();
  var loading   = false;
  var chatOpen  = false;

  // ── BOOT ──
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    injectFont();
    injectCSS();
    injectHTML();
  }

  function injectFont() {
    if (document.querySelector('link[data-vg]')) return;
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Alegreya+Sans:wght@400;500;700&display=swap';
    l.setAttribute('data-vg', '1');
    document.head.appendChild(l);
  }

  function injectCSS() {
    if (document.getElementById('vg-css')) return;
    var s = document.createElement('style');
    s.id = 'vg-css';
    s.textContent = '\
#vg-w { position: fixed !important; bottom: 20px !important; right: 20px !important; z-index: 2147483647 !important; display: flex !important; flex-direction: column !important; align-items: flex-end !important; gap: 0 !important; font-family: "Alegreya Sans", sans-serif !important; pointer-events: none !important; }\
#vg-w * { box-sizing: border-box; margin: 0; padding: 0; }\
#vg-c { width: 370px; height: 580px; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.18); display: flex; flex-direction: column; transform-origin: bottom right; transform: scale(0.9) translateY(10px); opacity: 0; pointer-events: none; transition: transform 0.22s cubic-bezier(.34,1.3,.64,1), opacity 0.18s ease; margin-bottom: 12px; }\
#vg-c.vg-open { transform: scale(1) translateY(0); opacity: 1; pointer-events: all !important; }\
.vg-hd { background: #953937; padding: 12px 14px; display: flex; align-items: center; gap: 10px; flex-shrink: 0; }\
.vg-ht { flex: 1; min-width: 0; }\
.vg-h1 { color: white; font-size: 15px; font-weight: 700; line-height: 1.2; }\
.vg-hx { width: 26px; height: 26px; border-radius: 50%; background: rgba(255,255,255,0.18); border: none; cursor: pointer; color: white; display: flex; align-items: center; justify-content: center; }\
#vg-m { flex: 1; overflow-y: auto; padding: 14px 12px; display: flex; flex-direction: column; gap: 12px; background: white; }\
.vg-rb { display: flex; align-items: flex-end; gap: 8px; align-self: flex-start; max-width: 86%; }\
.vg-av { width: 28px; height: 28px; flex-shrink: 0; }\
.vg-bb { background: white; color: #1a1a1a; border: 1px solid #F1DADA; border-radius: 14px 14px 14px 3px; padding: 10px 13px; font-size: 14px; line-height: 1.55; }\
.vg-ru { align-self: flex-end; max-width: 80%; }\
.vg-bu { background: #ae4341; color: white; border-radius: 14px 14px 3px 14px; padding: 10px 13px; font-size: 14px; line-height: 1.55; }\
.vg-ia { background: #F8EDEC; padding: 10px 12px; display: flex; align-items: center; gap: 8px; border-top: 1px solid #F1DADA; }\
#vg-i { flex: 1; border: none; outline: none; background: transparent; font-size: 14px; font-family: inherit; }\
.vg-bs { width: 32px; height: 32px; background: #ae4341; border: none; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; }\
.vg-tw { position: relative !important; display: flex !important; flex-direction: column !important; align-items: flex-end !important; pointer-events: none !important; }\
.vg-tx { width: 24px; height: 24px; background: white; border: none; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.15); cursor: pointer; display: none; align-items: center; justify-content: center; margin-bottom: 4px; pointer-events: auto !important; }\
.vg-tx.visible { display: flex !important; }\
.vg-tr { display: flex !important; align-items: flex-end !important; pointer-events: none !important; }\
.vg-pl { background: #ae4341 !important; color: white !important; font-family: "Alegreya Sans", sans-serif !important; font-size: 14px !important; font-weight: 500 !important; padding: 11px 20px !important; border-radius: 50px !important; cursor: pointer !important; box-shadow: 0 4px 16px rgba(174,67,65,0.4) !important; white-space: nowrap !important; pointer-events: auto !important; transition: transform 0.15s; }\
.vg-pl:hover { transform: translateY(-2px); }\
@media(max-width:480px){#vg-c{width:100vw;height:100dvh;border-radius:0;position:fixed;top:0;left:0;}}';
    document.head.appendChild(s);
  }

  function injectHTML() {
    if (document.getElementById('vg-w')) return;
    var d = document.createElement('div');
    d.id = 'vg-w';
    d.innerHTML =
      '<div id="vg-c">' +
        '<div class="vg-hd">' +
          '<div class="vg-ht"><div class="vg-h1">Dolomit Assistent</div></div>' +
          '<button class="vg-hx" id="vg-hx">\u00d7</button>' +
        '</div>' +
        '<div id="vg-m">' +
          '<div class="vg-rb"><div class="vg-av">' + avatarSvg() + '</div>' +
          '<div class="vg-bb">Servus! Wie kann ich dir helfen?</div></div>' +
        '</div>' +
        '<div class="vg-ia">' +
          '<input type="text" id="vg-i" placeholder="Nachricht..." autocomplete="off"/>' +
          '<button class="vg-bs" id="vg-bs"><svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button>' +
        '</div>' +
      '</div>' +
      '<div class="vg-tw">' +
        '<button class="vg-tx" id="vg-tx">\u00d7</button>' +
        '<div class="vg-tr"><div class="vg-pl" id="vg-pl">Servus, wie kann ich dir helfen?</div></div>' +
      '</div>';
    document.body.appendChild(d);

    // Hard-Binding der Events
    var trigger = document.getElementById('vg-pl');
    var closeX = document.getElementById('vg-tx');
    var headerX = document.getElementById('vg-hx');

    if (trigger) trigger.onclick = toggleChat;
    if (closeX) closeX.onclick = toggleChat;
    if (headerX) headerX.onclick = toggleChat;

    document.getElementById('vg-bs').onclick = sendMessage;
    document.getElementById('vg-i').onkeydown = function(e) {
      if (e.key === 'Enter') sendMessage();
    };
  }

  function toggleChat(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    var c = document.getElementById('vg-c');
    var tx = document.getElementById('vg-tx');
    var pl = document.getElementById('vg-pl');
    
    chatOpen = !c.classList.contains('vg-open');

    if (chatOpen) {
      c.classList.add('vg-open');
      tx.classList.add('visible');
      pl.style.display = 'none'; // Button verstecken wenn offen
      setTimeout(function() { document.getElementById('vg-i').focus(); }, 300);
    } else {
      c.classList.remove('vg-open');
      tx.classList.remove('visible');
      pl.style.display = 'flex';
    }
    return false;
  }

  function sendMessage() {
    var inp = document.getElementById('vg-i');
    var msg = inp.value.trim();
    if (!msg || loading) return;
    inp.value = ''; loading = true;
    addUser(msg);
    fetch(WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, tenant_id: TENANT, message: msg })
    })
    .then(r => r.json())
    .then(d => {
      var botMsg = d.message || (d[0] && d[0].message) || "Entschuldigung, ich konnte keine Antwort finden.";
      addBot(botMsg);
    })
    .catch(() => addBot("Verbindungsfehler."))
    .finally(() => { loading = false; });
  }

  function avatarSvg() {
    return '<svg width="28" height="28" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#ae4341"/><path d="M30 40 L70 40 L70 70 L30 70 Z" fill="white"/></svg>';
  }
  function addUser(t) {
    var m=document.getElementById('vg-m'),d=document.createElement('div');
    d.className='vg-ru'; d.innerHTML='<div class="vg-bu">'+t+'</div>';
    m.appendChild(d); m.scrollTop=m.scrollHeight;
  }
  function addBot(t) {
    var m=document.getElementById('vg-m'),d=document.createElement('div');
    d.className='vg-rb';
    d.innerHTML='<div class="vg-av">'+avatarSvg()+'</div><div class="vg-bb">'+t+'</div>';
    m.appendChild(d); m.scrollTop=m.scrollHeight;
  }
  function uid(){return Math.random().toString(36).substring(2, 15);}

})();