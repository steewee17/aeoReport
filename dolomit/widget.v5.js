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

  // ── FONT ──
  function injectFont() {
    if (document.querySelector('link[data-vg]')) return;
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Alegreya+Sans:wght@400;500;700&display=swap';
    l.setAttribute('data-vg', '1');
    document.head.appendChild(l);
  }

  // ── CSS ──
  function injectCSS() {
    if (document.getElementById('vg-css')) return;
    var s = document.createElement('style');
    s.id = 'vg-css';
    s.textContent = '\
#vg-w{position:fixed;bottom:20px;right:20px;z-index:2147483647;display:flex;flex-direction:column;align-items:flex-end;gap:0;font-family:"Alegreya Sans",sans-serif;pointer-events:none;}\
#vg-w *{pointer-events:auto;}\
#vg-w *,#vg-w *::before,#vg-w *::after{box-sizing:border-box;margin:0;padding:0;}\
#vg-c{width:370px;height:580px;background:white;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.18);display:flex;flex-direction:column;transform-origin:bottom right;transform:scale(0.9) translateY(10px);opacity:0;pointer-events:none;transition:transform 0.22s cubic-bezier(.34,1.3,.64,1),opacity 0.18s ease;margin-bottom:12px;}\
#vg-c.vg-open{transform:scale(1) translateY(0);opacity:1;pointer-events:all;}\
.vg-hd{background:#953937;padding:12px 14px;display:flex;align-items:center;gap:10px;flex-shrink:0;}\
.vg-ht{flex:1;min-width:0;}\
.vg-h1{color:white;font-size:15px;font-weight:700;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}\
.vg-h2{color:rgba(255,255,255,0.65);font-size:12px;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:1px;}\
.vg-hx{width:26px;height:26px;border-radius:50%;background:rgba(255,255,255,0.18);border:none;cursor:pointer;color:white;font-size:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background 0.15s;line-height:1;}\
.vg-hx:hover{background:rgba(255,255,255,0.3);}\
#vg-m{flex:1;overflow-y:auto;padding:14px 12px;display:flex;flex-direction:column;gap:12px;background:white;scroll-behavior:smooth;}\
#vg-m::-webkit-scrollbar{width:3px;}#vg-m::-webkit-scrollbar-thumb{background:#E3B5B5;border-radius:2px;}\
.vg-rb{display:flex;align-items:flex-end;gap:8px;align-self:flex-start;max-width:86%;}\
.vg-av{width:28px;height:28px;flex-shrink:0;margin-bottom:2px;}\
.vg-bb{background:white;color:#1a1a1a;border:1px solid #F1DADA;border-radius:14px 14px 14px 3px;padding:10px 13px;font-size:14px;font-family:"Alegreya Sans",sans-serif;line-height:1.55;word-break:break-word;}\
.vg-bb a{color:#ae4341;text-decoration:underline;word-break:break-all;}\
.vg-ru{align-self:flex-end;max-width:80%;}\
.vg-bu{background:#ae4341;color:white;border-radius:14px 14px 3px 14px;padding:10px 13px;font-size:14px;font-family:"Alegreya Sans",sans-serif;line-height:1.55;word-break:break-word;}\
.vg-sy{align-self:center;background:#F8EDEC;color:#C86C6A;font-size:11px;font-family:"Alegreya Sans",sans-serif;padding:4px 12px;border-radius:20px;}\
.vg-ct{display:inline-block;margin-top:8px;background:#ae4341;color:white;text-decoration:none;padding:7px 16px;border-radius:20px;font-size:13px;font-family:"Alegreya Sans",sans-serif;font-weight:500;transition:background 0.15s;}\
.vg-ct:hover{background:#953937;}\
.vg-dt{display:flex;gap:4px;padding:2px 0;}\
.vg-dt span{width:7px;height:7px;background:#D6908F;border-radius:50%;animation:vgB 1.2s infinite;}\
.vg-dt span:nth-child(2){animation-delay:0.2s;}.vg-dt span:nth-child(3){animation-delay:0.4s;}\
@keyframes vgB{0%,60%,100%{transform:translateY(0);}30%{transform:translateY(-5px);}}\
.vg-ia{background:#F8EDEC;padding:10px 12px;display:flex;align-items:center;gap:8px;flex-shrink:0;border-top:1px solid #F1DADA;}\
.vg-ii{color:#C86C6A;flex-shrink:0;display:flex;align-items:center;}\
.vg-ii svg{width:16px;height:16px;}\
#vg-i{flex:1;border:none;outline:none;background:transparent;font-size:14px;font-family:"Alegreya Sans",sans-serif;color:#1a1a1a;min-width:0;}\
#vg-i::placeholder{color:#D6908F;}\
.vg-br{width:28px;height:28px;border:none;background:none;cursor:pointer;color:#D6908F;display:flex;align-items:center;justify-content:center;transition:color 0.15s;flex-shrink:0;}\
.vg-br:hover{color:#ae4341;}.vg-br svg{width:16px;height:16px;}\
.vg-bs{width:32px;height:32px;background:#ae4341;border:none;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background 0.15s;}\
.vg-bs:hover{background:#953937;}.vg-bs:disabled{background:#E3B5B5;cursor:not-allowed;}.vg-bs svg{width:13px;height:13px;}\
.vg-ft{background:white;padding:6px 14px 8px;text-align:center;font-size:11px;font-family:"Alegreya Sans",sans-serif;color:#D6908F;border-top:1px solid #F8EDEC;flex-shrink:0;}\
.vg-ft a{color:#ae4341;text-decoration:underline;}\
.vg-tw{position:relative;display:flex;flex-direction:column;align-items:flex-end;gap:6px;pointer-events:none;}\
.vg-tx{width:24px;height:24px;background:white;border:none;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.15);cursor:pointer;font-size:13px;color:#666;display:none;align-items:center;justify-content:center;align-self:flex-end;margin-right:4px;transition:background 0.15s;line-height:1;pointer-events:auto;}\
.vg-tx.visible{display:flex;}\
.vg-tr{display:flex;align-items:flex-end;gap:0;pointer-events:auto;}\
.vg-pl{background:#ae4341;color:white;font-family:"Alegreya Sans",sans-serif;font-size:14px;font-weight:500;padding:11px 20px;border-radius:50px;cursor:pointer;box-shadow:0 4px 16px rgba(174,67,65,0.4);white-space:nowrap;transition:transform 0.15s,box-shadow 0.15s;user-select:none;display:flex;align-items:center;z-index:2147483647;}\
.vg-pl:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(174,67,65,0.45);}\
@media(max-width:480px){#vg-c{width:100vw;height:100dvh;border-radius:0;position:fixed;top:0;left:0;margin-bottom:0;}#vg-w{bottom:16px;right:16px;}.vg-pl{font-size:13px;padding:9px 16px;}}';
    document.head.appendChild(s);
  }

  // ── HTML ──
  function injectHTML() {
    if (document.getElementById('vg-w')) return;
    var av = avatarSvg();
    var d = document.createElement('div');
    d.id = 'vg-w';
    d.innerHTML =
      '<div id="vg-c">' +
        '<div class="vg-hd">' +
          '<div class="vg-ht"><div class="vg-h1">Dolomit Assistent</div>' +
          '<div class="vg-h2">Speicher\u00f6fen aus Tirol \u00b7 Steinringer Ofenbau</div></div>' +
          '<button class="vg-hx" id="vg-hx">\u00d7</button>' +
        '</div>' +
        '<div id="vg-m">' +
          '<div class="vg-rb"><div class="vg-av">' + av + '</div>' +
          '<div class="vg-bb">Servus! Wie kann ich dir helfen?</div></div>' +
        '</div>' +
        '<div class="vg-ia">' +
          '<div class="vg-ii"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>' +
          '<input type="text" id="vg-i" placeholder="Nachricht" autocomplete="off"/>' +
          '<button class="vg-br" id="vg-br" title="Neue Unterhaltung"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.91"/></svg></button>' +
          '<button class="vg-bs" id="vg-bs"><svg viewBox="0 0 24 24" fill="white"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/></svg></button>' +
        '</div>' +
        '<div class="vg-ft">I speak your language \u00b7 <a href="https://www.kleinkachelofen.net" target="_blank" rel="noopener">dolomit.tirol</a></div>' +
      '</div>' +
      '<div class="vg-tw">' +
        '<button class="vg-tx" id="vg-tx">\u00d7</button>' +
        '<div class="vg-tr" id="vg-tr"><div class="vg-pl" id="vg-pl">Servus, wie kann ich dir helfen?</div></div>' +
      '</div>';
    document.body.appendChild(d);

    // Event Listeners mit Stop Propagation zur Sicherheit
    document.getElementById('vg-pl').onclick = toggleChat;
    document.getElementById('vg-tx').onclick = toggleChat;
    document.getElementById('vg-hx').onclick = toggleChat;
    
    document.getElementById('vg-bs').addEventListener('click', sendMessage);
    document.getElementById('vg-br').addEventListener('click', resetSession);
    document.getElementById('vg-i').addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });
  }

  // ── LOGIC ──
  function toggleChat(e) {
    if (e) e.stopPropagation();
    var chatWindow = document.getElementById('vg-c');
    var closeBtn = document.getElementById('vg-tx');
    var triggerRow = document.getElementById('vg-tr');
    
    chatOpen = !chatWindow.classList.contains('vg-open');

    if (chatOpen) {
      chatWindow.classList.add('vg-open');
      closeBtn.classList.add('visible');
      triggerRow.style.opacity = '0.5';
      triggerRow.style.pointerEvents = 'none';
      setTimeout(function() { document.getElementById('vg-i').focus(); }, 260);
    } else {
      chatWindow.classList.remove('vg-open');
      closeBtn.classList.remove('visible');
      triggerRow.style.opacity = '1';
      triggerRow.style.pointerEvents = 'all';
    }
  }

  function resetSession() {
    sessionId = uid();
    var m = document.getElementById('vg-m');
    m.innerHTML = '<div class="vg-sy">Neue Unterhaltung</div>' +
      '<div class="vg-rb"><div class="vg-av">' + avatarSvg() + '</div>' +
      '<div class="vg-bb">Servus! Wie kann ich dir helfen?</div></div>';
  }

  function sendMessage() {
    var inp = document.getElementById('vg-i');
    var msg = inp.value.trim();
    if (!msg || loading) return;
    inp.value = ''; loading = true;
    document.getElementById('vg-bs').disabled = true;
    addUser(msg);
    var tid = addTyping();
    fetch(WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, tenant_id: TENANT, message: msg })
    })
    .then(function(r) {
      removeTyping(tid);
      if (!r.ok) { addSys('Fehler ' + r.status); return; }
      return r.json().then(function(d) {
        addBot(d.message || (d[0] && d[0].message) || '', d.cta || (d[0] && d[0].cta) || null);
      });
    })
    .catch(function() { removeTyping(tid); addSys('Verbindungsfehler'); })
    .finally(function() {
      loading = false;
      document.getElementById('vg-bs').disabled = false;
      document.getElementById('vg-i').focus();
    });
  }

  // ── HELPER ──
  function avatarSvg() {
    return '<svg width="28" height="28" viewBox="0 0 100 100"><defs><clipPath id="vgc"><circle cx="50" cy="50" r="50"/></clipPath></defs><g clip-path="url(#vgc)"><rect width="100" height="100" fill="#ae4341"/><path d="M46,19 L59,19 L59,73 L23,73 A26,26 0 0 1 23,37 L46,37 Z" fill="white"/><rect x="29" y="48" width="17" height="14" fill="#ae4341"/><rect x="71" y="59" width="12" height="13" fill="white"/><rect x="15" y="81" width="68" height="3" fill="white" rx="1"/></g></svg>';
  }
  function addUser(t) {
    var m=document.getElementById('vg-m'),d=document.createElement('div');
    d.className='vg-ru'; d.innerHTML='<div class="vg-bu">'+esc(t)+'</div>';
    m.appendChild(d); scrollB();
  }
  function addBot(t,cta) {
    var m=document.getElementById('vg-m'),d=document.createElement('div');
    d.className='vg-rb';
    var c=cta?'<a class="vg-ct" href="'+esc(cta.url)+'" target="_blank" rel="noopener">'+esc(cta.label)+'</a>':'';
    d.innerHTML='<div class="vg-av">'+avatarSvg()+'</div><div><div class="vg-bb">'+linkify(esc(t))+'</div>'+c+'</div>';
    m.appendChild(d); scrollB();
  }
  function addTyping() {
    var m=document.getElementById('vg-m'),id='vgt'+Date.now(),d=document.createElement('div');
    d.className='vg-rb'; d.id=id;
    d.innerHTML='<div class="vg-av">'+avatarSvg()+'</div><div class="vg-bb"><div class="vg-dt"><span></span><span></span><span></span></div></div>';
    m.appendChild(d); scrollB(); return id;
  }
  function removeTyping(id){var e=document.getElementById(id);if(e)e.remove();}
  function addSys(t){var m=document.getElementById('vg-m'),d=document.createElement('div');d.className='vg-sy';d.textContent=t;m.appendChild(d);scrollB();}
  function scrollB(){var m=document.getElementById('vg-m');if(m)m.scrollTop=m.scrollHeight;}
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  function linkify(s){return s.replace(/(https?:\/\/[^\s&<]+)/g,'<a href="$1" target="_blank" rel="noopener">$1</a>');}
  function uid(){return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(c){var r=Math.random()*16|0;return(c==='x'?r:(r&0x3|0x8)).toString(16);});}

})();