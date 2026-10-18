// Piccoli aiuti per l'interfaccia (testi sicuri, toast, finestre di dialogo, animazioni)
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtPts = n => (n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : '0');
const fmtTime = iso => new Date(iso).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
const ptsClass = n => (n > 0 ? 'pos' : n < 0 ? 'neg' : '');
const medal = pos => ({ 1: '🥇', 2: '🥈', 3: '🥉' }[pos] || `${pos}°`);

function toast(msg, { actionText, onAction, duration = 4000 } = {}) {
  let wrap = document.getElementById('toasts');
  if (!wrap) { wrap = document.createElement('div'); wrap.id = 'toasts'; document.body.appendChild(wrap); }
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<span>${msg}</span>${actionText ? `<button type="button">${esc(actionText)}</button>` : ''}`;
  if (actionText) t.querySelector('button').onclick = () => { onAction?.(); t.remove(); };
  wrap.appendChild(t);
  setTimeout(() => t.classList.add('out'), duration);
  setTimeout(() => t.remove(), duration + 400);
}

// Finestra modale generica. Restituisce i valori del form, { __extra: true } o null se annullata.
function modal({ title, body = '', okText = 'OK', cancelText = 'Annulla', danger = false, extraText = null, onOpen }) {
  return new Promise(resolve => {
    const d = document.createElement('dialog');
    d.className = 'modal';
    d.innerHTML = `<form>
      <h3>${title}</h3>
      <div class="modal-body">${body}</div>
      <div class="modal-actions">
        ${extraText ? `<button type="button" class="btn btn-danger-ghost" data-act="extra">${extraText}</button>` : ''}
        <span class="spacer"></span>
        <button type="button" class="btn btn-ghost" data-act="cancel">${cancelText}</button>
        <button type="submit" class="btn ${danger ? 'btn-danger' : 'btn-primary'}">${okText}</button>
      </div></form>`;
    document.body.appendChild(d);
    const form = d.querySelector('form');
    let result = null;
    form.addEventListener('submit', e => { e.preventDefault(); result = Object.fromEntries(new FormData(form)); d.close(); });
    d.querySelector('[data-act=cancel]').onclick = () => d.close();
    d.querySelector('[data-act=extra]')?.addEventListener('click', () => { result = { __extra: true }; d.close(); });
    d.addEventListener('close', () => { d.remove(); resolve(result); });
    d.showModal();
    onOpen?.(d);
  });
}

const confirmBox = (title, text, okText = 'Conferma', danger = true) =>
  modal({ title, body: `<p class="muted">${text}</p>`, okText, danger }).then(r => r !== null);

// Simbolo dell'evento (es. 30, 🎂): le emoji non usano il testo sfumato
function badgeHtml(badge, cls) {
  const t = String(badge ?? '').trim() || '🎉';
  const emoji = !/[\p{L}\p{N}]/u.test(t);
  return `<div class="${cls}${emoji ? ' is-emoji' : ''}${!emoji && [...t].length > 2 ? ' long' : ''}">${esc(t)}</div>`;
}

// Selettore emoji a categorie; si può anche scrivere un'emoji qualsiasi dalla tastiera
function emojiPicker(selected, name, { maxlength = 16, placeholder = '' } = {}) {
  const cats = Object.entries(EMOJI);
  const start = Math.max(0, cats.findIndex(([, list]) => list.includes(selected)));
  return `<div class="emoji-picker">
    <input class="input emoji-input" name="${name}" maxlength="${maxlength}" required autocomplete="off" value="${esc(selected)}" placeholder="${esc(placeholder)}">
    <p class="hint">Scegli qui sotto oppure scrivi un'emoji dalla tastiera</p>
    <div class="emoji-tabs">${cats.map(([c, list], i) => `<button type="button" data-cat="${i}" class="${i === start ? 'on' : ''}" title="${c}">${list[0]}</button>`).join('')}</div>
    ${cats.map(([c, list], i) => `<div class="emoji-grid" data-grid="${i}" ${i === start ? '' : 'hidden'}>
      <div class="cat">${c}</div>
      ${list.map(e => `<button type="button" data-emo="${e}" class="${e === selected ? 'on' : ''}">${e}</button>`).join('')}</div>`).join('')}
  </div>`;
}

document.addEventListener('click', e => {
  const tab = e.target.closest('.emoji-tabs [data-cat]');
  const pick = e.target.closest('.emoji-grid [data-emo]');
  const root = (tab || pick)?.closest('.emoji-picker');
  if (!root) return;
  if (tab) {
    root.querySelectorAll('[data-cat]').forEach(b => b.classList.toggle('on', b === tab));
    root.querySelectorAll('.emoji-grid').forEach(g => { g.hidden = g.dataset.grid !== tab.dataset.cat; });
  } else {
    root.querySelector('.emoji-input').value = pick.dataset.emo;
    markEmoji(root);
  }
});
document.addEventListener('input', e => { if (e.target.matches('.emoji-input')) markEmoji(e.target.closest('.emoji-picker')); });
function markEmoji(root) {
  const v = root.querySelector('.emoji-input').value.trim();
  root.querySelectorAll('[data-emo]').forEach(b => b.classList.toggle('on', b.dataset.emo === v));
}

// Esplosione di emoji (per i bonus)
function burst(emojis, count = 18) {
  for (let i = 0; i < count; i++) {
    const p = document.createElement('span');
    p.className = 'particle';
    p.textContent = emojis[i % emojis.length];
    const angle = Math.random() * Math.PI * 2, dist = 120 + Math.random() * 160;
    p.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
    p.style.setProperty('--dy', `${Math.sin(angle) * dist - 60}px`);
    p.style.setProperty('--rot', `${Math.random() * 720 - 360}deg`);
    p.style.animationDelay = `${Math.random() * 120}ms`;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 1600);
  }
}
