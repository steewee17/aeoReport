(function () {
  'use strict';

  var WEBHOOK = 'https://steewee.app.n8n.cloud/webhook/leanAgent';
  var TENANT  = 'dolomit-tirol';
  var sessionId = Math.random().toString(36).substring(2, 15);
  var loading = false;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    injectFont();
    injectCSS();
    injectHTML();
    setupGlobalClickInterceptor(); // Der Rettungsanker
  }

  function injectFont() {
    if (document.querySelector('link[data-vg]')) return;
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Alegreya+Sans:wght@400;700&display=swap';
    l.setAttribute('data-vg', '1');
    document.head.appendChild(l);
  }

  function injectCSS() {
    if (document.getElementById('vg-css')) return;
    var s = document.createElement('style');
    s.id = 'vg-css';
    s.textContent = '\
      #vg-w { position: fixed !important; bottom: 20px !important; right: 20px !important; z-index: 2147483647 !important; font-family: "Alegreya Sans", sans-serif !important; pointer-events: none !important; }\
      #vg-c { width: 370px; height: 580px; background: white !important; border-radius: 16px !important; overflow: hidden !important; box-shadow: 0 8px 32px rgba(0,0,0,0.3) !important; display: none; flex-direction: column !important; pointer-events: all !important; margin-bottom: 15px !important; }\
      #vg-c.vg-open { display: flex !important; }\
      .vg-hd { background: #953937 !important; padding: 15px !important; color: white !important; display: flex !important; justify-content: space-between !important; align-items: center !important; }\
      .vg-hx { cursor: pointer !important; background: rgba(255,255,255,0.2) !important; border: none !important; color: white !important; width: 25px !important; height: 25px !important; border-radius: 50% !important; }\
      #vg-m { flex: 1 !important; overflow-y: auto !important; padding: 15px !important; background: #fff !important; display: flex !important; flex-direction: column !important; gap: 10px !important; }\
      .vg-bb { background: #f1f1f1 !important; padding: 10px !important; border-radius: 10px !important; align-self: flex-start !important; max-width: 80% !important; color: #333 !important; }\
      .vg-bu { background: #ae4341 !important; color: white !important; padding: 10px !important; border-radius: 10px !important; align-self: flex-end !important; max-width: 80% !important; }\
      .vg-ia { padding: 15px !important; border-top: 1px solid #eee !important; display: flex !important; gap: 10px !important; background: #f9f9f9 !important; pointer-events: all !important; }\
      #vg-i { flex: 1 !important; border: 1px solid #ddd !important; border-radius: 5px !important; padding: 8px !important; }\
      .vg-bs { background: #ae4341 !important; color: white !important; border: none !important; padding: 0 15px !important; border-radius: 5px !important; cursor: pointer !important; }\
      .vg-pl { background: #ae4341 !important; color: white !important; padding: 12px 25px !important; border-radius: 50px !important; cursor: pointer !important; pointer-events: auto !important; box-shadow: 0 4px 15px rgba(0,0,0,0.2) !important; display: inline-block !important; font-weight: bold !important; transition: transform 0.2s !important; }\
      .vg-pl:hover { transform: scale(1.05) !important; }\
    ';
    document.head.appendChild(s);
  }

  function injectHTML() {
    if (document.getElementById('vg-w')) return;
    var w = document.createElement('div');
    w.id = 'vg-w';
    w.innerHTML = '\
      <div id="vg-c">\
        <div class="vg-hd"><span>Dolomit Assistent</span><button class="vg-hx" id="vg-close-top">×</button></div>\
        <div id="vg-m"><div class="vg-bb">Servus! Wie kann ich dir helfen?</div></div>\
        <div class="vg-ia"><input type="text" id="vg-i" placeholder="Frage eingeben..."><button class="vg-bs" id="vg-send">Send</button></div>\
      </div>\
      <div style="text-align:right;"><div class="vg-pl" id="vg-trigger">Servus, wie kann ich dir helfen?</div></div>';
    document.body.appendChild(w);

    // Standard-Listener
    document.getElementById('vg-send').onclick = sendMessage;
  }

  // DER ENTSCHEIDENDE TEIL: Globaler Klick-Abfänger
  function setupGlobalClickInterceptor() {
    window.addEventListener('click', function (e) {
      // Wir prüfen anhand der ID, ob das Ziel unser Button war
      var targetId = e.target.id;
      
      if (targetId === 'vg-trigger' || targetId === 'vg-close-top') {
        e.preventDefault();
        e.stopPropagation();
        toggleChat();
      }
    }, true); // "true" bedeutet Capturing-Phase: Wir fangen den Klick ab, bevor die Seite ihn sieht!
  }

  function toggleChat() {
    var c = document.getElementById('vg-c');
    var btn = document.getElementById('vg-trigger');
    if (c.style.display === 'flex') {
      c.style.display = 'none';
      btn.style.display = 'inline-block';
    } else {
      c.style.display = 'flex';
      btn.style.display = 'none';
      setTimeout(function(){ document.getElementById('vg-i').focus(); }, 100);
    }
  }

  function sendMessage() {
    var inp = document.getElementById('vg-i');
    var val = inp.value.trim();
    if (!val || loading) return;
    
    appendMsg(val, 'vg-bu');
    inp.value = '';
    loading = true;

    fetch(WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, tenant_id: TENANT, message: val })
    })
    .then(r => r.json())
    .then(d => {
      var text = d.message || (d[0] && d[0].message) || "Fehler beim Empfang der Antwort.";
      appendMsg(text, 'vg-bb');
    })
    .catch(() => appendMsg("Verbindungsfehler.", 'vg-bb'))
    .finally(() => { loading = false; });
  }

  function appendMsg(txt, cls) {
    var m = document.getElementById('vg-m');
    var d = document.createElement('div');
    d.className = cls;
    d.textContent = txt;
    m.appendChild(d);
    m.scrollTop = m.scrollHeight;
  }
})();